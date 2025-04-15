import React from "react";
import * as IoIcons from "react-icons/io";

export const SidebarData2 = {
  department: [
  
    {
      title: "Баклаварын ажил",
      path: "/thesis-cycles",
    },
    {
      title: "Комис хувиарлах",
      path: "/CommitteeScheduler",
    },

    //   {
    //     title: "calendar",
    //     path: "/calendar",
    // }
  ],

  supervisor: [
    {
      title: "Судалгааны ажил",
      path: "/thesisList",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
  ],
  student: [
    {
      title: "Үечилсэн төлөвлөгөө",
      path: "/plan",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
  ],
};
