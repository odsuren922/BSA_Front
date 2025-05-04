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
<<<<<<< HEAD

=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  const items = [
    {
      key: "1",
      label: "Сэдвийн жагсаалт",
<<<<<<< HEAD
      children: <CheckedTopicList active={activeKey === "1"} />,
    },
    {
      key: "2",
      label: "Миний дэвшүүлсэн сэдвүүд",
      children: <TopicListProposedByUser active={activeKey === "2"} />,
=======
      children: activeKey === "1" && (
        <CheckedTopicList active={activeKey === "1"} />
      ),
    },
    {
      key: "2",
      label: "Дэвшүүлсэн сэдвийн жагсаалт",
      children: activeKey === "2" && (
        <TopicListProposedByUser active={activeKey === "1"} />
      ),
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдвийн жагсаалт</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
<<<<<<< HEAD
          <Tabs
            items={items}
            activeKey={activeKey}
            onChange={handleTabChange}
            type="line"
          />
=======
          <Tabs items={items} onChange={handleTabChange} />
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        </Content>
      </Layout>
    </div>
  );
}

export default TopicListStud;
