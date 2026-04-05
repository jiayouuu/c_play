/*
 * @Author: 桂佳囿
 * @Date: 2025-07-20 01:53:10
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2025-12-22 09:41:44
 * @Description: 路由配置
 */
import { createBrowserRouter } from "react-router-dom";
import { routes } from "@/router/routes";

const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_ROUTE_BASE,
});

export default router;
