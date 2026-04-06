/*
 * @Author: 桂佳囿
 * @Date: 2026-01-25 22:00:53
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-06 14:49:10
 * @Description: 自动刷新 Token 的 Hook
 */
import { useEffect, useState } from "react";
import { refreshToken as refreshTokenService } from "@/services/auth";
import { useTokenStore } from "@/stores/token";
import { isValidToken } from "@/utils/public";
import type { AuthTokens } from "@/types/auth";
import { useNavigate } from "react-router-dom";

// 10 分钟刷新一次
const REFRESH_INTERVAL = 10 * 60 * 1000;

/**
 * @description 自动刷新 Token 的 Hook
 * @returns {boolean} isReady - 是否初始化完成
 */
export const useAutoRefreshToken = (): boolean => {
  const { setTokens, clearToken } = useTokenStore();
  // 控制初始化完成状态
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  let refreshPromise: Promise<AuthTokens> | null = null;
  useEffect(() => {
    const fetchNewToken = async () => {
      const currentRefreshToken = useTokenStore.getState().refreshToken;
      // 如果没有 refreshToken，直接标记为 ready
      if (!isValidToken(currentRefreshToken)) {
        clearToken();
        setIsReady(true);
        return;
      }
      try {
        if (!refreshPromise) {
          refreshPromise = refreshTokenService(currentRefreshToken);
        }
        const { accessToken, refreshToken } = await refreshPromise;
        setTokens({ accessToken, refreshToken });
      } catch {
        clearToken();
        navigate("/auth/login", { replace: true });
      } finally {
        refreshPromise = null;
        setIsReady(true);
      }
    };

    // 组件挂载时立即尝试刷新一次，保证 Token 新鲜度
    void fetchNewToken();

    // 设置定时器
    const timer = setInterval(() => {
      const currentRefreshToken = useTokenStore.getState().refreshToken;
      if (!isValidToken(currentRefreshToken)) {
        clearToken();
        return;
      }
      if (!refreshPromise) {
        refreshPromise = refreshTokenService(currentRefreshToken);
      }
      refreshPromise
        .then(({ accessToken, refreshToken }) => {
          setTokens({ accessToken, refreshToken });
        })
        .catch(() => {
          clearToken();
          navigate("/auth/login", { replace: true });
        })
        .finally(() => {
          refreshPromise = null;
        });
    }, REFRESH_INTERVAL);

    // 清理定时器
    return () => clearInterval(timer);
  }, []);

  return isReady;
};
