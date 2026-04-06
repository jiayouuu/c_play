/*
 * @Author: 桂佳囿
 * @Date: 2026-04-04 16:59:56
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-06 23:35:28
 * @Description: websocket 工具类单例
 */
import {
  RxStomp,
  RxStompState,
  type IMessage,
  type StompHeaders,
} from "@stomp/rx-stomp";
import {
  BehaviorSubject,
  Observable,
  filter,
  firstValueFrom,
  timeout,
} from "rxjs";

export type WebSocketPhase =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnecting"
  | "disconnected"
  | "reconnect_failed";

export interface WebSocketConnectionStatus {
  phase: WebSocketPhase;
  attempts: number;
  maxReconnectAttempts: number;
  lastError?: string;
  updatedAt: number;
}

interface SubscribeOptions {
  destination: string;
  callback: (message: IMessage) => void;
  signal?: AbortSignal;
}

type TokenProvider = () => string | null;

const DEFAULT_STATUS: WebSocketConnectionStatus = {
  phase: "idle",
  attempts: 0,
  maxReconnectAttempts: 5,
  updatedAt: Date.now(),
};

export class WebSocketService {
  private static instance: WebSocketService;
  private client: RxStomp;
  private connectPromise: Promise<void> | null = null;
  private disconnectPromise: Promise<void> | null = null;
  private hasConnectedOnce = false;
  private attempts = 0;
  private manualDisconnecting = false;
  private readonly maxReconnectAttempts = 5;
  private tokenProvider: TokenProvider = () => null;

  private readonly statusSubject =
    new BehaviorSubject<WebSocketConnectionStatus>({
      ...DEFAULT_STATUS,
      maxReconnectAttempts: this.maxReconnectAttempts,
    });

  private constructor() {
    this.client = new RxStomp();
    const wsUrl = import.meta.env.VITE_WS_HOST;
    this.client.configure({
      beforeConnect: async () => {
        const token = this.getCurrentToken();
        if (!token) {
          throw new Error("No token provided");
        }
        const authToken = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        this.client.configure({
          connectHeaders: {
            Authorization: authToken,
            token,
          },
          webSocketFactory: () =>
            new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`),
        });
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 10000,
      discardWebsocketOnCommFailure: true,
      debug: import.meta.env.MODE === "development" ? console.log : () => {},
    });

    this.bindLifecycle();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  get connectionStatus$(): Observable<WebSocketConnectionStatus> {
    return this.statusSubject.asObservable();
  }

  getConnectionStatus(): WebSocketConnectionStatus {
    return this.statusSubject.value;
  }

  setTokenProvider(tokenProvider: TokenProvider): void {
    this.tokenProvider = tokenProvider;
  }

  subscribeConnectionStatus = (
    listener: (status: WebSocketConnectionStatus) => void,
  ): (() => void) => {
    const subscription = this.connectionStatus$.subscribe(listener);
    return () => subscription.unsubscribe();
  };

  watch(destination: string): Observable<IMessage> {
    return this.client.watch(destination);
  }

  subscribe(options: Omit<SubscribeOptions, "signal">): AbortController;
  subscribe(options: SubscribeOptions): void;
  subscribe(options: SubscribeOptions): AbortController | void {
    const { destination, callback } = options;
    let { signal } = options;

    let controller: AbortController | undefined;
    if (!signal) {
      controller = new AbortController();
      signal = controller.signal;
    }

    const subscription = this.watch(destination).subscribe(callback);

    const abortHandler = () => {
      subscription.unsubscribe();
    };

    if (signal.aborted) {
      abortHandler();
    } else {
      signal.addEventListener("abort", abortHandler, { once: true });
    }

    return controller;
  }

  async connect(): Promise<void> {
    if (this.disconnectPromise) {
      await this.disconnectPromise;
    }

    if (this.client.connected()) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    if (!this.getCurrentToken()) {
      throw new Error("No token provided");
    }

    this.manualDisconnecting = false;
    this.updateStatus("connecting");

    if (!this.client.active) {
      this.client.activate();
    }

    this.connectPromise = firstValueFrom(
      this.client.connectionState$.pipe(
        filter((state) => state === RxStompState.OPEN),
        timeout(15000),
      ),
    )
      .then(() => {
        this.connectPromise = null;
      })
      .catch((error) => {
        this.connectPromise = null;
        throw error;
      });

    return this.connectPromise;
  }

  async disconnect(): Promise<void> {
    if (this.disconnectPromise) {
      return this.disconnectPromise;
    }

    if (!this.client.active && !this.client.connected()) {
      this.updateStatus("disconnected", { attempts: 0 });
      return;
    }

    this.manualDisconnecting = true;
    this.updateStatus("disconnecting");
    this.connectPromise = null;
    this.disconnectPromise = this.client.deactivate().finally(() => {
      this.disconnectPromise = null;
    });
    await this.disconnectPromise;
  }

  async updateToken(): Promise<void> {
    if (!this.client.active) {
      return;
    }

    await this.disconnect();
    await this.connect();
  }

  send(destination: string, body: unknown, headers: StompHeaders = {}): void {
    if (!this.client.connected()) {
      throw new Error("WebSocket not connected");
    }

    this.client.publish({
      destination,
      headers,
      body: JSON.stringify(body),
    });
  }

  private getCurrentToken(): string | null {
    return this.tokenProvider();
  }

  private bindLifecycle(): void {
    this.client.connectionState$.subscribe((state) => {
      switch (state) {
        case RxStompState.CONNECTING: {
          const nextAttempt = this.attempts + 1;
          if (nextAttempt > this.maxReconnectAttempts) {
            this.attempts = this.maxReconnectAttempts;
            this.updateStatus("reconnect_failed", {
              attempts: this.maxReconnectAttempts,
            });
            void this.client.deactivate();
            return;
          }

          this.attempts = nextAttempt;
          const phase =
            this.hasConnectedOnce || this.attempts > 1
              ? "reconnecting"
              : "connecting";
          this.updateStatus(phase);
          break;
        }

        case RxStompState.OPEN:
          this.hasConnectedOnce = true;
          this.attempts = 0;
          this.updateStatus("connected", { lastError: undefined });
          break;

        case RxStompState.CLOSING:
          if (this.statusSubject.value.phase === "reconnect_failed") {
            break;
          }
          this.updateStatus("disconnecting");
          break;

        case RxStompState.CLOSED:
          if (this.statusSubject.value.phase === "reconnect_failed") {
            break;
          }
          if (this.manualDisconnecting) {
            this.manualDisconnecting = false;
            this.attempts = 0;
            this.updateStatus("disconnected", { lastError: undefined });
          } else if (this.client.active) {
            this.updateStatus("reconnecting");
          } else {
            this.updateStatus("disconnected");
          }
          break;
      }
    });

    this.client.webSocketErrors$.subscribe((error) => {
      if (this.statusSubject.value.phase === "reconnect_failed") {
        return;
      }
      const message =
        error instanceof Error ? error.message : "WebSocket error";
      this.updateStatus(this.hasConnectedOnce ? "reconnecting" : "connecting", {
        lastError: message,
      });
    });

    this.client.stompErrors$.subscribe((frame) => {
      if (this.statusSubject.value.phase === "reconnect_failed") {
        return;
      }
      this.updateStatus(this.hasConnectedOnce ? "reconnecting" : "connecting", {
        lastError: frame.headers["message"] || "Broker error",
      });
    });
  }

  private updateStatus(
    phase: WebSocketPhase,
    patch: Partial<WebSocketConnectionStatus> = {},
  ): void {
    this.statusSubject.next({
      ...this.statusSubject.value,
      ...patch,
      phase,
      attempts: patch.attempts ?? this.attempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      updatedAt: Date.now(),
    });
  }
}

export const websocketService = WebSocketService.getInstance();
