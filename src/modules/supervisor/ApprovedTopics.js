import React, { useState, useEffect } from "react";
import { Layout, Typography, Spin, notification, Tag } from "antd";
import CustomTable from "../../components/CustomTable";
import { fetchData } from "../../utils";

const { Content } = Layout;
const { Title } = Typography;

const ApprovedTopics = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      const response = await fetchData("supervisor/topics/approved");

      const transformed = response.map((item) => {
        const fields = JSON.parse(item.fields || "[]");
        const getValue = (key) =>
          fields.find((f) => f.field === key)?.value || "-";

        return {
          key: item.id,
          name_mongolian: getValue("name_mongolian"),
          name_english: getValue("name_english"),
          description: getValue("description"),
          status: item.status,
        };
      });

      setDataSource(transformed);
    } catch (error) {
      console.error("Error loading topics:", error);
      notification.error({
        message: "Алдаа",
        description: "Сэдвүүдийг ачаалах үед алдаа гарлаа.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const columns = [
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
      title: "Төлөв",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Баталсан", value: "approved" },
        { text: "Татгалзсан", value: "refused" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const color = status === "approved" ? "blue" : "red";
        const text = status === "approved" ? "Баталсан" : "Татгалзсан";
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Хянагч багшийн баталсан сэдвүүд</Title>
      </header>

      <Layout className="bg-white rounded-lg p-4">
        <Content className="p-4">
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
        </Content>
      </Layout>
    </div>
  );
};

export default ApprovedTopics;
