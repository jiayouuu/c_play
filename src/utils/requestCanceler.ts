/*
 * @Author: 桂佳囿
 * @Date: 2025-12-19 16:50:32
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2025-12-24 10:51:37
 * @Description: 请求取消器
 */
import { type AxiosRequestConfig } from "axios";
type RequestKey = string;

const pendingMap = new Map<RequestKey, AbortController>();

export const requestCanceler = {
  create(key: RequestKey) {
    // 如果已有同 key 请求，先取消
    this.cancel(key);

    const controller = new AbortController();
    pendingMap.set(key, controller);

    return controller;
  },

  cancel(key: RequestKey) {
    const controller = pendingMap.get(key);
    if (controller) {
      controller.abort();
      pendingMap.delete(key);
    }
  },

  cancelAll() {
    pendingMap.forEach((controller) => controller.abort());
    pendingMap.clear();
  },

  remove(key: RequestKey) {
    pendingMap.delete(key);
  },
};

/**
 * @description: 生成请求唯一 key
 * @param {AxiosRequestConfig} config 请求配置
 * @return {*}
 */
export const genRequestKey = (config: AxiosRequestConfig): RequestKey => {
  const { method, url } = config;
  return `${method}_${url}`;
};
