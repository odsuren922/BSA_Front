import React, { useState, useEffect, useCallback } from "react";
import { Spin, notification, Button, Tag } from "antd";
import { fetchData } from "../../utils";
import ApproveDetail from "../ApproveDetail";
import CustomTable from "../../components/CustomTable";

// ✅ Найдвартай parse хийдэг туслах функц
const safeParseFields = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("❌ Failed to parse fields:", raw, e);
    return [];
  }
};

const RequestedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetchData("topic_requests");
      const rawData = response.data?.data ?? response;

      if (!Array.isArray(rawData)) {
        throw new Error("Invalid data format received from API");
      }

      const transformedData = rawData.map((item) => {
        const fieldsArray = safeParseFields(item.fields);
        const parsedFields = fieldsArray.reduce((acc, field) => {
          acc[field.field] = field.value;
          acc[`${field.field}_name`] = field.field2;
          return acc;
        }, {});

        const status =
          item.status === "confirmed"
            ? "confirmed"
            : item.is_selected
            ? "approved"
            : item.status === "refused"
            ? "refused"
            : "submitted";

        return {
          ...item,
          ...parsedFields,
          status,
          key: item.req_id || item.id,
        };
      });

      setDataSource(transformedData);

      // ✅ Dynamic Columns
      const example = rawData.find((item) => item.fields);
      const dynamicColumns = [];

      if (example) {
        const fieldsArray = safeParseFields(example.fields);
        dynamicColumns.push(
          ...fieldsArray
            .filter((field) =>
              ["name_mongolian", "name_english", "description"].includes(field.field)
            )
            .map((field) => ({
              title: field.field2,
              dataIndex: field.field,
              key: field.field,
            }))
        );
      }

      // ✅ Static Columns
      dynamicColumns.push(
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
          title: "Төлөв",
          dataIndex: "status",
          key: "status",
          render: (status) => {
            const statusMap = {
              approved: { text: "Баталсан", color: "blue" },
              refused: { text: "Татгалзсан", color: "red" },
              submitted: { text: "Дэвшүүлсэн", color: "green" },
              confirmed: { text: "Баталгаажсан", color: "purple" },
            };
            const { text, color } = statusMap[status] || {
              text: "Тодорхойгүй",
              color: "gray",
            };
            return <Tag color={color}>{text}</Tag>;
          },
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
        }
      );

      setColumns(dynamicColumns);
    } catch (error) {
      console.error("❌ Error fetching topic requests:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch topics. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
    const intervalId = setInterval(fetchTopics, 10000);
    return () => clearInterval(intervalId);
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
