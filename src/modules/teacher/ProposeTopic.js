<<<<<<< HEAD
import React, { useState } from "react";
=======
import React from "react";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
import { Layout, Tabs, Typography } from "antd";
import SendTopic from "./SendTopic";
import DraftList from "./DraftList";

const { Content } = Layout;
const { Title } = Typography;

function ProposeTopic() {
<<<<<<< HEAD
  const [activeKey, setActiveKey] = useState("1");

=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  const items = [
    {
      key: "1",
      label: "Сэдэв дэвшүүлэх",
      children: <SendTopic />,
    },
    {
      key: "2",
      label: "Ноорог",
      children: <DraftList />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдэв дэвшүүлэх</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
<<<<<<< HEAD
          <Tabs
            items={items}
            activeKey={activeKey}
            onChange={(key) => setActiveKey(key)}
          />
=======
          <Tabs items={items} />
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        </Content>
      </Layout>
    </div>
  );
}

export default ProposeTopic;
