import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./css/menu.css";
import { Menu } from "antd";
import type { MenuProps } from "antd";

const items: MenuProps["items"] = [
  {
    label: "信息修改",
    key: "/user/info",
  },
  {
    label: "密码修改",
    key: "/user/pwd",
  },
];

export function UserMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const clickMenu: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };
  return (
    <div id="user_menu">
      <div className="left">
        <Menu
          defaultSelectedKeys={[location.pathname]}
          mode="vertical"
          items={items}
          onClick={clickMenu}
        />
      </div>
      <div className="right">
        <Outlet />
      </div>
    </div>
  );
}
