<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { Table, Spin, Button, Modal, message } from "antd";
import { fetchData, postData } from "../../utils";
import DraftDetail from "../DraftDetail";

const DraftList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const rawData = await fetchData("topics/draftstudent");

      const transformedData = rawData.map((item) => {
        let fieldsArray = [];

        try {
          fieldsArray = JSON.parse(item.fields);
        } catch (e) {
          console.warn("Invalid fields JSON:", item.fields);
        }

        const fieldsObject = fieldsArray.reduce(
          (acc, field) => ({
            ...acc,
            [field.field]: field.value,
            [`${field.field}_name`]: field.field2,
          }),
          {}
        );

        return {
          ...item,
          ...fieldsObject,
          key: item.id,
        };
      });

      setDataSource(transformedData);

      if (transformedData.length > 0) {
        const dynamicColumns = [
          {
            title: "Сэдвийн нэр (Монгол)",
            dataIndex: "name_mongolian",
            key: "name_mongolian",
          },
          {
            title: "Сэдвийн нэр (Англи)",
            dataIndex: "name_english",
            key: "name_english",
          },
          {
            title: "Товч агуулга",
            dataIndex: "description",
            key: "description",
          },
          {
            title: "Үйлдэл",
            key: "actions",
            fixed: "right",
            width: 200,
            render: (_, record) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button type="default" onClick={() => handleDetails(record)}>
                  Дэлгэрэнгүй
                </Button>
                <Button type="primary" onClick={() => handleResubmit(record)}>
                  Дахин дэвшүүлэх
                </Button>
              </div>
            ),
          },
        ];
        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

  const handleResubmit = (record) => {
    Modal.confirm({
      title: "Та дахин дэвшүүлэхдээ итгэлтэй байна уу?",
      content: "Энэ сэдвийг дахин хянагч багшид илгээх болно.",
      okText: "Тийм",
      cancelText: "Үгүй",
      onOk: async () => {
        try {
          const payload = {
            topic_id: record.id,
            status: "submitted",
          };
          await postData("topic/store", payload, "post");
          message.success("Сэдвийг амжилттай дахин дэвшүүллээ.");
          fetchTopics(); // refresh
        } catch (error) {
          console.error("Resubmit error:", error);
          message.error("Алдаа гарлаа. Дахин дэвшүүлж чадсангүй.");
        }
      },
    });
  };

  return (
    <div className="p-4">
      <Spin spinning={loading}>
        <Table
          bordered
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: "max-content" }}
        />
      </Spin>
      {isModalOpen && (
        <DraftDetail
          isModalOpen={isModalOpen}
          data={selectedRowData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DraftList;
=======
import React, { useState } from "react";
import { Layout, Tabs, Typography } from "antd";
import SendPropTopic from "./SendPropTopic";
import DraftList from "./DraftList";

const { Content } = Layout;
const { Title } = Typography;

function ProposeTopicStud() {
  const [activeKey, setActiveKey] = useState("1");

  const handleTabChange = (key) => {
    setActiveKey(key);
    console.log(`Tab: ${key}`);
  };

  const items = [
    {
      key: "1",
      label: "Сэдэв дэвшүүлэх",
      children: activeKey === "1" && <SendPropTopic />,
    },
    {
      key: "2",
      label: "Ноорог",
      children: activeKey === "2" && <DraftList />,
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Сэдэв дэвшүүлэх</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
          <Tabs items={items} onChange={handleTabChange} />
        </Content>
      </Layout>
    </div>
  );
}

export default ProposeTopicStud;
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
