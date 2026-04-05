export interface RegisterForm {
  email: string;
  password: string;
  emailCode: string;
}

export interface LoginForm {
  email: string;
  password: string;
  captchaCode: string;
  captchaId: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  role: string;
  createdTime?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface LoginCaptchaResponse {
  captchaId: string;
  captchaImage: string;
  expiresIn: number;
}
