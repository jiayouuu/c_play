/*
 * @Author: 桂佳囿
 * @Date: 2025-12-25 16:53:18
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2025-12-25 17:40:37
 * @Description: react-router-dom navigate 桥接
 */
import type { NavigateFunction } from "react-router-dom";

let navigator: NavigateFunction | null = null;

export const setNavigator = (navigate: NavigateFunction): void => {
  navigator = navigate;
};

export const navigate = (
  to: string,
  options?: { replace?: boolean; state?: any }
): void => {
  if (!navigator) {
    console.warn("[navigation] not ready");
    return;
  }
  navigator(to, options);
};
