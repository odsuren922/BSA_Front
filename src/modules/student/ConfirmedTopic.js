import React, { useEffect, useState } from "react";
import { Layout, Typography, Spin, Tag, notification } from "antd";
import { fetchData } from "../../utils";
import CustomTable from "../../components/CustomTable";

const { Content } = Layout;
const { Title } = Typography;

const ConfirmedTopic = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);

  const fetchConfirmedTopic = async () => {
    setLoading(true);
    try {
      const response = await fetchData("topics/confirmed");
      const transformed = response.map((item) => {
        const fields = JSON.parse(item.fields);
        const fieldMap = fields.reduce((acc, cur) => {
          acc[cur.field] = cur.value;
          acc[`${cur.field}_name`] = cur.field2;
          return acc;
        }, {});
        return {
          ...item,
          ...fieldMap,
          key: item.id,
        };
      });

      setDataSource(transformed);

      if (transformed.length > 0) {
        const dynamicCols = JSON.parse(transformed[0].fields)
          .filter((f) =>
            ["name_mongolian", "name_english", "description"].includes(f.field)
          )
          .map((f) => ({
            title: f.field2,
            dataIndex: f.field,
            key: f.field,
          }));

        dynamicCols.push({
          title: "Төлөв",
          dataIndex: "status",
          key: "status",
          render: (status) => (
            <Tag color={status === "confirmed" ? "green" : "gray"}>
              {status === "confirmed" ? "Батлагдсан" : "Бусад"}
            </Tag>
          ),
        });

        dynamicCols.push({
          title: "Удирдагч багш",
          key: "advisor_name",
          render: (_, record) =>
            record.advisor_name
              ? record.advisor_name
              : record.teacher_name || "-",
        });

        setColumns(dynamicCols);
      }
    } catch (error) {
      console.error("Error fetching confirmed topic:", error);
      notification.error({
        message: "Алдаа",
        description: "Батлагдсан сэдэв татаж чадсангүй.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfirmedTopic();
  }, []);

  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Батлагдсан сэдэв</Title>
      </header>

      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
        <Content style={{ padding: "0 16px" }}>
          <Spin spinning={loading}>
            <CustomTable
              columns={columns}
              dataSource={dataSource}
              bordered
              scroll={{ x: "max-content" }}
              hasLookupField={true}
              onRefresh={fetchConfirmedTopic}
            />
          </Spin>
        </Content>
      </Layout>
    </div>
  );
};

export default ConfirmedTopic;
