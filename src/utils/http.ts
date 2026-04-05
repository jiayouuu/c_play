/*
 * @Author: 桂佳囿
 * @Date: 2025-07-14 09:24:21
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-05 11:33:55
 * @Description: HTTP 请求封装
 */

import axios from "axios";
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { useTokenStore } from "@/stores/token";
import { message } from "@/bridges/messageBridge";
import { requestCanceler, genRequestKey } from "@/utils/requestCanceler";
import { navigate } from "@/bridges/navigateBridge";
import type { ResponseData } from "@/types/response";

const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_HOST}${import.meta.env.VITE_API_PREFIX}`,
  timeout: 5000,
});

const defaultErrorMessage = "服务异常，请稍后重试";

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const key = config.cancelKey ?? genRequestKey(config);
    const controller = requestCanceler.create(key);
    config.signal = controller.signal;
    config.__requestKey = key;
    const { accessToken } = useTokenStore.getState();
    if (accessToken && !config.headers.Authorization && !config.public) {
      config.headers!.Authorization = accessToken;
    }
    return config;
  },
  (error) => {
    console.error(error);
    return Promise.reject(error);
  },
);

http.interceptors.response.use(
  (response: AxiosResponse<ResponseData>) => {
    const { clearToken } = useTokenStore.getState();
    const key = response.config.__requestKey;
    if (key) requestCanceler.remove(key);
    const { code, msg, data } = response.data;
    if (code === 401) {
      message.error("登录状态已过期，请重新登录");
      requestCanceler.cancelAll();
      clearToken();
      navigate("/auth/login", { replace: true });
      return Promise.reject(response.data);
    }
    if (!(200 <= code && code < 300)) {
      message.error(msg || defaultErrorMessage);
      return Promise.reject(response.data);
    }
    return data;
  },
  (error: AxiosError) => {
    const { clearToken } = useTokenStore.getState();
    const key = error.config?.__requestKey;
    if (key) requestCanceler.remove(key);
    // 被取消的请求
    if (error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }
    // 未授权，跳转登录
    if (error.status === 401) {
      message.error("登录状态已过期，请重新登录");
      requestCanceler.cancelAll();
      clearToken();
      navigate("/auth/login", { replace: true });
      return Promise.reject(error);
    }
    message.error(defaultErrorMessage);
    return Promise.reject(error);
  },
);

export { http };
