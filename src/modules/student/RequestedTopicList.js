import React, { useState, useEffect, useCallback } from "react";
import { Spin, notification, Button } from "antd";
import { fetchData } from "../../utils";
import ApproveDetail from "../ApproveDetail";
import CustomTable from "../../components/CustomTable";
import { useUser } from "../../context/UserContext"; // teacher id авах

const RequestedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const { user } = useUser(); // Багшийн мэдээлэл авах
  const teacherId = user?.id;

  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetchData("topic_requests");
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
    const intervalId = setInterval(fetchTopics, 5000);
    return () => clearInterval(intervalId);
  }, [fetchTopics]);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchTopics();
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
          onRefresh={handleRefresh}
        />
      </Spin>
      {isModalOpen && (
        <ApproveDetail
          isModalOpen={isModalOpen}
          data={selectedRowData}
          onClose={() => setIsModalOpen(false)}
          onActionComplete={fetchTopics} // баталсны дараа refresh
        />
      )}
    </div>
  );
};

export default RequestedTopicList;
