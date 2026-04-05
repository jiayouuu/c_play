/*
 * @Author: 桂佳囿
 * @Date: 2025-07-11 23:09:48
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-04 20:33:41
 * @Description: 用户状态管理
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { encStorage } from "@/utils/encStorage";
import type { UserInfo } from "@/types/user";

interface UserState {
  user: UserInfo;
  setUser: (user: Partial<UserInfo>) => void;
  clearUser: () => void;
}
const isProd = import.meta.env.PROD;
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: {} as UserInfo,

      getUser: () => get().user,

      setUser: (payload) =>
        set((state) => ({
          user: {
            ...state.user,
            ...payload,
          },
        })),
      clearUser: () => set({ user: {} as UserInfo }),
    }),
    {
      name: "userInfo",
      storage: createJSONStorage(() => (isProd ? encStorage : localStorage)),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
