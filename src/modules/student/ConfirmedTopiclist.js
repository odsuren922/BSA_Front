import { useState } from "react";
import { Layout, Tabs, Typography } from "antd";
import ConfirmedTopic from "./ConfirmedTopic";
import RequestedTopicsList from "./RequestedTopicList";

const { Content } = Layout;
const { Title } = Typography;

const ConfirmedTopics = () => {
  const [activeKey, setActiveKey] = useState("confirmed");

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const tabItems = [
    {
      key: "confirmed",
      label: "Сонгосон сэдвүүд",
      children: <ConfirmedTopic />,
    },
    {
      key: "requested",
      label: "Ирсэн хүсэлтүүд",
      children: <RequestedTopicsList />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдвийн Сонголтын Мэдээлэл</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            items={tabItems}
          />
        </Content>
      </Layout>
    </div>
  );
};

export default ConfirmedTopics;
