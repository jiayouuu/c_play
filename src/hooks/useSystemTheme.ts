/*
 * @Author: 桂佳囿
 * @Date: 2026-04-06 10:41:07
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-06 15:47:21
 * @Description: 系统主题 Hook
 */
import { useEffect, useState } from "react";
type Mode = "light" | "dark" | "system";
type Theme = "light" | "dark";

/**
 * @description: 监听系统主题变化的 Hook，返回当前主题和设置主题的函数
 * @param {Mode} mode - 初始模式，默认为 "system"
 * @return {[Theme, (mode: Mode) => void]} - 当前主题和设置主题的函数
 */
export const useSystemTheme = (
  mode: Mode = "system",
): [Theme, (mode: Mode) => void] => {
  const [theme, __setTheme] = useState<Theme>("light");
  const [__mode, setMode] = useState<Mode>(mode);
  useEffect(() => {
    if (__mode === "light" || __mode === "dark") {
      __setTheme(__mode);
      return;
    }
    const abortController = new AbortController();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    // 初始设置
    __setTheme(mediaQuery.matches ? "light" : "dark");
    // 监听变化
    mediaQuery.addEventListener(
      "change",
      (event: MediaQueryListEvent) => {
        __setTheme(event.matches ? "light" : "dark");
      },
      { signal: abortController.signal },
    );

    // 清理监听器
    return () => {
      abortController?.abort();
    };
  }, [__mode]);

  return [theme, setMode];
};
