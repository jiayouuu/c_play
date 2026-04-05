/*
 * @Author: 桂佳囿
 * @Date: 2025-12-12 13:56:36
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-04 20:11:33
 * @Description: 路由配置
 */
import App from "@/App";
import { lazyLoad } from "@/components/LazyLoad";
import AppLayout from "@/components/layout";
import { type RouteObject, Navigate } from "react-router-dom";
import { authLoader } from "@/router/loaders/authLoader";

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        element: <AppLayout />,
        loader: authLoader,
        children: [
          {
            index: true,
            element: <Navigate to="/websocket" replace />,
          },
          {
            path: "websocket",
            element: lazyLoad(() => import("@/views/websocket")),
          },
        ],
      },
      {
        path: "auth/login",
        element: lazyLoad(() => import("@/views/auth/login")),
      },
      {
        path: "auth/register",
        element: lazyLoad(() => import("@/views/auth/register")),
      },
    ],
  },
  {
    path: "*",
    loader: authLoader,
    element: lazyLoad(() => import("@/views/notFound")),
  },
];
