import { Layout, Tabs, Typography } from "antd";
import { useState } from "react";
import "../Main.css";
import CheckedTopicList from "./topiclist/CheckedTopicList";
import TopicListProposedByUser from "./topiclist/TopicListProposedByUser";
import CheckedTopicsProposedByStud from "./topiclist/CheckedTopicsProposedByStud";

const { Content } = Layout;
const { Title } = Typography;

function TopicList() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => setActiveKey(key);

  const items = [
    {
      key: "1",
      label: "Оюутанд санал болгох сэдвүүд",
      children: activeKey === "1" && <CheckedTopicList active />,
    },
    {
      key: "2",
      label: "Өөрийн дэвшүүлсэн сэдвүүд",
      children: activeKey === "2" && <TopicListProposedByUser active />,
    },
    {
      key: "3",
      label: "Оюутнаас дэвшүүлсэн сэдвүүд",
      children: activeKey === "3" && <CheckedTopicsProposedByStud active />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдвийн хяналтын хэсэг</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs items={items} onChange={handleTabChange} activeKey={activeKey} />
        </Content>
      </Layout>
    </div>
  );
}

export default TopicList;
