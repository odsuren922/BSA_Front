import React, { useState } from "react";
import { Menu } from "antd";
import { SidebarData } from "./SidebarData";
import { SidebarData2 } from "./SidebarData2";

import { Link } from "react-router-dom";
import { BookOutlined, HomeOutlined } from "@ant-design/icons";

function SideBar({ user }) {
  const [openKeys, setOpenKeys] = useState(["main-menu"]);
  const rootSubMenuKeys = ["main-menu"];

  let sidebarItems = [];
  let sidebarItems2 = [];
  let dashboardLink = "/dashboard"; // user role based dashboard links

  if (user?.email === "department@gmail.com") {
    dashboardLink = "/admin/dashboard";
    sidebarItems = SidebarData.department;
    sidebarItems2 = SidebarData2.department;
  } 
  else if (user?.email === "supervisor@gmail.com") {
    dashboardLink = "/supervisor/dashboard";
    sidebarItems = SidebarData.supervisor;
    // sidebarItems2 = SidebarData2.supervisor;
  }
   else if (user?.email === "teacher@gmail.com") {
    dashboardLink = "/supervisor/dashboard";
    sidebarItems = SidebarData.teacher;
    sidebarItems2 = SidebarData2.supervisor;
  } 
  else if (user?.email === "student@gmail.com") {
    dashboardLink = "/student/dashboard";
    sidebarItems = SidebarData.student;
    sidebarItems2 = SidebarData2.student;
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
  const menuItems2 = sidebarItems2.map((item) => ({
    key: item.path + "-2", 
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
          icon: <HomeOutlined />,
          label: <Link to={dashboardLink}>Нүүр хуудас</Link>,
        },
        {
          key: "main-menu-1",
          icon: <BookOutlined />,
          label: "Бакалаврын судалгаа",
          children: menuItems,
        },
        {
          key: "main-menu-2",
          icon: <BookOutlined />,
          label: "Бакалаврын цикл",
          children: menuItems2,
        },
      ]}
    />
  );
}

export default SideBar;
