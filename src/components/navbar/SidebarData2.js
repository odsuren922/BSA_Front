//
import React from "react";
import * as IoIcons from "react-icons/io";

export const SidebarData2 = {
  department: [
    {
        title: "Нүүр хуудас", 
        path: "/admin/dashboard",
        icon: <IoIcons.IoIosPaper />,
        cName: "nav-text",
      },
  
        {
          title: "Баклаварын ажил",
          path: "/thesis-cycles",
        },
        {
          title: "Комис хувиарлах",
          path: "/CommitteeScheduler",
        },
  ],
  supervisor: [
  
  ],
  student: [
      //Бакалаврын ажил 
    {
        title: "Нүүр хуудас",
        path: "/student/dashboard",
        icon: <IoIcons.IoIosPaper />,
        cName: "nav-text",
      },

  ],
  teacher: [

   // Бакалаврын ажил 
    {
        title: "Нүүр хуудас",
        path: "/teacher/dashboard",
        icon: <IoIcons.IoIosPaper />,
        cName: "nav-text",
      },
    {
      title: "Судалгааны ажил",
      path: "/thesisList",
      icon: <IoIcons.IoIosPaper />,
      cName: "nav-text",
    },
    {
        title: "Комисс",
        path: "/teacher/committees",
        icon: <IoIcons.IoIosPaper />,
        cName: "nav-text",
      },
  ],
};
