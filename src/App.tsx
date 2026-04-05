/*
 * @Author: 桂佳囿
 * @Date: 2025-07-11 22:11:42
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-05 11:29:40
 * @Description: 应用根组件
 */

import { Outlet } from "react-router-dom";
import { NavigateProvider } from "@/providers/NavigateProvider";
import { useEffect } from "react";
import { websocketService } from "@/utils/websocket.singleton";
import { useTokenStore } from "@/stores/token";

const App = () => {
  const { accessToken } = useTokenStore();
  useEffect(() => {
    websocketService.setTokenProvider(() => accessToken);
    websocketService.updateToken();
    websocketService.connect();
    return () => {
      websocketService.disconnect();
    };
  }, [accessToken]);
  return (
    <NavigateProvider>
      <Outlet />
    </NavigateProvider>
  );
};

export default App;
