import React, { useState } from "react";
import { Tabs, Layout, Typography, Switch, Alert, Space } from "antd";
import NotificationComposer from "./NotificationComposer";
import NotificationHistory from "./NotificationHistory";
import NotificationTemplates from "./NotificationTemplates";
import NotificationSettings from "./NotificationSettings";
import CORSDebugger from "../../../components/debug/CORSDebugger";

const { Content } = Layout;
const { Title, Text } = Typography;

function NotificationDashboard() {
  const [activeKey, setActiveKey] = useState("1");
  const [showDebugger, setShowDebugger] = useState(false);
  const [hasCORSError, setHasCORSError] = useState(false);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  // Listen for errors from child components
  const handleApiError = (error) => {
    // Check if this is likely a CORS error
    if (
      error && 
      (error.message?.includes('CORS') || 
       error.message?.includes('Network Error') ||
       error.name === 'NetworkError')
    ) {
      setHasCORSError(true);
    }
  };

  // Basic items common to all modes
  const items = [
    {
      key: "1",
      label: "Compose Notification",
      children: activeKey === "1" && (
        <NotificationComposer onError={handleApiError} />
      ),
    },
    {
      key: "2",
      label: "Notification History",
      children: activeKey === "2" && (
        <NotificationHistory onError={handleApiError} />
      ),
    },
    {
      key: "3",
      label: "Templates",
      children: activeKey === "3" && (
        <NotificationTemplates onError={handleApiError} />
      ),
    },
    {
      key: "4",
      label: "Settings",
      children: activeKey === "4" && (
        <NotificationSettings onError={handleApiError} />
      ),
    }
  ];

  // Add debugger tab if enabled
  if (showDebugger) {
    items.push({
      key: "debug",
      label: "API Debugger",
      children: activeKey === "debug" && <CORSDebugger />,
    });
  }

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Notification Management</Title>
      </header>

      {hasCORSError && (
        <Alert
          type="error"
          message="CORS Error Detected"
          description={
            <Space direction="vertical">
              <Text>
                There appears to be a CORS (Cross-Origin Resource Sharing) issue with the API.
                This happens when your frontend and backend are on different domains/ports and
                proper CORS headers aren't configured.
              </Text>
              <Space>
                <Text>Enable debugging tools:</Text>
                <Switch 
                  checked={showDebugger}
                  onChange={setShowDebugger}
                />
              </Space>
            </Space>
          }
          closable
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Layout className="bg-white rounded-lg p-4">
        <div className="flex justify-end mb-2">
          <Space>
            <Text>Debug Mode:</Text>
            <Switch 
              checked={showDebugger}
              onChange={setShowDebugger}
              size="small"
            />
          </Space>
        </div>
        <Content className="p-4">
          <Tabs items={items} onChange={handleTabChange} activeKey={activeKey} />
        </Content>
      </Layout>
    </div>
  );
}

export default NotificationDashboard;