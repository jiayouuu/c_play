import { redirect } from "react-router-dom";
import { useTokenStore } from "@/stores/token";
import { useUserStore } from "@/stores/user";
import { isValidToken } from "@/utils/public";

/**
 * @description: 鉴权加载器
 * @return {*}
 */
export const authLoader = async (): Promise<any> => {
  const { accessToken, clearToken } = useTokenStore.getState();
  const { clearUser } = useUserStore.getState();
  if (!isValidToken(accessToken)) {
    clearToken();
    clearUser();
    throw redirect("/auth/login");
  }
  return null;
};
