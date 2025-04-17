import React, { useState } from "react";
import { Layout, Tabs, Typography } from "antd";
import SendTopic from "./SendTopic";
import DraftList from "./DraftList";

const { Content } = Layout;
const { Title } = Typography;

function ProposeTopic() {
  const [activeKey, setActiveKey] = useState("1");

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
          <Tabs
            items={items}
            activeKey={activeKey}
            onChange={(key) => setActiveKey(key)}
          />
        </Content>
      </Layout>
    </div>
  );
}

export default ProposeTopic;
