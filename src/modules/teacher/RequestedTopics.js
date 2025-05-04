import React, { useState, useEffect, useCallback } from "react";
<<<<<<< HEAD
import { Spin, notification, Button } from "antd";
=======
import { Spin, notification, Button, Tag } from "antd";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
import { fetchData } from "../../utils";
import ApproveDetail from "../ApproveDetail";
import CustomTable from "../../components/CustomTable";

<<<<<<< HEAD
=======
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

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
const RequestedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

<<<<<<< HEAD
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
=======
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
          acc[field.field] = field.value;
          acc[`${field.field}_name`] = field.field2;
          return acc;
        }, {});

<<<<<<< HEAD
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
=======
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
<<<<<<< HEAD
    const interval = setInterval(fetchTopics, 5000);
    return () => clearInterval(interval);
=======
    const intervalId = setInterval(fetchTopics, 10000);
    return () => clearInterval(intervalId);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
