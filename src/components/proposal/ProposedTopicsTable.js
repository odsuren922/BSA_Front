import React from "react";
import { Table, Tag, Select, message, Button, Popconfirm } from "antd";
import { fetchData, postData } from "../../utils";
import { DeleteOutlined } from "@ant-design/icons";

const ProposedTopicsTable = ({ data, setData, type, onEdit }) => {
  const handleStatusChange = async (topic, newStatus) => {
    try {
      await postData(`proposed-topics/${topic.id}/status`, {
        status: newStatus,
      }, "put");

      setData((prev) =>
        prev.map((item) =>
          item.id === topic.id
            ? {
                ...item,
                status: newStatus,
                statusMn: newStatus === "draft" ? "Ноорог" : "Илгээсэн",
              }
            : item
        )
      );

      message.success("Төлөв амжилттай шинэчлэгдлээ");
    } catch (error) {
      console.error("Failed to update status:", error);
      message.error("Төлөв шинэчлэхэд алдаа гарлаа");
    }
  };

  const handleDelete = async (topicId) => {
    try {
      await postData(`proposed-topics/${topicId}`, {}, "delete");
      setData((prev) => prev.filter((item) => item.id !== topicId));
      message.success("Сэдэв амжилттай устгагдлаа");
    } catch (error) {
      console.error("Failed to delete topic:", error);
      message.error("Сэдэв устгахад алдаа гарлаа");
    }
  };

  const statusOptions = [
    { value: "draft", label: "Ноорог" },
    { value: "submitted", label: "Илгээсэн" },
    // { value: "rejected", label: "Татгалзсан" },
  ];

  const columns = [
    {
      title: "Сэдэв (Монгол)",
      dataIndex: "title_mn",
      key: "title_mn",
    },
    {
      title: "Topic (English)",
      dataIndex: "title_en",
      key: "title_en",
    },
    {
      title: "Тайлбар",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Талбарууд",
      key: "field_values",
      render: (_, record) => (
        <div>
          {record.field_values.map((fv, index) => (
            <div key={index}>
              <strong>{fv.field?.name}:</strong> {fv.value}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Төлөв",
      key: "status",
      render: (_, record) =>
        type === "owner" && !["approved", "rejected"].includes(record.status) ? (
          <Select
            value={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record, value)}
            options={statusOptions}
          />
        ) : (
          <Tag color={record.statusMn === "Зөвшөөрөгдсөн" ? "green" : "orange"}>
            {record.statusMn}
          </Tag>
        ),
    },
    {
        title: "Үйлдэл",
        key: "actions",
        render: (_, record) =>
          type === "owner" &&
          ["draft", "rejected"].includes(record.status) ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <Button type="link" onClick={() => onEdit(record)}>
                Засах
              </Button>
              <Popconfirm
                title="Та энэ сэдвийг устгахдаа итгэлтэй байна уу?"
                onConfirm={() => handleDelete(record.id)}
                okText="Тийм"
                cancelText="Үгүй"
              >
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          ) : null,
      },
      
      
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      bordered
      pagination={{ pageSize: 10 }}
    />
  );
};

export default ProposedTopicsTable;
