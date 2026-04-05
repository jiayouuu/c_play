/*
 * @Author: 桂佳囿
 * @Date: 2025-12-25 17:47:45
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-01-25 23:15:14
 * @Description: 加密存储封装
 */
import { encryptAES, decryptAES } from "@/utils/crypto";

export const encStorage = {
  setItem: (key: string, value: string) => {
    const encryptedValue = encryptAES(value);
    localStorage.setItem(key, encryptedValue);
  },
  getItem: (key: string): string | null => {
    const encryptedValue = localStorage.getItem(key);
    if (encryptedValue) {
      return decryptAES(encryptedValue);
    }
    return null;
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
};
