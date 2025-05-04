import React, { useState, useEffect, useCallback } from "react";
<<<<<<< HEAD
import { Spin, Button, notification, Tag } from "antd";
import CustomTable from "../../components/CustomTable";
import TopicDetail from "../TopicDetail";
import { fetchData } from "../../utils";
=======
import { Spin, Button, notification } from "antd";
import { fetchData } from "../../utils";
import TopicDetail from "../TopicDetail";
import CustomTable from "../../components/CustomTable";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

const CheckedTopicList = ({ active }) => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = useCallback(async () => {
    if (!active) return;
<<<<<<< HEAD
    setLoading(true);

    try {
      const rawData = await fetchData("topics/checkedtopics");

      const transformedData = rawData.map((item) => {
        let fieldsArray = [];
        try {
          fieldsArray = JSON.parse(item.fields);
        } catch (error) {
          console.warn("Invalid fields JSON:", item.fields);
        }

        const fieldsObject = fieldsArray.reduce((acc, field) => {
          acc[field.field] = field.value;
          acc[`${field.field}_name`] = field.field2;
          return acc;
        }, {});

        return {
          ...item,
          ...fieldsObject,
          key: item.id,
        };
=======

    setLoading(true);
    try {
      const rawData = await fetchData("topics/checkedtopics");
      const transformedData = rawData.map((item) => {
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });

      setDataSource(transformedData);

      if (transformedData.length > 0) {
<<<<<<< HEAD
        const dynamicColumns = [
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
            title: "Удирдагч багш",
            dataIndex: "advisor_name",
            key: "advisor_name",
            render: (text) => text || "-",
          },
          {
            title: "Төлөв",
            dataIndex: "status",
            key: "status",
            render: (status) => (
              <Tag color={status === "approved" ? "green" : "red"}>
                {status === "approved" ? "Баталсан" : "Түтгэлзүүлсэн"}
              </Tag>
            ),
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
=======
        const dynamicColumns = JSON.parse(transformedData[0].fields)
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      notification.error({
<<<<<<< HEAD
        message: "Алдаа",
        description: "Сэдвүүдийг татаж чадсангүй. Дахин оролдоно уу.",
=======
        message: "Error",
        description: "Failed to fetch topics. Please try again later.",
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    let intervalId;
    if (active) {
      fetchTopics();
      intervalId = setInterval(fetchTopics, 5000);
    }
    return () => clearInterval(intervalId);
  }, [active, fetchTopics]);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

<<<<<<< HEAD
=======
  const closeDetailModal = () => {
    setIsModalOpen(false);
  };

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  return (
    <div className="p-4">
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
      {isModalOpen && (
        <TopicDetail
          isModalOpen={isModalOpen}
          data={selectedRowData}
<<<<<<< HEAD
          onClose={() => setIsModalOpen(false)}
=======
          onClose={closeDetailModal}
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        />
      )}
    </div>
  );
};

export default CheckedTopicList;
