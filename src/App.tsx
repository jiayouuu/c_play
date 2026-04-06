/*
 * @Author: 桂佳囿
 * @Date: 2025-07-11 22:11:42
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-06 15:44:04
 * @Description: 应用根组件
 */

import { Outlet } from "react-router-dom";
import { NavigateProvider } from "@/providers/NavigateProvider";
import { useEffect } from "react";
import { websocketService } from "@/utils/websocket.singleton";
import { useAutoRefreshToken } from "@/hooks/useAutoRefreshToken";
import { useSystemTheme } from "@/hooks/useSystemTheme";
import { useTokenStore } from "@/stores/token";
import { FullSpin } from "@/components/fullSpin";

const App = () => {
  const { accessToken } = useTokenStore();
  // 监听 accessToken 变化，更新 WebSocket 连接
  useEffect(() => {
    websocketService.setTokenProvider(() => accessToken);
    websocketService.updateToken();
    websocketService.connect();
    return () => {
      websocketService.disconnect();
    };
  }, [accessToken]);
  // 自动刷新 token
  const isReady = useAutoRefreshToken();
  // 监听系统主题变化
  const [systemTheme] = useSystemTheme("system");
  // 根据系统主题设置全局样式
  useEffect(() => {
    document.documentElement.dataset.theme = systemTheme;
  }, [systemTheme]);
  return (
    <NavigateProvider>{isReady ? <Outlet /> : <FullSpin />}</NavigateProvider>
  );
};

export default App;
