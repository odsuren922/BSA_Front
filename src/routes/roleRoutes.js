import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// Import Department components
import StudentList from "../modules/department/StudentList";
import DeFormSet from "../modules/department/DeFormSet";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ThesisCycle from "../pages/Admin/ThesisCyclePage";
import ThesisCycleBetter from "../pages/Admin/ThesisCycleManagement/ThesisCyclePanel";
import SupervisorGradingPage from "../pages/Admin/Grading/SupervisorsScore";
import CommitteePanel from "../pages/Admin/CommitteePanel";
import CommitteeScheduler from "../pages/Admin/CommiteeManagment/Scheduler";
import Calendar from "../pages/Admin/NotUseful/Calendar";
import Plan from "../pages/Plan/Plan";
import AboutThesis from "../pages/Thesis/AboutThesis";

// Import Supervisor components
import ProposedTopics from "../modules/supervisor/ProposedTopics";
import ApprovedTopics from "../modules/supervisor/ApprovedTopics";

// Import Student components
import TopicListStud from "../modules/student/TopicListStud";
import ProposeTopicStud from "../modules/student/ProposeTopicStud";
import ConfirmedTopicStud from "../modules/student/ConfirmedTopiclist";
import StudentDashboard from "../pages/Student/StudentDashboard";

// Import Teacher components
import TopicList from "../modules/teacher/TopicList";
import ProposeTopic from "../modules/teacher/ProposeTopic";
import ConfirmedTopics from "../modules/teacher/ConfirmedTopics";
import DashBoardSupervisor from "../pages/Teacher/Dashboard";
import SupervisodTheses from "../pages/Teacher/supervisodAllThesis";
import CommitteeListPage from "../pages/Teacher/Committee/CommitteeList";
import CommitteeDetailPage from "../pages/Teacher/Committee/CommitteeDetailPage";
import CommitteeCalendarPage from "../pages/Teacher/Committee/CommitteeCalendarPage";

// Department routes
export const departmentRoutes = (
  <>
    <Route index element={<Navigate to="/studentlist" replace />} />
    <Route path="/studentlist" element={<StudentList />} />
    <Route path="/deformset" element={<DeFormSet />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    <Route path="/allthesis/:id" element={<ThesisCycle />} />
    <Route path="/aboutthesis/:id" element={<AboutThesis />} />
    <Route path="/studentPlan/:id" element={<Plan />} />
    <Route path="/thesis-cycles" element={<ThesisCycleBetter />} />
    <Route path="/CommitteeScheduler" element={<CommitteeScheduler />} />
    <Route path="/calendar" element={<Calendar />} />
    <Route path="/supervisor/grading" element={<SupervisorGradingPage />} />
    <Route path="/committees" element={<CommitteePanel />} />
  </>
);

// Supervisor routes
export const supervisorRoutes = (
  <>
    <Route index element={<Navigate to="/proposedtopics" replace />} />
    <Route path="/proposedtopics" element={<ProposedTopics />} />
    <Route path="/approvedtopics" element={<ApprovedTopics />} />
  </>
);

// Student routes
export const studentRoutes = (
  <>
    <Route index element={<Navigate to="/topicliststud" replace />} />
    <Route path="/topicliststud" element={<TopicListStud />} />
    <Route path="/proposetopicstud" element={<ProposeTopicStud />} />
    <Route path="/confirmedtopic" element={<ConfirmedTopicStud />} />
    <Route path="/student/dashboard" element={<StudentDashboard />} />
    <Route path="/studentPlan/:id" element={<Plan />} />
    <Route path="/plan" element={<Plan />} />
  </>
);

// Teacher routes
export const teacherRoutes = (
  <>
    <Route index element={<Navigate to="/topiclist" replace />} />
    <Route path="/topiclist" element={<TopicList />} />
    <Route path="/proposetopics" element={<ProposeTopic />} />
    <Route path="/confirmedtopics" element={<ConfirmedTopics />} />
    <Route path="/teacher/dashboard" element={<DashBoardSupervisor />} />
    <Route path="/thesisList" element={<SupervisodTheses />} />
    <Route path="/aboutthesis/:id" element={<AboutThesis />} />
    <Route path="/studentPlan/:id" element={<Plan />} />
    <Route path="/teacher/committees" element={<CommitteeListPage />} />
    <Route path="/teacher/committees/detail/:id" element={<CommitteeDetailPage />} />
    <Route path="/teacher/committee/calendar" element={<CommitteeCalendarPage />} />
  </>
);