import { message } from "antd";
import axios from "axios";
import { IUserInfo } from "../pages/User/UserInfo";
import { searchForm } from "../pages/Room/room";
import { CreateMeetingRoom } from "../pages/Room/roomModal";
import { searchParams } from "../pages/mBooking/Booking";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 3000,
});

instance.interceptors.request.use(function (config) {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    config.headers.authorization = "Bearer " + accessToken;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (error) => {
    let { data, config } = error.response;

    if (data.code === 401 && !config.url.includes("/user/admin/refresh")) {
      const res = await refreshToken();

      if (res.status === 200) {
        const accessToken = localStorage.getItem("access_token");
        if (accessToken) {
          config.headers.authorization = "Bearer " + accessToken;
        }
        return axios(config);
      } else {
        message.error(res.data);

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } else {
      return error.response;
    }
  }
);

async function refreshToken() {
  const res = await instance.get("/user/admin/refresh", {
    params: {
      refreshToken: localStorage.getItem("refresh_token"),
    },
  });
  localStorage.setItem("access_token", res.data.data.access_token);
  localStorage.setItem("refresh_token", res.data.data.refresh_token);
  return res;
}

export async function login(username: string, password: string) {
  return await instance.post("/user/admin/login", {
    username,
    password,
  });
}

export async function getUserList(pageNo: number, pageSize: number, options = {}) {
  return await instance.get("/user/list", {
    params: {
      pageNo,
      pageSize,
      ...options,
    },
  });
}

export async function getUserInfo() {
  return await instance.get("/user/info");
}

export async function updateInfo(data: IUserInfo) {
  return await instance.post("/user/admin/update", data);
}

export async function updateUserInfoCaptcha() {
  return await instance.get("/user/update/captcha");
}

type searchRoom = Partial<searchForm> & { pageNo: number; pageSize: number };

export async function getRoomList(params: searchRoom) {
  return await instance.get("/meeting-room/list", {
    params: { ...params },
  });
}

export async function deleteMeetingRoom(id: number) {
  return await instance.get("/meeting-room/delete/" + id);
}

export async function createMeetingRoom(meetingRoom: CreateMeetingRoom) {
  return await instance.post("/meeting-room/create", meetingRoom);
}

export async function updateMeetingRoom(meetingRoom: CreateMeetingRoom) {
  return await instance.post("/meeting-room/update", meetingRoom);
}

export async function searchBooking(
  pageNo: number,
  pageSize: number,
  searchParams?: Partial<searchParams>
) {
  return await instance.get("/booking/list", {
    params: {
      pageNo,
      pageSize,
      ...searchParams,
    },
  });
}

export async function changeBookingStatus(id: number, status: number) {
  return await instance.get("/booking/changeStatus", {
    params: {
      id,
      status,
    },
  });
}
