import { useState } from "react";
import { Layout, Tabs, Typography } from "antd";
import RequestedTopics from "./RequestedTopics";
import ConfirmedTopicList from "./ConfirmedTopicList";

const { Content } = Layout;
const { Title } = Typography;

function ConfirmedTopics() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const items = [
    {
      key: "1",
      label: "Оюутны хүсэлтүүд", // илүү товч, ойлгомжтой
      children: <RequestedTopics />,
    },
    {
      key: "2",
      label: "Сонгосон оюутнууд",
      children: <ConfirmedTopicList />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдэв сонголтын удирдлага</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            items={items}
          />
        </Content>
      </Layout>
    </div>
  );
}

export default ConfirmedTopics;
