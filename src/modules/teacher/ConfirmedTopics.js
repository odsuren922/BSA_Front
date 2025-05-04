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
<<<<<<< HEAD
=======
    console.log(`Tab: ${key}`);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  };

  const items = [
    {
      key: "1",
<<<<<<< HEAD
      label: "Оюутны хүсэлтүүд", // илүү товч, ойлгомжтой
      children: <RequestedTopics />,
    },
    {
      key: "2",
      label: "Сонгосон оюутнууд",
      children: <ConfirmedTopicList />,
=======
      label: "Хүсэлт ирсэн сэдвийн жагсаалт",
      children: activeKey === "1" && <RequestedTopics />,
    },
    {
      key: "2",
      label: "Зөвшөөрсөн сэдвийн жагсаалт",
      children: activeKey === "2" && <ConfirmedTopicList />,
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
<<<<<<< HEAD
        <Title level={3}>Сэдэв сонголтын удирдлага</Title>
=======
        <Title level={3}>Сэдэв сонгох хүсэлтийн жагсаалт</Title>
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
<<<<<<< HEAD
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            items={items}
          />
=======
          <Tabs items={items} onChange={handleTabChange} />
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        </Content>
      </Layout>
    </div>
  );
}

export default ConfirmedTopics;
