/*
 * @Author: 桂佳囿
 * @Date: 2025-12-19 16:12:12
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2025-12-22 09:39:07
 * @Description: message 桥接器
 */
import type { MessageInstance } from "antd/es/message/interface";

let messageApi: MessageInstance | null = null;

export const messageBridge = {
  set(api: MessageInstance) {
    messageApi = api;
  },
};

type MessageMethod = {
  [K in keyof MessageInstance]: MessageInstance[K] extends (
    ...args: infer A
  ) => infer R
    ? (...args: A) => R
    : never;
};

export const message = new Proxy({} as MessageMethod, {
  get(_, prop: keyof MessageMethod) {
    return (...args: Parameters<MessageMethod[typeof prop]>) => {
      if (!messageApi) {
        console.warn("[message] not ready");
        return;
      }
      const fn = messageApi[prop] as any;
      return fn?.(...args);
    };
  },
});
