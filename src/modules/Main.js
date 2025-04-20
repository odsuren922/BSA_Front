import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./Main.css";

// Import components
import DeFormSet from "./department/DeFormSet";
import StudentList from "./department/StudentList";
import ConfirmedTopicStud from "./student/ConfirmedTopiclist";
import ProposeTopicStud from "./student/ProposeTopicStud";
import TopicListStud from "./student/TopicListStud";
import ApprovedTopics from "./supervisor/ApprovedTopics";
import ProposedTopics from "./supervisor/ProposedTopics";
import ConfirmedTopics from "./teacher/ConfirmedTopics";
import ProposeTopic from "./teacher/ProposeTopic";
import TopicList from "./teacher/TopicList";
import SideBar from "../components/navbar/SideBar";
import CustomNavBar from "../components/navbar/CustomNavBar";

function Main({ setAuthState }) {
  const { user } = useUser();

  const roleRoutes = {
    department: (
      <>
        <Route path="/" element={<StudentList />} />
        <Route path="/studentlist" element={<StudentList />} />
        <Route path="/deformset" element={<DeFormSet />} />
      </>
    ),
    supervisor: (
      <>
        <Route path="/" element={<ProposedTopics />} />
        <Route path="/proposedtopics" element={<ProposedTopics />} />
        <Route path="/approvedtopics" element={<ApprovedTopics />} />
      </>
    ),
    student: (
      <>
        <Route path="/" element={<TopicListStud />} />
        <Route path="/topicliststud" element={<TopicListStud />} />
        <Route path="/proposetopicstud" element={<ProposeTopicStud />} />
        <Route path="/confirmedtopic" element={<ConfirmedTopicStud />} />
      </>
    ),
    teacher: (
      <>
        <Route path="/" element={<TopicList />} />
        <Route path="/topiclist" element={<TopicList />} />
        <Route path="/proposetopics" element={<ProposeTopic />} />
        <Route path="/confirmedtopics" element={<ConfirmedTopics />} />
      </>
    ),
  };

  let userRole = "";
  if (user?.email?.includes("department")) userRole = "department";
  else if (user?.email?.includes("supervisor")) userRole = "supervisor";
  else if (user?.email?.includes("student")) userRole = "student";
  else if (user?.email?.includes("teacher")) userRole = "teacher";

  const routeItems = roleRoutes[userRole] || null;

  return (
    <div className="app-layout">
      <Router>
        <CustomNavBar user={user} setAuthState={setAuthState} />
        <div className="content">
          <SideBar user={user} />
          <div className="routes-content">
            <Routes>{routeItems}</Routes>
          </div>
        </div>
      </Router>
    </div>
  );
}

export default Main;
