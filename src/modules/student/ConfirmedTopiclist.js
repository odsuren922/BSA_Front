import { useState } from "react";
import { Layout, Tabs, Typography } from "antd";
<<<<<<< HEAD
import ConfirmedTopic from "./ConfirmedTopic";
import RequestedTopicsList from "./RequestedTopicList";
=======
import RequestedTopicsList from "./RequestedTopicList";
import ConfirmedTopic from "./ConfirmedTopic";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

const { Content } = Layout;
const { Title } = Typography;

<<<<<<< HEAD
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
=======
function ConfirmedTopics() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
    console.log(`Tab: ${key}`);
  };

  const items = [
    {
      key: "1",
      label: "Сонгосон сэдэв",
      children: activeKey === "1" && <ConfirmedTopic />,
    },
    {
      key: "2",
      label: "Хүсэлт ирсэн сэдвийн жагсаалт",
      children: activeKey === "2" && <RequestedTopicsList />,
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
<<<<<<< HEAD
        <Title level={3}>Сэдвийн Сонголтын Мэдээлэл</Title>
=======
        <Title level={3}>Сонгосон сэдэв</Title>
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
<<<<<<< HEAD
          <Tabs
            activeKey={activeKey}
            onChange={handleTabChange}
            items={tabItems}
          />
=======
          <Tabs items={items} onChange={handleTabChange} />
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        </Content>
      </Layout>
    </div>
  );
<<<<<<< HEAD
};
=======
}
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

export default ConfirmedTopics;
