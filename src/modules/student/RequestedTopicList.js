import React, { useState, useEffect, useCallback } from "react";
<<<<<<< HEAD
import { Spin, notification, Button } from "antd";
import { fetchData } from "../../utils";
import ApproveDetail from "../ApproveDetail";
import CustomTable from "../../components/CustomTable";
import { useUser } from "../../context/UserContext"; // teacher id авах
=======
import { Spin, notification, Button, Tag } from "antd";
import { fetchData } from "../../utils";
import ApproveDetail from "../ApproveDetail";
import CustomTable from "../../components/CustomTable";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

const RequestedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
<<<<<<< HEAD
  const { user } = useUser(); // Багшийн мэдээлэл авах
  const teacherId = user?.id;
=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetchData("topic_requests");
<<<<<<< HEAD
      const rawData = response.data;

      if (!Array.isArray(rawData)) {
        throw new Error("Invalid data format received from API");
      }

      // Зөвхөн тухайн багштай холбоотой хүсэлтийг шүүх
      const filteredData = rawData.filter(
        (item) =>
          item.created_by_type === "student" &&
          item.topic?.status === "approved" &&
          item.topic?.created_by_type === "student" &&
          item.is_selected === false
      );

      const transformedData = filteredData.map((item) => {
        try {
          const fieldsArray = JSON.parse(item.fields || "[]");
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
        } catch (error) {
          console.error("Error parsing fields:", item.fields, error);
          return { ...item, key: item.id };
        }
=======
      const rawData = response.data ?? response;

      if (!rawData || !Array.isArray(rawData)) {
        throw new Error("Invalid data format received from API");
      }

      const transformedData = rawData.map((item) => {
        let parsedFields = {};
        try {
          const firstParse = JSON.parse(item.fields);
          const fieldsArray = JSON.parse(firstParse);

          parsedFields = fieldsArray.reduce((acc, field) => {
            acc[field.field] = field.value;
            acc[`${field.field}_name`] = field.field2;
            return acc;
          }, {});
        } catch (error) {
          console.warn("❗ Failed to parse fields:", item.fields);
        }

        const status = item.is_selected ? "approved" : "submitted";

        return {
          ...item,
          ...parsedFields,
          key: item.id,
          status,
        };
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });

      setDataSource(transformedData);

<<<<<<< HEAD
      if (transformedData.length > 0) {
        const dynamicColumns = [
          {
            title: "Сэдвийн нэр (Монгол)",
            dataIndex: "name_mongolian",
            key: "name_mongolian",
          },
          {
            title: "Хүсэлт илгээсэн оюутан",
            render: (record) =>
              `${record.lastname?.charAt(0)}.${record.firstname}` || "-",
            key: "student",
          },
          {
            title: "SISI ID",
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
        ];

        setColumns(dynamicColumns);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching topics:", error);
      notification.error({
        message: "Error",
        description: "Хүсэлтүүдийг татахад алдаа гарлаа.",
      });
=======
      // Dynamic columns
      const dynamicColumns = [];

      if (rawData.length > 0) {
        try {
          const firstParse = JSON.parse(rawData[0].fields);
          const firstFields = JSON.parse(firstParse);

          dynamicColumns.push(
            ...firstFields
              .filter((field) =>
                ["name_mongolian", "name_english", "description"].includes(field.field)
              )
              .map((field) => ({
                title: field.field2,
                dataIndex: field.field,
                key: field.field,
              }))
          );
        } catch (err) {
          console.warn("❗ Failed to parse fields for columns:", rawData[0].fields);
        }
      }

      // Static columns
      dynamicColumns.push(
        {
          title: "Хүсэлт илгээсэн",
          dataIndex: "requested_by_type",
          key: "requested_by_type",
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
<<<<<<< HEAD
    const intervalId = setInterval(fetchTopics, 5000);
=======
    const intervalId = setInterval(fetchTopics, 10000);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    return () => clearInterval(intervalId);
  }, [fetchTopics]);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

<<<<<<< HEAD
  const handleRefresh = () => {
    fetchTopics();
  };

=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  return (
    <div className="p-4">
      <Spin spinning={loading}>
        <CustomTable
          columns={columns}
          dataSource={dataSource}
          bordered
          scroll={{ x: "max-content" }}
          hasLookupField={true}
<<<<<<< HEAD
          onRefresh={handleRefresh}
        />
      </Spin>
=======
          onRefresh={fetchTopics}
        />
      </Spin>

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      {isModalOpen && (
        <ApproveDetail
          isModalOpen={isModalOpen}
          data={selectedRowData}
          onClose={() => setIsModalOpen(false)}
<<<<<<< HEAD
          onActionComplete={fetchTopics} // баталсны дараа refresh
=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        />
      )}
    </div>
  );
};

export default RequestedTopicList;
