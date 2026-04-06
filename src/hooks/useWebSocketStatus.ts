/*
 * @Author: 桂佳囿
 * @Date: 2026-04-04 11:33:20
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-06 10:45:13
 * @Description: 监听 WebSocket 连接状态的 Hook
 */
import { useSyncExternalStore } from "react";
import {
  websocketService,
  type WebSocketConnectionStatus,
} from "@/utils/websocket.singleton";

/**
 * @description:  监听 WebSocket 连接状态的 Hook，返回当前连接状态
 * @return {WebSocketConnectionStatus} connectionStatus - 当前 WebSocket 连接状态
 */
export const useWebSocketStatus = (): WebSocketConnectionStatus => {
  return useSyncExternalStore(
    websocketService.subscribeConnectionStatus,
    () => websocketService.getConnectionStatus(),
    () => websocketService.getConnectionStatus(),
  );
};
