import {
  Button,
  Form,
  Input,
  DatePicker,
  GetProps,
  Table,
  type TableProps,
  Typography,
  Tag,
  message,
  Popconfirm,
} from "antd";
import "./index.css";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { RoomDateType } from "../Room/room";
import { UserSearchResult } from "../Home/UserManage";
import { changeBookingStatus, searchBooking } from "../../http";

type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;

export type searchParams = {
  userName: number;
  meetingRoomName: string;
  meetingRoomPosition: string;
  startTime: Date;
};

type DataType = {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  note: string;
  createTime: string;
  updateTime: string;
  user: UserSearchResult;
  room: RoomDateType;
};

enum StatusEnum {
  "申请中" = 1,
  "审批通过",
  "审批驳回",
  "已解除",
}

const { RangePicker } = DatePicker;
const { Paragraph } = Typography;

const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

const disabledDate: RangePickerProps["disabledDate"] = (current) => {
  return current && current < dayjs().startOf("day");
};

const disabledRangeTime: RangePickerProps["disabledTime"] = (_, type) => {
  if (type === "start") {
    return {
      disabledHours: () => range(0, 24).slice(0, dayjs().hour()),
      disabledMinutes: () => range(0, 60).slice(0, dayjs().minute()),
    };
  }
  return {
    disabledHours: () => range(0, 24).slice(0, dayjs().hour()),
    disabledMinutes: () => range(0, 60).slice(0, dayjs().minute()),
  };
};

export function Booking() {
  const [pageNo, setPageNo] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [bookingSearchResult, setBookingSearchResult] = useState<Array<DataType>>([]);
  const [num, setNum] = useState(1);

  const columns: TableProps<DataType>["columns"] = useMemo(() => {
    return [
      {
        title: "会议室名称",
        dataIndex: "room",
        render(_, record) {
          return (
            <Paragraph copyable={{ tooltips: ["复制", "复制成功"] }}>{record.room.name}</Paragraph>
          );
        },
      },
      {
        title: "会议室位置",
        dataIndex: "room",
        render(_, record) {
          return record.room.location;
        },
      },
      {
        title: "预定人",
        dataIndex: "user",
        render(_, record) {
          return record.user.username;
        },
      },
      {
        title: "开始时间",
        dataIndex: "startTime",
        render(_, record) {
          return dayjs(new Date(record.startTime)).format("YYYY-MM-DD HH:mm");
        },
      },
      {
        title: "结束时间",
        dataIndex: "endTime",
        render(_, record) {
          return dayjs(new Date(record.endTime)).format("YYYY-MM-DD HH:mm");
        },
      },
      {
        title: "审批状态",
        dataIndex: "status",
        render(_, record) {
          const status = +record.status;
          const color =
            status === 1 ? "volcano" : status === 2 ? "green" : status === 3 ? "red" : "gray";
          return <Tag color={color}>{StatusEnum[status]}</Tag>;
        },
        filters: [
          {
            text: "审批通过",
            value: "2",
          },
          {
            text: "审批驳回",
            value: "3",
          },
          {
            text: "申请中",
            value: "1",
          },
          {
            text: "已解除",
            value: "4",
          },
        ],
        onFilter: (value, record) => record.status.startsWith(value as string),
      },
      {
        title: "预定时间",
        dataIndex: "createTime",
        render(_, record) {
          return dayjs(new Date(record.createTime)).format("YYYY-MM-DD hh:mm:ss");
        },
      },
      {
        title: "备注",
        dataIndex: "note",
        render: (_, record) => {
          return <Paragraph ellipsis={true}>{record.note}</Paragraph>;
        },
      },
      {
        title: "描述",
        dataIndex: "note",
      },
      {
        title: "操作",
        width: 180,
        fixed: "right",
        render: (_, record) => (
          <div>
            <Popconfirm
              title="通过申请"
              description="确认通过吗？"
              onConfirm={() => changeStatus(record.id, 2)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" size={"small"}>
                通过
              </Button>
            </Popconfirm>
            <Popconfirm
              title="驳回申请"
              description="确认驳回吗？"
              onConfirm={() => changeStatus(record.id, 3)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" size={"small"}>
                驳回
              </Button>
            </Popconfirm>
            <Popconfirm
              title="解除申请"
              description="确认解除吗？"
              onConfirm={() => changeStatus(record.id, 4)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" size={"small"}>
                解除
              </Button>
            </Popconfirm>
            <br />
          </div>
        ),
      },
    ];
  }, []);

  const searchList = async (searchParams?: Partial<searchParams>) => {
    const res = await searchBooking(pageNo, pageSize, searchParams);

    const { data } = res.data;
    if (res.status === 201 || res.status === 200) {
      setBookingSearchResult(
        data.bookingList.map((item: DataType) => {
          return {
            key: item.id,
            ...item,
          };
        })
      );
    } else {
      message.error(data || "系统繁忙，请稍后再试");
    }
  };

  const onFinish = (values: searchParams) => {
    searchList({ ...values });
  };

  const changePage = function (pageNo: number, pageSize: number) {
    setPageNo(pageNo);
    setPageSize(pageSize);
  };

  const changeStatus = async (id: number, status: number) => {
    const res = await changeBookingStatus(id, status);
    if (res.status === 201 || res.status === 200) {
      message.success("状态更新成功");
      setNum((a) => a + 1);
    } else {
      message.error(res.data.data);
    }
  };

  useEffect(() => {
    searchList();
  }, [pageNo, pageSize, num]);

  return (
    <div className="booking-container">
      <Form
        layout="inline"
        colon={false}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
      >
        <div className="booking-form-item">
          <Form.Item label="预订人" name="userName">
            <Input></Input>
          </Form.Item>
          <Form.Item label="预定时间" name="startTime">
            <RangePicker
              showTime={{ format: "HH:mm" }}
              placeholder={["开始时间", "结束时间"]}
              disabledDate={disabledDate}
              disabledTime={disabledRangeTime}
            />
          </Form.Item>
        </div>
        <div className="booking-form-item">
          <Form.Item label="会议室名称 " name="meetingRoomName">
            <Input></Input>
          </Form.Item>
          <Form.Item label="位置" name="meetingRoomPosition">
            <Input></Input>
          </Form.Item>
        </div>
        <div>
          <Form.Item label=" ">
            <Button type="primary" htmlType="submit">
              搜索预定申请
            </Button>
          </Form.Item>
        </div>
      </Form>
      <div className="space"></div>
      <Table
        columns={columns}
        dataSource={bookingSearchResult}
        pagination={{
          current: pageNo,
          pageSize: pageSize,
          onChange: changePage,
        }}
        scroll={{ x: "110%" }}
      />
    </div>
  );
}
