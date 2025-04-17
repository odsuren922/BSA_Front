import React, { useState, useEffect, useCallback } from "react";
import { Spin, Button, notification, message, Popconfirm } from "antd";
import { fetchData, postData } from "../../utils";
import CustomTable from "../../components/CustomTable";

const ConfirmedTopicList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
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
      });

      setDataSource(transformedData);

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

        setColumns([
          ...dynamicColumns,
          {
            title: "Сонгосон оюутан",
            key: "fullname",
            render: (_, record) => {
              const lastInit = record.lastname?.charAt(0) || "";
              return `${lastInit}.${record.firstname || ""}`;
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
                title="Та энэ сэдвийг цуцлахдаа итгэлтэй байна уу?"
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
      console.error("Error fetching confirmed topics:", error);
      notification.error({
        message: "Алдаа",
        description: "Сэдвийн мэдээллийг татаж чадсангүй!",
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

        fetchTopics(); // refresh
      } catch (error) {
        console.error("Error cancelling topic:", error);
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
