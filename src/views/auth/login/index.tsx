import { type FC, useEffect, useState, useTransition } from "react";
import { Form, Input, Button, Typography } from "antd";
import { message } from "@/bridges/messageBridge";
import { useNavigate, Link } from "react-router-dom";
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { getLoginCaptcha, login } from "@/services/auth";
import { useTokenStore } from "@/stores/token";
import { useUserStore } from "@/stores/user";
import type { LoginForm } from "@/types/auth";
import style from "./index.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(style);

type LoginFormValues = Omit<LoginForm, "captchaId">;

const Login: FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginFormValues>();
  const setTokens = useTokenStore((s) => s.setTokens);
  const setUser = useUserStore((s) => s.setUser);
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaId, setCaptchaId] = useState("");
  const [captchaExpiresIn, setCaptchaExpiresIn] = useState(0);
  const [submitting, startSubmitTransition] = useTransition();

  const loadCaptcha = async () => {
    const {
      captchaId: nextId,
      captchaImage: nextImage,
      expiresIn,
    } = await getLoginCaptcha();
    setCaptchaId(nextId);
    setCaptchaImage(nextImage);
    setCaptchaExpiresIn(expiresIn);
    form.setFieldValue("captchaCode", "");
  };

  const loadCaptchaSafely = async () => {
    try {
      await loadCaptcha();
    } catch {
      return;
    }
  };

  useEffect(() => {
    void loadCaptchaSafely();
  }, []);

  useEffect(() => {
    if (!captchaExpiresIn || captchaExpiresIn <= 0) return;
    const timer = window.setTimeout(() => {
      void loadCaptchaSafely();
    }, captchaExpiresIn * 1000);
    return () => window.clearTimeout(timer);
  }, [captchaId, captchaExpiresIn]);

  const onFinish = (values: LoginFormValues) => {
    startSubmitTransition(async () => {
      if (!captchaId) {
        await loadCaptchaSafely();
        return;
      }
      try {
        const { user, accessToken, refreshToken } = await login({
          ...values,
          captchaId,
        });
        setTokens({ accessToken, refreshToken });
        setUser(user);
        message.success("登录成功");
        navigate("/", { replace: true });
      } catch {
        await loadCaptchaSafely();
      }
    });
  };

  return (
    <div className={cx("authContainer")}>
      <div className={cx("authForm")}>
        <h2>欢迎登录</h2>
        <Form
          form={form}
          name="passwordLogin"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效邮箱地址" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              {
                min: 6,
                message: "密码至少6个字符",
              },
              {
                max: 20,
                message: "密码最多20个字符",
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <div style={{ display: "flex", gap: "8px" }}>
            <Form.Item
              name="captchaCode"
              rules={[
                { required: true, message: "请输入验证码！" },
                {
                  len: 4,
                  message: "验证码长度应为4位",
                },
              ]}
            >
              <Input
                prefix={<SafetyCertificateOutlined />}
                placeholder="图形验证码"
              />
            </Form.Item>
            <button
              type="button"
              onClick={() => void loadCaptchaSafely()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  void loadCaptchaSafely();
                }
              }}
              style={{
                width: "120px",
                height: "40px",
                cursor: "pointer",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f5f5f5",
                overflow: "hidden",
              }}
            >
              {captchaImage ? (
                <img
                  src={captchaImage}
                  alt="captcha"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Typography.Text type="secondary">
                  加载验证码中...
                </Typography.Text>
              )}
            </button>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text type="secondary">
          还没有账号？<Link to="/auth/register">立即注册</Link>
        </Typography.Text>
      </div>
    </div>
  );
};

export default Login;
