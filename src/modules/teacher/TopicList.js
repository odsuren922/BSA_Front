import { Layout, Tabs, Typography } from "antd";
import { useState } from "react";
import "../Main.css";
import CheckedTopicList from "./topiclist/CheckedTopicList";
<<<<<<< HEAD
import TopicListProposedByUser from "./topiclist/TopicListProposedByUser";
import CheckedTopicsProposedByStud from "./topiclist/CheckedTopicsProposedByStud";
=======
import CheckedTopicsProposedByStud from "./topiclist/CheckedTopicsProposedByStud";
import TopicListProposedByUser from "./topiclist/TopicListProposedByUser";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

const { Content } = Layout;
const { Title } = Typography;

function TopicList() {
  const [activeKey, setActiveKey] = useState("1");

<<<<<<< HEAD
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
=======
  const handleTabChange = (key) => {
    setActiveKey(key);
  };
  const items = [
    {
      key: "1",
      label: "Сэдвийн жагсаалт",
      children: activeKey === "1" && (
        <CheckedTopicList active={activeKey === "1"} />
      ),
    },
    {
      key: "2",
      label: "Дэвшүүлсэн сэдвийн жагсаалт",
      children: activeKey === "2" && (
        <TopicListProposedByUser active={activeKey === "2"} />
      ),
    },
    {
      key: "3",
      label: "Оюутны дэвшүүлсэн сэдвийн жагсаалт",
      children: activeKey === "3" && (
        <CheckedTopicsProposedByStud active={activeKey === "3"} />
      ),
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
<<<<<<< HEAD
        <Title level={3}>Сэдвийн хяналтын хэсэг</Title>
=======
        <Title level={3}>Сэдвийн жагсаалт</Title>
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
<<<<<<< HEAD
          <Tabs items={items} onChange={handleTabChange} activeKey={activeKey} />
=======
          <Tabs items={items} onChange={handleTabChange} />
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        </Content>
      </Layout>
    </div>
  );
}

export default TopicList;
