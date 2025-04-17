import React, { useState, useEffect } from "react";
import { Table, Spin, Button, message, Modal } from "antd";
import { fetchData, postData } from "../../utils";
import DraftDetail from "../DraftDetail";

const DraftList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

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
    fetchTopics();
  }, []);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

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
