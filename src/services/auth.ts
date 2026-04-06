/*
 * @Author: 桂佳囿
 * @Date: 2025-11-10 10:01:49
 * @LastEditors: 桂佳囿
 * @LastEditTime: 2026-04-06 13:37:55
 * @Description: 鉴权服务
 */

import { http } from "@/utils/http";
import type {
  AuthResponse,
  AuthTokens,
  LoginCaptchaResponse,
  LoginForm,
  RegisterForm,
} from "@/types/auth";

const API = {
  emailCode: "/auth/email-code",
  captcha: "/auth/captcha",
  register: "/auth/register",
  login: "/auth/login",
  refreshToken: "/auth/refresh",
};

export const sendRegisterEmailCode = (params: {
  email: string;
}): Promise<{ message: string }> => {
  return http.post(API.emailCode, params, { public: true });
};

export const getLoginCaptcha = (): Promise<LoginCaptchaResponse> => {
  return http.get(API.captcha, { public: true });
};

export const register = (params: RegisterForm): Promise<AuthResponse> => {
  return http.post(API.register, params, { public: true });
};

export const login = (params: LoginForm): Promise<AuthResponse> => {
  return http.post(API.login, params, { public: true });
};

export const refreshToken = (refreshToken: string): Promise<AuthTokens> => {
  return http.post(API.refreshToken, { refreshToken }, { public: true });
};
