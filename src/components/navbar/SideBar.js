import React, { useState } from "react";
import { Menu } from "antd";
import { SidebarData } from "./SidebarData";
import { Link } from "react-router-dom";
import { BookOutlined } from "@ant-design/icons";

function SideBar({ user }) {
  const [openKeys, setOpenKeys] = useState(["main-menu"]);
  const rootSubMenuKeys = ["main-menu"];
//Based on role sidebar changed 
  let sidebarItems = [];
  if (user?.role === "department") {
    sidebarItems = SidebarData.department;
  } else if (user?.role === "supervisor") {
    sidebarItems = SidebarData.supervisor;
  } else if (user?.role === "teacher") {
    sidebarItems = SidebarData.teacher;
  } else if (user?.role === "student") {
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
          key: "main-menu",
          icon: <BookOutlined />,
          label: "Бакалаврын судалгаа",
          children: menuItems,
        },
      ]}
    />
  );
}

export default SideBar;
