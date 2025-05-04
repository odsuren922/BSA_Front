import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Table, Spin, Button, notification } from "antd";
=======
import { Table, Spin, Button } from "antd";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
import { fetchData } from "../../utils";
import DraftDetail from "../DraftDetail";

const DraftList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

<<<<<<< HEAD
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
=======
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const rawData = await fetchData("topics/draftteacher");
        const transformedData = rawData.map((item) => {
          if (!item.fields) {
            return { ...item, key: item.id };
          }

          const fieldsArray = JSON.parse(item.fields);
          const fieldsObject = fieldsArray.reduce(
            (acc, field) => ({
              ...acc,
              [field.field]: field.value,
              [`${field.field}_name`]: field.field2,
            }),
            {}
          );

          return { ...item, ...fieldsObject, key: item.id };
        });

        setDataSource(transformedData);

        const firstRowFields = rawData.find((item) => item.fields);
        if (firstRowFields) {
          const dynamicColumns = JSON.parse(firstRowFields.fields)
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

          setColumns([
            ...dynamicColumns,
            {
              title: "Үйлдэл",
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
        console.error("Error fetching topics:", error);
        setLoading(false);
      }
    };

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
<<<<<<< HEAD

=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
