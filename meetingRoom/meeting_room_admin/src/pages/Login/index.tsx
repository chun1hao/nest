import { Button, Form, Input, message } from "antd";
import { useCallback } from "react";
import "./index.css";
import { login } from "../../http";
import { useNavigate } from "react-router-dom";

export interface LoginInfo {
  username: string;
  password: string;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

export function Login() {
  const navigate = useNavigate();

  const onFinish = useCallback(async (values: LoginInfo) => {
    const res = await login(values.username, values.password);
    const { data } = res.data;
    if (res.status === 201 || res.status === 200) {
      message.success("登录成功");
      localStorage.setItem("access_token", data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
      localStorage.setItem("user_info", JSON.stringify(data.userInfo));

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      message.error(res.data.data || "登录失败");
    }
  }, []);

  return (
    <div id="login-container">
      <h1>后台管理</h1>
      <Form {...layout} onFinish={onFinish} autoComplete="off" colon={false}>
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: "请输入用户名!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入密码!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item label=" ">
          <Button className="btn" type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
