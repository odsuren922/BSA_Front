import React, { useState } from "react";
import { Menu } from "antd";
import { SidebarData } from "./SidebarData";
<<<<<<< HEAD
=======
import { SidebarData2 } from "./SidebarData2";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
import { Link } from "react-router-dom";
import { BookOutlined } from "@ant-design/icons";

function SideBar({ user }) {
  const [openKeys, setOpenKeys] = useState(["main-menu"]);
<<<<<<< HEAD
  const rootSubMenuKeys = ["main-menu"];

  let sidebarItems = [];
  if (user?.email === "department@gmail.com") {
    sidebarItems = SidebarData.department;
  } else if (user?.email === "supervisor@gmail.com") {
    sidebarItems = SidebarData.supervisor;
  } else if (user?.email === "teacher@gmail.com") {
    sidebarItems = SidebarData.teacher;
  } else if (user?.email === "student@gmail.com") {
    sidebarItems = SidebarData.student;
  }

=======
//   const rootSubMenuKeys = ["main-menu"];
  const rootSubMenuKeys = ["main-menu-1", "main-menu-2"];

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

  let sidebarItems2 = [];
  if (user?.role === "department") {
    sidebarItems2 = SidebarData2.department;
  } else if (user?.role === "supervisor") {
    sidebarItems2 = SidebarData2.supervisor;
  } else if (user?.role === "teacher") {
    sidebarItems2 = SidebarData2.teacher;
  } else if (user?.role === "student") {
    sidebarItems2 = SidebarData2.student;
  }



>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (rootSubMenuKeys.includes(latestOpenKey)) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys(keys);
    }
  };

<<<<<<< HEAD
=======
  

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  const menuItems = sidebarItems.map((item, index) => ({
    key: item.path,
    label: <Link to={item.path}>{item.title}</Link>,
  }));

<<<<<<< HEAD
=======
  const menuItems2 =sidebarItems2.map((item, index) => ({
    key: item.path,
    label: <Link to={item.path}>{item.title}</Link>,
  }));

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
<<<<<<< HEAD
        {
          key: "main-menu",
=======
        
        {
          key: "main-menu-1",
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
          icon: <BookOutlined />,
          label: "Бакалаврын судалгаа",
          children: menuItems,
        },
<<<<<<< HEAD
      ]}
=======
        {
          key: "main-menu-2",
          icon: <BookOutlined />,
          label: "Бакалаврын ажил",
          children: menuItems2,
        },
      ]}
      
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    />
  );
}

export default SideBar;
