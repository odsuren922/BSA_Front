import React, { useEffect, useState } from "react";
import { Layout, Tabs, Typography } from "antd";
import SendTopic from "./SendTopic";
import ApprovedTopic from "./ApprovedTopic";
import ArchivedTopic from "./ArchivedTopic";
import { fetchData } from "../../utils"; 

const { Content } = Layout;
const { Title } = Typography;

function ProposeTopic() {
  const [originalTopics, setOriginalTopics] = useState([]); // Бүх өгөгдлийг хадгалах үндсэн эх сурвалж
  const [loading, setLoading] = useState(true);
  const [activeTopics, setActiveTopics] = useState([]);
  const [archivedTopics, setArchivedTopics] = useState([]);
  
  const fetchTopicData = async () => {
    setLoading(true);
    try {
      const data = await fetchData("proposed-topics/byUser");
  console.log("data of topic",  data)
      const active = data.filter(topic => topic.is_archived === false);
      const archived = data.filter(topic => topic.is_archived === true);
  
      setActiveTopics(active);
      setArchivedTopics(archived);
    } catch (error) {
      console.error("Error fetching proposal data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchTopicData();
  }, []);

  const items = [
    {
      key: "1",
      label: "Сэдэв дэвшүүлэх",
      children: (
        <SendTopic
          originalTopics={activeTopics.filter(t =>
            ["draft", "submitted", "rejected"].includes(t.status)
          )}
          fetchTopicData={fetchTopicData}
          loading={loading}
        />
      ),
    },
    {
        key: "2",
        label: "Батлагдсан / Татгалзсан сэдвүүд",
        children: (
          <ApprovedTopic
            originalTopics={activeTopics.filter(t =>
              ["approved", "chosen", "rejected"].includes(t.status)
            )}
            fetchTopicData={fetchTopicData}
            loading={loading}
          />
        ),
      },
      {
        key: "3",
        label: "Архивлагдсан сэдвүүд",
        children: (
          <ArchivedTopic
            originalTopics={archivedTopics}
            fetchTopicData={fetchTopicData}
            loading={loading}
          />
        ),
      }
      
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдэв дэвшүүлэх</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs items={items} />
        </Content>
      </Layout>
    </div>
  );
}

export default ProposeTopic;
