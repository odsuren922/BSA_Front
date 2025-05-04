import React, { useState, useEffect } from "react";
import { Layout, Typography, Spin, notification, Tag } from "antd";
import CustomTable from "../../components/CustomTable";
import { fetchData, safeParseJSON } from "../../utils"; 

const { Content } = Layout;
const { Title } = Typography;

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
    fixed: "right",
    filters: [
      { text: "Баталсан", value: "approved" },
      { text: "Түтгэлзүүлсэн", value: "refused" },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => {
      const color = status === "approved" ? "blue" : "orange";
      const text = status === "approved" ? "Баталсан" : "Түтгэлзүүлсэн";
      return <Tag color={color}>{text}</Tag>;
    },
  },
];

const ApprovedTopics = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      const res = await fetchData("topics/reviewedtopicList");

      const parsedData = res.map((item) => {
        const fields = safeParseJSON(item.fields, []); // ✅ JSON.parse → safeParseJSON

        return {
          key: item.id,
          name_mongolian: fields.find((f) => f.field === "name_mongolian")?.value || "",
          name_english: fields.find((f) => f.field === "name_english")?.value || "",
          description: fields.find((f) => f.field === "description")?.value || "",
          status: item.status,
        };
      });

      setDataSource(parsedData);
    } catch (error) {
      console.error("Failed to fetch topics:", error);
      notification.error({
        message: "Fetch Error",
        description: "Failed to load data: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <div className="p-4 bg-transparent">
      <header className="text-left mb-4">
        <Title level={3}>Хянасан сэдвийн жагсаалт</Title>
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
