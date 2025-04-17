import React, { useState, useEffect, useCallback } from "react";
import { Spin, notification, Button } from "antd";
import { fetchData } from "../../utils";
import ApproveDetail from "../ApproveDetail";
import CustomTable from "../../components/CustomTable";

const RequestedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const parseFields = (rawFields) => {
    try {
      const parsed = typeof rawFields === "string" ? JSON.parse(rawFields) : rawFields;
      return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
    } catch (e) {
      console.error("Fields parse error:", rawFields);
      return [];
    }
  };

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchData("topic_requests");
      const rawData = Array.isArray(response?.data) ? response.data : [];

      const transformed = rawData.map((item) => {
        const fieldsArray = parseFields(item.fields);
        const fieldData = fieldsArray.reduce((acc, field) => {
          acc[field.field] = field.value;
          acc[`${field.field}_name`] = field.field2;
          return acc;
        }, {});

        return {
          ...item,
          ...fieldData,
          fieldsArray,
          key: item.req_id || item.id || `${item.topic_id}-${item.created_by_id}`,
        };
      });

      setDataSource(transformed);

      if (transformed.length > 0) {
        const dynamicColumns = transformed[0].fieldsArray
          ?.filter((f) => f.field === "name_mongolian")
          .map((f) => ({
            title: f.field2,
            dataIndex: f.field,
            key: f.field,
          })) || [];

        setColumns([
          ...dynamicColumns,
          {
            title: "Хүсэлт илгээсэн",
            dataIndex: "firstname",
            key: "firstname",
          },
          {
            title: "Сиси ID",
            dataIndex: "sisi_id",
            key: "sisi_id",
          },
          {
            title: "Хүсэлтийн тэмдэглэл",
            dataIndex: "req_note",
            key: "req_note",
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
      }
    } catch (err) {
      console.error("Fetch error:", err);
      notification.error({
        message: "Алдаа",
        description: "Сэдвийн хүсэлтүүдийг татаж чадсангүй.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
    const interval = setInterval(fetchTopics, 5000);
    return () => clearInterval(interval);
  }, [fetchTopics]);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4">
      <Spin spinning={loading}>
        <CustomTable
          columns={columns}
          dataSource={dataSource}
          bordered
          scroll={{ x: "max-content" }}
          hasLookupField={true}
          onRefresh={fetchTopics}
        />
      </Spin>

      {isModalOpen && (
        <ApproveDetail
          isModalOpen={isModalOpen}
          data={selectedRowData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RequestedTopicList;
