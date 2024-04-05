import { InfoCircleOutlined } from "@ant-design/icons";
import { Form, Input, InputNumber, Modal, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { createMeetingRoom } from "../../http";

interface IRoomModal {
  isOpen: boolean;
  handleClose: Function;
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export interface CreateMeetingRoom {
  name: string;
  capacity: number;
  location: string;
  equipment: string;
  description: string;
}

export const RoomModal: React.FC<IRoomModal> = ({ isOpen, handleClose }) => {
  const [form] = useForm();

  const handleOk = async () => {
    const values = form.getFieldsValue();
    values.description = values.description || "";
    values.equipment = values.equipment || "";

    const res = await createMeetingRoom(values);

    if (res.status === 201 || res.status === 200) {
      message.success("创建成功");
      form.resetFields();
      handleClose();
    } else {
      message.error(res.data.data);
    }
  };

  return (
    <>
      <Modal
        title="创建会议室"
        open={isOpen}
        onOk={handleOk}
        onCancel={() => handleClose()}
        okText={"创建"}
        cancelText={"取消"}
      >
        <Form {...layout} form={form} colon={false}>
          <Form.Item
            label="会议室名称"
            name="name"
            rules={[{ required: true, message: "请输入会议室名称" }]}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label="位置"
            name="location"
            rules={[{ required: true, message: "请输入会议室名称" }]}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label="容纳人数"
            name="capacity"
            rules={[{ required: true, message: "请输入会议室容纳人数" }]}
          >
            <InputNumber></InputNumber>
          </Form.Item>
          <Form.Item
            label="设备"
            name="equipment"
            tooltip={{ title: "多个设备用,隔开", icon: <InfoCircleOutlined /> }}
            rules={[{ required: true, message: "请输入会议室设备" }]}
          >
            <Input></Input>
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: "请输入会议室描述" }]}
          >
            <Input></Input>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
