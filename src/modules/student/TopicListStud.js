import { Layout, Tabs, Typography } from "antd";
import { useState } from "react";
import "../Main.css";
import CheckedTopicList from "./CheckedTopicList";
import TopicListProposedByUser from "./TopicListProposedByUser";

const { Content } = Layout;
const { Title } = Typography;

function TopicListStud() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const items = [
    {
      key: "1",
      label: "Сэдвийн жагсаалт",
      children: <CheckedTopicList active={activeKey === "1"} />,
    },
    {
      key: "2",
      label: "Миний дэвшүүлсэн сэдвүүд",
      children: <TopicListProposedByUser active={activeKey === "2"} />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдвийн жагсаалт</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs
            items={items}
            activeKey={activeKey}
            onChange={handleTabChange}
            type="line"
          />
        </Content>
      </Layout>
    </div>
  );
}

export default TopicListStud;
