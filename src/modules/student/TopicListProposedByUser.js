import React, { useState, useEffect, useCallback } from "react";
<<<<<<< HEAD
import { Spin, Tag, notification, Button } from "antd";
import { fetchData } from "../../utils";
=======
import { Spin, Tag, notification } from "antd";
import { fetchData, safeParseJSON } from "../../utils";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
import CustomTable from "../../components/CustomTable";
import { useUser } from "../../context/UserContext";

const TopicListProposedByUser = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const { user } = useUser();

  const userType = user?.email === "teacher@gmail.com" ? "teacher" : "student";

  const fetchTopics = useCallback(async () => {
    setLoading(true);
<<<<<<< HEAD
=======

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    try {
      const endpoint = `topics/topiclistproposedbyuser?user_type=${userType}`;
      const rawData = await fetchData(endpoint);

      const transformedData = rawData.map((item) => {
<<<<<<< HEAD
        let fieldsObject = {};
        try {
          const fieldsArray = JSON.parse(item.fields || "[]");
          fieldsObject = fieldsArray.reduce(
            (acc, field) => ({
              ...acc,
              [field.field]: field.value,
              [`${field.field}_name`]: field.field2,
            }),
            {}
          );
        } catch (e) {
          console.warn("Invalid JSON in fields:", item.fields);
        }

=======
        const fieldsArray = safeParseJSON(item.fields, []);
        const fieldsObject = fieldsArray.reduce(
          (acc, field) => ({
            ...acc,
            [field.field]: field.value,
            [`${field.field}_name`]: field.field2,
          }),
          {}
        );
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        return { ...item, ...fieldsObject, key: item.id };
      });

      setDataSource(transformedData);

      if (transformedData.length > 0) {
<<<<<<< HEAD
        const firstRowFields = JSON.parse(transformedData[0].fields || "[]");
        const dynamicColumns = firstRowFields.map((field) => ({
          title: field.field2,
          dataIndex: field.field,
          key: field.field,
        }));
=======
        const dynamicColumns = safeParseJSON(transformedData[0].fields, []).map(
          (field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          })
        );
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

        dynamicColumns.push({
          title: "Төлөв",
          dataIndex: "status",
          key: "status",
          fixed: "right",
          filters: [
            { text: "Баталсан", value: "approved" },
            { text: "Татгалзсан", value: "refused" },
            { text: "Дэвшүүлсэн", value: "submitted" },
          ],
          onFilter: (value, record) => record.status === value,
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
        });

        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      notification.error({
<<<<<<< HEAD
        message: "Алдаа",
        description: "Сэдвүүдийг татахад алдаа гарлаа.",
=======
        message: "Error",
        description: "Failed to fetch topics. Please try again later.",
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });
    } finally {
      setLoading(false);
    }
  }, [userType]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return (
    <div className="p-4">
      <Spin spinning={loading}>
<<<<<<< HEAD
=======

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        <CustomTable
          bordered
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: "max-content" }}
          hasLookupField={true}
          onRefresh={fetchTopics}
        />
      </Spin>
    </div>
  );
};

export default TopicListProposedByUser;
