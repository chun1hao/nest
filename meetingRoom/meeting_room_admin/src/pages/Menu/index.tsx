import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu as AntdMenu, MenuProps } from "antd";
import "./index.css";

const items: MenuProps["items"] = [
  {
    key: "/mroom",
    label: "会议室管理",
  },
  {
    key: "/mbooking",
    label: "预定管理",
  },
  {
    key: "/muser",
    label: "用户管理",
  },
  {
    key: "4",
    label: "统计",
  },
];

export function Menu() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div id="menu-container">
      <div className="menu-area">
        <AntdMenu
          defaultSelectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </div>
      <div className="content-area">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
