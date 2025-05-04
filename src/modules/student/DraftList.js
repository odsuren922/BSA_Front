import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Table, Spin, Button, message, Modal } from "antd";
import { fetchData, postData } from "../../utils";
=======
import { Table, Spin, Button } from "antd";
import { fetchData } from "../../utils";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
import DraftDetail from "../DraftDetail";

const DraftList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

<<<<<<< HEAD
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const rawData = await fetchData("topics/draftstudent");
      const transformedData = rawData.map((item) => {
        let fieldsArray = [];

        try {
          fieldsArray = JSON.parse(item.fields);
        } catch (e) {
          console.warn("Invalid JSON in fields");
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
          key: item.id,
        };
      });

      setDataSource(transformedData);

      // Dynamic columns
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
            title: "Үйлдэл",
            key: "actions",
            fixed: "right",
            width: 200,
            render: (_, record) => (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button type="default" onClick={() => handleDetails(record)}>
                  Дэлгэрэнгүй
                </Button>
                <Button type="primary" onClick={() => handleResubmit(record)}>
                  Дахин дэвшүүлэх
                </Button>
              </div>
            ),
          },
        ];
        setColumns(dynamicColumns);
      }
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
=======
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const rawData = await fetchData("topics/draftstudent");
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

<<<<<<< HEAD
  const handleResubmit = (record) => {
    Modal.confirm({
      title: "Сэдвийг дахин дэвшүүлэх үү?",
      content: "Та энэ сэдвийг дахин хянагч багшид илгээх гэж байна.",
      okText: "Тийм",
      cancelText: "Үгүй",
      onOk: async () => {
        try {
          const payload = {
            topic_id: record.id,
            status: "submitted",
          };
          await postData(`topic/store`, payload, "post");
          message.success("Сэдвийг дахин дэвшүүллээ.");
          fetchTopics();
        } catch (err) {
          console.error("Resubmit error:", err);
          message.error("Алдаа гарлаа. Сэдвийг дахин илгээж чадсангүй.");
        }
      },
    });
  };

=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
