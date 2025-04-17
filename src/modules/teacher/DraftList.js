import React, { useState, useEffect } from "react";
import { Table, Spin, Button, notification } from "antd";
import { fetchData } from "../../utils";
import DraftDetail from "../DraftDetail";

const DraftList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const rawData = await fetchData("topics/draftteacher");

      const transformedData = rawData.map((item) => {
        let fieldsArray = [];
        try {
          fieldsArray = JSON.parse(item.fields || "[]");
        } catch (err) {
          console.error("Invalid JSON in item.fields:", item.fields);
        }

        const fieldsObject = fieldsArray.reduce((acc, field) => {
          acc[field.field] = field.value;
          acc[`${field.field}_name`] = field.field2;
          return acc;
        }, {});

        return { ...item, ...fieldsObject, fieldsArray, key: item.id };
      });

      setDataSource(transformedData);

      if (transformedData.length > 0) {
        const dynamicColumns = transformedData[0].fieldsArray
          .filter((field) =>
            ["name_english", "name_mongolian", "description"].includes(
              field.field
            )
          )
          .map((field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          }));

        dynamicColumns.push({
          title: "Үйлдэл",
          key: "actions",
          fixed: "right",
          width: 150,
          render: (_, record) => (
            <Button type="default" onClick={() => handleDetails(record)}>
              Дэлгэрэнгүй
            </Button>
          ),
        });

        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching draft topics:", error);
      notification.error({
        message: "Алдаа",
        description: "Ноорог сэдвүүдийг татахад алдаа гарлаа.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4">
      <Spin spinning={loading}>
        <Table
          bordered
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: "max-content" }}
        />
      </Spin>

      {isModalOpen && (
        <DraftDetail
          isModalOpen={isModalOpen}
          data={selectedRowData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DraftList;
