import React, { useState } from "react";
import { Menu } from "antd";
import { SidebarData } from "./SidebarData";
import { Link } from "react-router-dom";
import { BookOutlined } from "@ant-design/icons";

function SideBar({ user }) {
  const [openKeys, setOpenKeys] = useState(["main-menu"]);
  const rootSubMenuKeys = ["main-menu"];

  let sidebarItems = [];
  let dashboardLink = "/dashboard";// user role based dashboard links


  if (user?.email === "department@gmail.com") {
    dashboardLink = "/admin/dashboard";
    sidebarItems = SidebarData.department;
  } else if (user?.email === "supervisor@gmail.com") {
    dashboardLink = "/supervisor/dashboard";
    sidebarItems = SidebarData.supervisor;
  } else if (user?.email === "teacher@gmail.com") {
    dashboardLink = "/supervisor/dashboard";
    sidebarItems = SidebarData.teacher;
  } else if (user?.email === "student@gmail.com") {
    dashboardLink = "/student/dashboard";
    sidebarItems = SidebarData.student;
  }

  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (rootSubMenuKeys.includes(latestOpenKey)) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys(keys);
    }
  };

  const menuItems = sidebarItems.map((item, index) => ({
    key: item.path,
    label: <Link to={item.path}>{item.title}</Link>,
  }));

  return (
    <Menu
      mode="inline"
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      style={{
        paddingTop: 20,
        width: 256,
        backgroundColor: "transparent",
        borderRight: "none",
        marginLeft: "20px",
        fontSize: "16px",
      }}
      items={[
        {
          key: "dashboard-menu",
          icon: <DashboardOutlined />,
          label: <Link to={dashboardLink}>Хянах самбар</Link>,
        },
        {
          key: "main-menu",
          icon: <BookOutlined />,
          label: "Бакалаврын судалгаа",
          children: menuItems,
        },
        // {
        //     key: "main-menu",
        //     icon: <BookOutlined />,
        //     label: "Бакалаврын судалгаа",
        //     children: menuItems,
        //   },
      ]}
    />
  );
}

export default SideBar;
