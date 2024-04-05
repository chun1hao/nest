/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Input, Popconfirm, Space, Table, TableProps, Tag, message } from "antd";
import { Form } from "antd";
import styles from "./room.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { deleteMeetingRoom, getRoomList } from "../../http";
import { useForm } from "antd/es/form/Form";
import { RoomModal } from "./roomModal";
import { UpdateRoomModal } from "./updateRoom";

export interface searchForm {
  name: string;
  capacity: string;
  location: string;
  equipment: string;
}

export interface RoomDateType {
  id: number;
  name: string;
  capacity: number;
  location: string;
  equipment: string;
  description: string;
  isBooked: boolean;
  createTime: Date;
  updateTime: Date;
}

export function Room() {
  const [form] = useForm();

  const [pageNo, setPageNo] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [listNum, setListNum] = useState<number>(0);
  const [roomList, setRoomList] = useState<RoomDateType[]>([]);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [updateModalShow, setUpdateShow] = useState<boolean>(false);
  const [selectRoom, setSelectRoom] = useState<RoomDateType>();

  const columns: TableProps<RoomDateType>["columns"] = useMemo(
    () => [
      {
        key: "1",
        title: "名称",
        dataIndex: "name",
      },
      {
        title: "容纳人数",
        dataIndex: "capacity",
        key: "2",
      },
      {
        title: "位置",
        dataIndex: "location",
        key: "3",
      },
      {
        title: "设备",
        dataIndex: "equipment",
        key: "4",
        render: (_, record) => {
          return record.equipment.split(",").map((item) => <Tag color="orange">{item}</Tag>);
        },
      },
      {
        title: "描述",
        dataIndex: "description",
        key: "5",
      },
      {
        title: "添加时间",
        dataIndex: "createTime",
        key: "6",
        render: (_, record) => {
          return dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        title: "上次更新时间",
        dataIndex: "updateTime",
        key: "7",
        render: (_, record) => {
          return dayjs(record.updateTime).format("YYYY-MM-DD HH:mm:ss");
        },
      },
      {
        title: "预定状态",
        dataIndex: "isBooked",
        key: "8",
        render: (_, record) =>
          record.isBooked ? <Tag color="red">不可预定</Tag> : <Tag color="green">可以预定</Tag>,
      },
      {
        title: "操作",
        key: "9",
        render: (_, record) => (
          <Space>
            <Popconfirm
              title="提示"
              description="是否删除该会议室"
              onConfirm={() => handleDelete(record.id)}
              okText="删除"
              cancelText="取消"
            >
              <Button danger type="primary" size="small">
                删除
              </Button>
            </Popconfirm>

            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectRoom(record);
                setUpdateShow(true);
              }}
            >
              更新
            </Button>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onFinish = (values: searchForm) => {
    searchList(values, true);
  };

  const searchList = async (values: searchForm, reset = false) => {
    reset && setPageNo(1);
    const res = await getRoomList({ pageNo, pageSize, ...values });
    const { data } = res.data;
    if (res.status === 201 || res.status === 200) {
      setRoomList(data.roomList);
      setListNum(data.roomCount);
    } else {
      message.error(data || "系统繁忙，请稍后再试");
    }
  };

  const changePage = useCallback((pageNo: number, pageSize: number) => {
    setPageNo(pageNo);
    setPageSize(pageSize);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMeetingRoom(id);
      message.success("删除成功");
      searchList({
        name: form.getFieldValue("name"),
        capacity: form.getFieldValue("capacity"),
        equipment: form.getFieldValue("equipment"),
        location: form.getFieldValue("location"),
      });
    } catch (e) {
      console.log(e);
      message.error("删除失败");
    }
  }, []);
  const initList = () => {
    searchList({
      name: form.getFieldValue("name"),
      capacity: form.getFieldValue("capacity"),
      equipment: form.getFieldValue("equipment"),
      location: form.getFieldValue("location"),
    });
  };
  const handleModalClose = () => {
    initList();
    setModalShow(false);
  };
  const handleModalClose1 = () => {
    initList();
    setUpdateShow(false);
  };

  useEffect(() => {
    searchList({
      name: form.getFieldValue("name"),
      capacity: form.getFieldValue("capacity"),
      equipment: form.getFieldValue("equipment"),
      location: form.getFieldValue("location"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo, pageSize]);

  return (
    <div className={styles.roomContainer}>
      <Form
        labelCol={{ flex: "100px" }}
        wrapperCol={{ flex: "180px" }}
        colon={false}
        layout="inline"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item label="会议室名称" name="name">
          <Input></Input>
        </Form.Item>
        <Form.Item label="容纳人数" name="capacity">
          <Input></Input>
        </Form.Item>
        <Form.Item label="位置" name="location">
          <Input></Input>
        </Form.Item>
        <Form.Item label="设备" name="equipment">
          <Input></Input>
        </Form.Item>
        <Form.Item label=" " wrapperCol={{ span: 24 }} className={styles.btns}>
          <Space>
            <Button type="primary" htmlType="submit">
              搜索会议室
            </Button>
            <Button onClick={() => setModalShow(true)}>添加会议室</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table
        columns={columns}
        dataSource={roomList}
        rowKey={(record) => record.name}
        pagination={{
          current: pageNo,
          pageSize: pageSize,
          total: listNum,
          onChange: changePage,
        }}
      />
      <RoomModal isOpen={modalShow} handleClose={handleModalClose} />
      <UpdateRoomModal
        isOpen={updateModalShow}
        handleClose={handleModalClose1}
        roomInfo={selectRoom!}
      />
    </div>
  );
}
