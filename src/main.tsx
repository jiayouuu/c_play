/*
 * @Author: 桂佳囿
 * @Date: 2025-07-11 22:11:42
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-01-08 10:14:07
 * @Description: 应用入口文件
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "@/router";
import { AntdProvider } from "@/providers/AntdAppProvider";
import "@/assets/index.scss";

if (import.meta.env.VITE_ENABLE_UPDATE) {
  import("@/utils/update").then((mod) => {
    mod.start(60 * 1000, 10 * 60 * 1000);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AntdProvider>
      <RouterProvider router={router} />
    </AntdProvider>
  </StrictMode>
);
