import React, { useState, useEffect, useCallback } from "react";
import { Spin, Tag, notification } from "antd";
import { fetchData, safeParseJSON } from "../../utils";
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
    try {
      const endpoint = `topics/topiclistproposedbyuser?user_type=${userType}`;
      const rawData = await fetchData(endpoint);

      const transformedData = rawData.map((item) => {
        const fieldsArray = safeParseJSON(item.fields, []);
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

      if (transformedData.length > 0) {
        const dynamicColumns = safeParseJSON(transformedData[0].fields, []).map(
          (field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          })
        );

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
        message: "Error",
        description: "Failed to fetch topics. Please try again later.",
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
