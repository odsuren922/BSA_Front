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
      // Хэт давхар escape хийсэн JSON string болхоор хоёр удаа parse хийнэ
      const onceParsed = typeof rawFields === "string" ? JSON.parse(rawFields) : rawFields;
      return typeof onceParsed === "string" ? JSON.parse(onceParsed) : onceParsed;
    } catch (error) {
      console.error("⚠️ Fields parse error:", rawFields, error);
      return [];
    }
  };

  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetchData("topic_requests");
      const rawData = response.data;

      if (!rawData || !Array.isArray(rawData)) {
        throw new Error("Invalid data format received from API");
      }

      const transformedData = rawData.map((item) => {
        const fieldsArray = parseFields(item.fields);

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
          key: item.req_id || item.id || item.topic_id,
        };
      });

      setDataSource(transformedData);

      if (transformedData.length > 0) {
        const sampleFields = parseFields(transformedData[0].fields);

        const dynamicColumns = sampleFields
          .filter((field) => ["name_mongolian"].includes(field.field))
          .map((field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          }));

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
              <div style={{ display: "flex", gap: "8px" }}>
                <Button type="default" onClick={() => handleDetails(record)}>
                  Дэлгэрэнгүй
                </Button>
              </div>
            ),
          },
        ]);
      }

      setLoading(false);
    } catch (error) {
      console.log("Error fetching topics:", error);
      notification.error({
        message: "Error",
        description: "Сэдвийн хүсэлт татахад алдаа гарлаа.",
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
