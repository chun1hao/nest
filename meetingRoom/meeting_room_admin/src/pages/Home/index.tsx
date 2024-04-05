import { UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import "./home.css";

export function Home() {
  const navigate = useNavigate();
  return (
    <div id="index-container">
      <div className="header">
        <h1 onClick={() => navigate("/")}>后台管理</h1>
        <UserOutlined className="icon" onClick={() => navigate("/user/info")} />
      </div>
      <div className="body">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
