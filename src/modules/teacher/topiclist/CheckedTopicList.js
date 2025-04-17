import React, { useState, useEffect, useCallback } from "react";
import { Spin, notification, Tag } from "antd";
import CustomTable from "../../../components/CustomTable";
import { fetchData } from "../../../utils";

const CheckedTopicList = ({ active }) => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);

  const fetchTopics = useCallback(async () => {
    if (!active) return;

    setLoading(true);
    try {
      const rawData = await fetchData("topics/checkedtopics");

      const transformedData = rawData.map((item) => {
        let fieldsArray = [];
        try {
          const parsed = JSON.parse(item.fields);
          fieldsArray = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
        } catch (err) {
          console.error("Failed to parse fields:", item.fields, err);
        }

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
          fieldsArray,
          key: item.id,
        };
      });

      setDataSource(transformedData);

      // Динамик баганууд + төлөв багана
      if (transformedData.length > 0) {
        const firstItem = transformedData[0];
        const dynamicFields = firstItem.fieldsArray || [];

        const dynamicColumns = dynamicFields
          .filter((field) =>
            ["name_english", "name_mongolian", "description"].includes(field.field)
          )
          .map((field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          }));

        dynamicColumns.push({
          title: "Төлөв",
          dataIndex: "is_selected",
          key: "is_selected",
          render: (val, record) => {
            return record.is_selected ? (
              <Tag color="blue">Баталсан</Tag>
            ) : (
              <Tag color="red">Татгалзсан</Tag>
            );
          },
        });

        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      notification.error({
        message: "Алдаа",
        description: "Сэдвийн мэдээллийг татахад алдаа гарлаа.",
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

export default CheckedTopicList;
