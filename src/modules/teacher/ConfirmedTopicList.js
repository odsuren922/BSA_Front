import React, { useState, useEffect, useCallback } from "react";
import { Spin, Button, notification, message, Popconfirm } from "antd";
import { fetchData, postData } from "../../utils";
import CustomTable from "../../components/CustomTable";

<<<<<<< HEAD
=======
// ✅ fields parse-г найдвартай хийх функц
const parseFields = (raw) => {
  try {
    const parsed = JSON.parse(raw); // зөвхөн нэг parse
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("❌ Failed to parse fields:", raw, e);
    return [];
  }
};

>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
const ConfirmedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
<<<<<<< HEAD
      const response = await fetchData("topics/confirmed-by-teacher");

      const rawData = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data || [];

      if (!Array.isArray(rawData)) {
        throw new Error("Invalid data format from backend");
      }

      const transformedData = rawData.map((item) => {
        let fieldsArray = [];
        try {
          fieldsArray =
            typeof item.fields === "string"
              ? JSON.parse(item.fields)
              : item.fields;
        } catch (error) {
          console.error("fields parse error:", error);
        }

        const fieldsObject = Array.isArray(fieldsArray)
          ? fieldsArray.reduce(
              (acc, field) => ({
                ...acc,
                [field.field]: field.value,
                [`${field.field}_name`]: field.field2,
              }),
              {}
            )
          : {};

        return { ...item, ...fieldsObject, key: item.id };
=======
      const response = await fetchData("topics_confirmed");
      const rawData = response.data?.data ?? response;

      if (!Array.isArray(rawData)) {
        throw new Error("Invalid data format received from API");
      }

      const transformedData = rawData.map((item) => {
        const fieldsArray = parseFields(item.fields);
        const fieldsObject = fieldsArray.reduce((acc, field) => {
          acc[field.field] = field.value;
          acc[`${field.field}_name`] = field.field2;
          return acc;
        }, {});
        return { ...item, ...fieldsObject, key: item.id || item.topic_id };
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });

      setDataSource(transformedData);

<<<<<<< HEAD
      // Dynamic Columns
      if (transformedData.length > 0) {
        const sampleFields =
          typeof transformedData[0].fields === "string"
            ? JSON.parse(transformedData[0].fields)
            : transformedData[0].fields;

        const dynamicColumns = Array.isArray(sampleFields)
          ? sampleFields
              .filter((field) =>
                ["name_mongolian", "name_english"].includes(field.field)
              )
              .map((field) => ({
                title: field.field2,
                dataIndex: field.field,
                key: field.field,
              }))
          : [];
=======
      const example = rawData.find((item) => item.fields);
      if (example) {
        const fieldsArray = parseFields(example.fields);

        const dynamicColumns = fieldsArray
          .filter((field) =>
            ["name_mongolian", "name_english"].includes(field.field)
          )
          .map((field) => ({
            title: field.field2,
            dataIndex: field.field,
            key: field.field,
          }));
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

        setColumns([
          ...dynamicColumns,
          {
            title: "Сонгосон оюутан",
            key: "fullname",
            render: (_, record) => {
<<<<<<< HEAD
              const lastInit = record.lastname?.charAt(0) || "";
              return `${lastInit}.${record.firstname || ""}`;
=======
              const firstLetterOfLastName = record.lastname?.charAt(0) || "";
              return `${firstLetterOfLastName}.${record.firstname}`;
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
            },
          },
          {
            title: "Сиси ID",
            dataIndex: "sisi_id",
            key: "sisi_id",
          },
          {
            title: "Үйлдэл",
            key: "actions",
            fixed: "right",
            width: 150,
            render: (_, record) => (
              <Popconfirm
<<<<<<< HEAD
                title="Та энэ сэдвийг цуцлахдаа итгэлтэй байна уу?"
=======
                title="Та цуцлахдаа итгэлтэй байна уу?"
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
                onConfirm={() => handleAction(record)}
                okText="Тийм"
                cancelText="Үгүй"
              >
                <Button type="default">Цуцлах</Button>
              </Popconfirm>
            ),
          },
        ]);
      }
    } catch (error) {
<<<<<<< HEAD
      console.error("Error fetching confirmed topics:", error);
      notification.error({
        message: "Алдаа",
        description: "Сэдвийн мэдээллийг татаж чадсангүй!",
=======
      console.error("❌ Error fetching topics:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch topics. Check console for details.",
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAction = useCallback(
    async (data) => {
      try {
        const payload = {
          topic_id: data.topic_id,
          req_id: data.req_id,
          student_id: data.created_by_id,
          res_date: new Date().toISOString().replace("T", " ").slice(0, 19),
        };

        await postData("topic_decline", payload);

        notification.success({
          message: "Амжилттай",
          description: "Сэдвийг амжилттай цуцаллаа!",
        });

<<<<<<< HEAD
        fetchTopics(); // refresh
      } catch (error) {
        console.error("Error cancelling topic:", error);
=======
        fetchTopics();
      } catch (error) {
        console.error("❌ Error declining topic:", error);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        message.error("Алдаа гарлаа!");
      }
    },
    [fetchTopics]
  );

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

export default ConfirmedTopicList;
