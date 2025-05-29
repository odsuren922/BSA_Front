import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Spin, notification, Modal } from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import components
import SideBar from "../components/navbar/SideBar";
import CustomNavBar from "../components/navbar/CustomNavBar";

// Import pages for different roles
import { 
  departmentRoutes, 
  supervisorRoutes, 
  studentRoutes, 
  teacherRoutes 
} from "../routes/roleRoutes";

// Inactivity detection constants
const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARN_BEFORE_TIMEOUT = 2 * 60 * 1000; // 2 minutes

function Main({ user, setUser, logoutFunction }) {
  const navigate = useNavigate();
  const { user: contextUser } = useUser();
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [roleLoading, setRoleLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  // Reset activity timer on user interaction
  const resetActivityTimer = () => {
    setLastActivity(Date.now());
    setShowInactivityWarning(false);
  };

  // Add event listeners for user activity
  useEffect(() => {
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetActivityTimer);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetActivityTimer);
      });
    };
  }, []);

  // Check for inactivity
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const inactive = now - lastActivity;
      
      // If inactive for longer than timeout, log out
      if (inactive >= ACTIVITY_TIMEOUT) {
        logoutFunction();
        notification.info({
          message: "Автоматаар гарлаа",
          description: "Идэвхгүй байсан тул та системээс автоматаар гарлаа.",
          duration: 5
        });
      } 
      // Show warning before logging out
      else if (inactive >= ACTIVITY_TIMEOUT - WARN_BEFORE_TIMEOUT) {
        setShowInactivityWarning(true);
      }
    };

    const inactivityInterval = setInterval(checkInactivity, 60000); // Check every minute
    
    return () => {
      clearInterval(inactivityInterval);
    };
  }, [lastActivity, logoutFunction]);

  // Get user role from context or props
  useEffect(() => {
    const effectiveUser = contextUser || user;
    
    if (effectiveUser) {
      const role = effectiveUser.role || "";
      setUserRole(role);
    }
    
    setRoleLoading(false);
  }, [contextUser, user]);

  // Handle menu toggle
  const handleMenuToggle = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  // Handle inactivity warning continue
  const handleContinueSession = () => {
    resetActivityTimer();
  };

  // Loading state
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin tip="Хэрэглэгчийн мэдээлэл ачааллаж байна..." size="large" />
      </div>
    );
  }
//TODO:: EDITED FOR TESTING
  // Get routes based on user role
  const getRoutes = () => {
    switch (userRole) {
      case "department":
        return departmentRoutes;
   
    //   case "student":
    //     return studentRoutes;
    case "student":
        return teacherRoutes;
      case "teacher":
        return teacherRoutes;
      default:
        return (
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <h2 className="text-2xl font-bold mb-4">Эрхийн алдаа</h2>
                  <p>
                    Таны эрх тодорхойлогдсонгүй. Та админтай холбогдоно уу.
                  </p>
                  <button
                    onClick={logoutFunction}
                    className="mt-4 px-4 py-2 bg-violet-500 text-white rounded"
                  >
                    Гарах
                  </button>
                </div>
              </div>
            }
          />
        );
    }
  };

  return (
    <div className="app-layout">
      <ToastContainer />
      
      {/* Navigation bar */}
      <CustomNavBar
        user={user}
        setUser={setUser}
        logoutFunction={logoutFunction}
        onClick={handleMenuToggle}
      />
      
      {/* Main content */}
      <div className="content">
        <SideBar user={user} collapsed={menuCollapsed} />
        <div className="routes-content">
          <Routes>
            {getRoutes()}
          </Routes>
        </div>
      </div>
      
      {/* Inactivity warning modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />
            Сэрэмжлүүлэг: Идэвхгүй байна
          </span>
        }
        open={showInactivityWarning}
        onOk={handleContinueSession}
        onCancel={logoutFunction}
        okText="Үргэлжлүүлэх"
        cancelText="Гарах"
      >
        <p>Та удаан хугацаанд идэвхгүй байна. Хэрэв үргэлжлүүлэхийг хүсвэл "Үргэлжлүүлэх" товчийг дарна уу.</p>
        <p>Эсвэл автоматаар системээс гарах болно.</p>
      </Modal>
    </div>
  );
}

export default Main;