import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { encStorage } from "@/utils/encStorage";

interface TokenState {
  accessToken: string;
  refreshToken: string;
  setTokens: (payload: { accessToken: string; refreshToken: string }) => void;
  setAccessToken: (accessToken: string) => void;
  clearToken: () => void;
}

const isProd = import.meta.env.PROD;
export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      accessToken: "",
      refreshToken: "",
      setTokens: ({ accessToken, refreshToken }) =>
        set({
          accessToken,
          refreshToken,
        }),
      setAccessToken: (accessToken) =>
        set({
          accessToken,
        }),
      clearToken: () => set({ accessToken: "", refreshToken: "" }),
    }),
    {
      name: "token",
      storage: createJSONStorage(() => (isProd ? encStorage : localStorage)),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
