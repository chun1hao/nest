import { type RouteObject, createBrowserRouter } from "react-router-dom";
import { Login } from "../pages/Login";
import { ErrorPage } from "../pages/ErrorPage";
import { Home } from "../pages/Home";
import { UserManage } from "../pages/Home/UserManage";
import { Menu } from "../pages/Menu";
import { UserMenu } from "../pages/User/UserMenu";
import { UserInfo } from "../pages/User/UserInfo";
import { UserPwd } from "../pages/User/UserPwd";
import { Room } from "../pages/Room/room";
import { Booking } from "../pages/mBooking/Booking";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Menu></Menu>,
        children: [
          {
            path: "mroom",
            element: <Room />,
          },
          {
            path: "muser",
            element: <UserManage />,
          },
          {
            path: "mbooking",
            element: <Booking />,
          },
        ],
      },
      {
        path: "/user",
        element: <UserMenu></UserMenu>,
        children: [
          {
            path: "info",
            element: <UserInfo></UserInfo>,
          },
          {
            path: "pwd",
            element: <UserPwd></UserPwd>,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
];

export default createBrowserRouter(routes);
