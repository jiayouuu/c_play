/*
 * @Author: 桂佳囿
 * @Date: 2025-12-23 20:51:48
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-01-26 00:52:55
 * @Description: 公共工具方法
 */

/**
 * @description: 生成 URLSearchParams 字符串
 * @param {Record} params - 参数对象
 * @return {*} {string} URLSearchParams 字符串
 */
export const genSearchParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

/**
 * @description: 解析 JWT
 * @param {string} token
 * @param {*} any
 * @return {*}
 */
export const parseJWT = (token: string): Record<string, any> | null => {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

  try {
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * @description: 判断是否已过期
 * @param {string} token
 * @return {*}
 */
export const isJWTExpired = (token: string): boolean => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
};

/**
 * @description: 判断 token 是否有效
 * @param {*} boolean
 * @return {*}
 */
export const isValidToken = (token: string): boolean => {
  if (!token) return false;
  try {
    const expired = isJWTExpired(token);
    return !expired;
  } catch {
    return false;
  }
};
