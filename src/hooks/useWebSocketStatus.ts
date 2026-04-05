import { useSyncExternalStore } from "react";
import {
  websocketService,
  type WebSocketConnectionStatus,
} from "@/utils/websocket.singleton";

export function useWebSocketStatus(): WebSocketConnectionStatus {
  return useSyncExternalStore(
    websocketService.subscribeConnectionStatus,
    () => websocketService.getConnectionStatus(),
    () => websocketService.getConnectionStatus(),
  );
}
