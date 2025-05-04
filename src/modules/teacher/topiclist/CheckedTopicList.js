import React, { useState, useEffect, useCallback } from "react";
<<<<<<< HEAD
import { Spin, notification, Tag } from "antd";
=======
import { Spin, notification } from "antd";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
<<<<<<< HEAD

      const transformedData = rawData.map((item) => {
        let fieldsArray = [];
        try {
          const parsed = JSON.parse(item.fields);
          fieldsArray = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
        } catch (err) {
          console.error("Failed to parse fields:", item.fields, err);
        }

=======
      const transformedData = rawData.map((item) => {
        const fieldsArray = JSON.parse(item.fields);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        const fieldsObject = fieldsArray.reduce(
          (acc, field) => ({
            ...acc,
            [field.field]: field.value,
            [`${field.field}_name`]: field.field2,
          }),
          {}
        );
<<<<<<< HEAD

        return {
          ...item,
          ...fieldsObject,
          fieldsArray,
          key: item.id,
        };
=======
        return { ...item, ...fieldsObject, key: item.id };
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });

      setDataSource(transformedData);

<<<<<<< HEAD
      // Динамик баганууд + төлөв багана
      if (transformedData.length > 0) {
        const firstItem = transformedData[0];
        const dynamicFields = firstItem.fieldsArray || [];

        const dynamicColumns = dynamicFields
          .filter((field) =>
            ["name_english", "name_mongolian", "description"].includes(field.field)
=======
      if (transformedData.length > 0) {
        const dynamicColumns = JSON.parse(transformedData[0].fields)
          .filter((field) =>
            ["name_english", "name_mongolian", "description"].includes(
              field.field
            )
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
          )
          .map((field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          }));

<<<<<<< HEAD
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

=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      notification.error({
<<<<<<< HEAD
        message: "Алдаа",
        description: "Сэдвийн мэдээллийг татахад алдаа гарлаа.",
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
