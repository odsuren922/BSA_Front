import React from "react";
import { Table, Tag, Select, message ,Button} from "antd";

const ProposedTopicsTable = ({ data, setData, type,onEdit }) => {
    
    
    const handleStatusChange = async (topic, newStatus) => {
        try {
            //TODO:: CHANGE THE STATUS
          await fetch(`/api/proposed-topics/${topic.id}/update-status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          });
      
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
      
      const statusOptions = [
        { value: "draft", label: "Ноорог" },
        { value: "submitted", label: "Илгээсэн" },
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
      title: "Талбарууд (Field Values)",
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
          type === "owner" && record.status !=='approved'? (
            <div style={{ display: "flex", gap: "8px" }}>
              <Select
                value={record.status}
                style={{ width: 120 }}
                onChange={(value) => handleStatusChange(record, value)}
                options={statusOptions}
              />
            </div>
          ) : (<Tag color={record.statusMn === "Илгээсэн" ? "green" : "orange"}>
            {record.statusMn}
          </Tag>),
      },
      {
        title: "Үйлдэл",
        key: "actions",
        render: (_, record) =>
          type === "owner" ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <Button type="link"  onClick={() => onEdit(record)}>
                Засах
              </Button>
            </div>
          ) : null,
      }
      
      
  ];

  return (
    <div>
      {/* <h2>Сэдэвүүдийн жагсаалт</h2> */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        bordered
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default ProposedTopicsTable;
