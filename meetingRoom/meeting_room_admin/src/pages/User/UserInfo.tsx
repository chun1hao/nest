import { Button, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { useCallback, useEffect } from "react";

import "./css/index.css";
import { getUserInfo, updateInfo, updateUserInfoCaptcha } from "../../http";

export interface IUserInfo {
  headPic: string;
  nickName: string;
  email: string;
  captcha: string;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export function UserInfo() {
  const [form] = useForm();
  const sendCaptcha = useCallback(async () => {
    const address = form.getFieldValue("email");
    if (!address) return message.error("邮箱不能为空");
    const res = await updateUserInfoCaptcha();
    if (res.status === 201 || res.status === 200) {
      message.success(res.data.data);
    } else {
      message.error("系统繁忙，请稍后再试");
    }
  }, []);
  const onFinish = useCallback(async (values: IUserInfo) => {
    const res = await updateInfo(values);

    if (res.status === 201 || res.status === 200) {
      const { message: msg, data } = res.data;
      if (msg === "success") {
        message.success("用户信息更新成功");
      } else {
        message.error(data);
      }
    } else {
      message.error("系统繁忙，请稍后再试");
    }
  }, []);

  useEffect(() => {
    async function query() {
      const res = await getUserInfo();

      const { data } = res.data;

      if (res.status === 201 || res.status === 200) {
        form.setFieldValue("headPic", data.headPic);
        form.setFieldValue("nickName", data.nickName);
        form.setFieldValue("email", data.email);
      }
    }
    query();
  }, []);
  return (
    <div id="updateInfo-container">
      <Form onFinish={onFinish} form={form} {...layout} colon={false}>
        <Form.Item
          label="头像"
          name="headPic"
          rules={[{ required: true, message: "请输入头像!" }]}
          shouldUpdate
        >
          <Input></Input>
        </Form.Item>

        <Form.Item
          label="昵称"
          name="nickName"
          rules={[{ required: true, message: "请输入昵称!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="邮箱" name="email">
          <Input disabled />
        </Form.Item>

        <div className="captcha-wrapper">
          <Form.Item
            label="验证码"
            name="captcha"
            rules={[{ required: true, message: "请输入验证码!" }]}
          >
            <Input />
          </Form.Item>
          <Button type="primary" onClick={sendCaptcha}>
            发送验证码
          </Button>
        </div>

        <Form.Item {...layout} label=" ">
          <Button className="btn" type="primary" htmlType="submit">
            修改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
