import React, { useState, useEffect, useCallback } from "react";
import { Spin, Button, notification, Tag } from "antd";
import CustomTable from "../../components/CustomTable";
import TopicDetail from "../TopicDetail";
import { fetchData } from "../../utils";

const CheckedTopicList = ({ active }) => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = useCallback(async () => {
    if (!active) return;
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

        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      notification.error({
        message: "Алдаа",
        description: "Сэдвүүдийг татаж чадсангүй. Дахин оролдоно уу.",
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
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CheckedTopicList;
