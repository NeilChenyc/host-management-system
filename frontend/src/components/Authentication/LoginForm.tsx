"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Checkbox,
  Divider,
  Alert,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthManager from "@/lib/auth";

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  onLogin?: (data: LoginFormData) => void;
  loading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading = false }) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  // New: Used to display "login failed" error message. If null, no message is displayed
  const [loginError, setLoginError] = useState<string | null>(null);

  // Message API for React 19 compatibility
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  /**
   * Handle login form submission
   * - Clear old error messages (if any)
   * - Call AuthManager.login to perform login
   * - Display success or failure messages based on the result
   * - On failure, display a prominent error Alert above the form in addition to the top-right message notification
   */
  const handleSubmit = async (values: LoginFormData) => {
    setIsLoading(true);
    // Clear previous error messages on each submission to avoid displaying old errors
    setLoginError(null);
    try {
      await AuthManager.login(values.username, values.password);

      messageApi.success("Login successful!");

      // Debug token saved (use correct key via helper)
      const savedToken = AuthManager.getToken();
      console.log("Login successful - Token saved:", savedToken ? "YES" : "NO");
      console.log("Token length:", savedToken?.length);

      if (onLogin) {
        onLogin(values);
      }

      // Redirect to main page using Next.js router
      router.push("/");
    } catch (error) {
      // Caught exception (e.g., network error or server exception)
      setLoginError(
        "Login failed due to a network or server error. Please try again."
      );
      messageApi.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      {/* If login error exists, display a prominent error alert above the form */}
      {loginError && (
        <Alert
          type="error"
          showIcon
          message={loginError}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: "Please input your username!" },
            { min: 3, message: "Username must be at least 3 characters!" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        {/* <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link href="/auth/forgot-password" style={{ color: '#1890ff' }}>
                Forgot password?
              </Link>
            </div>
          </Form.Item> */}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading || loading}
            style={{ width: "100%", height: "40px" }}
          >
            Sign In
          </Button>
        </Form.Item>

        {/* <Divider>Or</Divider> */}

        {/* <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#666' }}>Don ot have an account? </span>
            <Link href="/auth/register" style={{ color: '#1890ff', fontWeight: 'medium' }}>
              Sign up now
            </Link>
          </div> */}
      </Form>

      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "12px",
          color: "#999",
        }}
      >
        <p>Demo Mode: Enter any username and password to login</p>
      </div>
    </div>
  );
};

export default LoginForm;
