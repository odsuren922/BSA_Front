import React, { useState } from "react";
import { Menu } from "antd";
import { SidebarData } from "./SidebarData";
import { SidebarData2 } from "./SidebarData2";
import { Link } from "react-router-dom";
import { BookOutlined } from "@ant-design/icons";

function SideBar({ user }) {
  const [openKeys, setOpenKeys] = useState(["main-menu"]);
//   const rootSubMenuKeys = ["main-menu"];
  const rootSubMenuKeys = ["main-menu-1", "main-menu-2"];

//Based on role sidebar changed 
  let sidebarItems = [];
  if (user?.role === "student") {
    sidebarItems = SidebarData.department;
  } else if (user?.role === "teacher") {
    sidebarItems = SidebarData.department;
  } 
  else if (user?.role === "department") {
    sidebarItems2 = SidebarData2.department;
}
//   else if (user?.role === "student") {
//     sidebarItems = SidebarData.student;
//   }
//TODO:: EDITED FOR TESTING 
  let sidebarItems2 = [];
//   if (user?.role === "department") {
    if (user?.role === "student") {
    sidebarItems2 = SidebarData2.department;
  } 
  else if (user?.role === "department") {
    sidebarItems2 = SidebarData2.department;
}
   else if (user?.role === "teacher") {
    sidebarItems2 = SidebarData2.department;
  } 
//   else if (user?.role === "student") {
//     sidebarItems2 = SidebarData2.student;
//   }



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

  const menuItems2 =sidebarItems2.map((item, index) => ({
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
          key: "main-menu-1",
          icon: <BookOutlined />,
          label: "Сэдэв сонголт",
          children: menuItems,
        },
        {
          key: "main-menu-2",
          icon: <BookOutlined />,
          label: "Бакалаврын ажил",
          children: menuItems2,
        },
      ]}
      
    />
  );
}

export default SideBar;
