import { type FC, useEffect, useMemo, useState, useTransition } from "react";
import { Form, Input, Button, Typography } from "antd";
import {
  SecurityScanOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { register, sendRegisterEmailCode } from "@/services/auth";
import type { RegisterForm } from "@/types/auth";
import { useNavigate, Link } from "react-router-dom";
import style from "./index.module.scss";
import classNames from "classnames/bind";
import { message } from "@/bridges/messageBridge";

const cx = classNames.bind(style);

type RegisterFormValues = RegisterForm & { confirmPassword: string };

const Register: FC = () => {
  const [form] = Form.useForm<RegisterFormValues>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);
  const [submitting, startSubmitTransition] = useTransition();
  const [sendingCode, startSendCodeTransition] = useTransition();

  const email = Form.useWatch("email", form);
  const canSendCode = useMemo(
    () => Boolean(email && /\S+@\S+\.\S+/.test(email) && countdown <= 0),
    [email, countdown],
  );

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    try {
      await form.validateFields(["email"]);
      if (!email) return;
      startSendCodeTransition(async () => {
        try {
          await sendRegisterEmailCode({ email });
          setCountdown(60);
          message.success("邮箱验证码已发送");
        } catch {
          return;
        }
      });
    } catch {
      return;
    }
  };

  const onFinish = (values: RegisterFormValues) => {
    startSubmitTransition(async () => {
      try {
        const { email, password, emailCode } = values;
        await register({ email, password, emailCode });
        message.success("注册成功，请登录");
        navigate("/auth/login", { replace: true });
      } catch {
        return;
      }
    });
  };

  return (
    <div className={cx("authContainer")}>
      <div className={cx("authForm")}>
        <h2>注册账号</h2>
        <Form
          form={form}
          name="register"
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
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>

          <div style={{ display: "flex", gap: 8 }}>
            <Form.Item
              name="emailCode"
              rules={[
                { required: true, message: "请输入邮箱验证码" },
                { len: 6, message: "验证码长度应为6位" },
              ]}
            >
              <Input
                prefix={<SecurityScanOutlined />}
                placeholder="邮箱验证码"
                maxLength={6}
              />
            </Form.Item>
            <Button
              htmlType="button"
              onClick={handleSendCode}
              disabled={!canSendCode || sendingCode}
              loading={sendingCode}
              style={{ width: "120px" }}
            >
              {countdown > 0 ? `${countdown}s` : "发送验证码"}
            </Button>
          </div>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少 6 位" },
              { max: 20, message: "密码最多 20 位" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请再次输入密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              注册
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text type="secondary">
          已有账号？<Link to="/auth/login">去登录</Link>
        </Typography.Text>
      </div>
    </div>
  );
};

export default Register;
