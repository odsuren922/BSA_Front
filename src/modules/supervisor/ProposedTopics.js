import React, { useState, useEffect, useCallback } from "react";
import { Layout, Typography, Tabs, Spin, Button, notification } from "antd";
import { fetchData } from "../../utils";
import TopicDetail from "../TopicDetail";
import CustomTable from "../../components/CustomTable";

const { Content } = Layout;
const { Title } = Typography;

const ProposedTopics = () => {
  const [activeKey, setActiveKey] = useState("1");
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const type = activeKey === "1" ? "teacher" : "student";

    try {
      const response = await fetchData(`supervisor/topics/submitted?type=${type}`);

      const transformed = response.map((item) => {
        const fields = JSON.parse(item.fields || "[]");
        const getValue = (key) => fields.find((f) => f.field === key)?.value || "-";

        return {
          ...item,
          key: item.id,
          name_mongolian: getValue("name_mongolian"),
          name_english: getValue("name_english"),
          description: getValue("description"),
          fields,
        };
      });

      setDataSource(transformed);

      setColumns([
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
          width: 150,
          render: (_, record) => (
            <Button type="default" onClick={() => handleDetails(record)}>
              Дэлгэрэнгүй
            </Button>
          ),
        },
      ]);
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Алдаа",
        description: "Өгөгдөл ачаалах үед алдаа гарлаа.",
      });
    } finally {
      setLoading(false);
    }
  }, [activeKey]);

  useEffect(() => {
    fetchTopics();
    const interval = setInterval(fetchTopics, 5000);
    return () => clearInterval(interval);
  }, [fetchTopics]);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsModalOpen(false);
  };

  const items = [
    {
      key: "1",
      label: "Багш дэвшүүлсэн сэдэв",
    },
    {
      key: "2",
      label: "Оюутан дэвшүүлсэн сэдэв",
    },
  ];

  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Дэвшүүлсэн сэдвүүдийн жагсаалт</Title>
      </header>

      <Layout style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}>
        <Content style={{ padding: "0 16px" }}>
          <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />

          <Spin spinning={loading}>
            <CustomTable
              bordered
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: "max-content" }}
              hasLookupField={true}
              onRefresh={fetchTopics}
            />
          </Spin>

          {isModalOpen && (
            <TopicDetail
              isModalOpen={isModalOpen}
              data={selectedRowData}
              onClose={closeDetailModal}
            />
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default ProposedTopics;
