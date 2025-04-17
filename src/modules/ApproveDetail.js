import React, { useEffect } from "react";
import { Modal, Row, Col, Button, message, notification, Popconfirm } from "antd";
import { postData } from "../utils";

const ApproveDetail = ({ isModalOpen, data, onClose, onActionComplete }) => {
  useEffect(() => {
    console.log("Modal Data:", data);
  }, [data]);

  const renderFields = () => {
    if (!data?.fields) return null;

    let fieldsArray = [];

    try {
      fieldsArray =
        typeof data.fields === "string" ? JSON.parse(data.fields) : data.fields;
    } catch (err) {
      console.error("fields parse алдаа:", err);
      return <div>Мэдээллийг уншиж чадсангүй</div>;
    }

    const rows = [];
    for (let i = 0; i < fieldsArray.length; i += 3) {
      rows.push(fieldsArray.slice(i, i + 3));
    }

    return rows.map((row, rowIndex) => (
      <Row key={rowIndex} gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        {row.map((field, colIndex) => (
          <Col key={colIndex} span={8}>
            <div>
              <strong>{field.field2}</strong>
              <div style={{ color: "#595959", fontWeight: "500" }}>
                {field.value}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    ));
  };

  const handleAction = async (actionType) => {
    try {
      const payload = {
        topic_id: data.topic_id,
        req_id: data.req_id,
        student_id: data.created_by_id,
        res_date: new Date().toISOString().replace("T", " ").slice(0, 19),
        action: actionType, // e.g., 'approve' or 'refuse'
      };

      await postData("topic_confirm", payload);

      notification.success({
        message: "Амжилттай",
        description:
          actionType === "approve"
            ? "Сэдвийг амжилттай зөвшөөрлөө!"
            : "Сэдвийг татгалзлаа!",
      });

      if (onActionComplete) onActionComplete();
      onClose();
    } catch (error) {
      console.error("Action error:", error);
      message.error("Алдаа гарлаа!");
    }
  };

  const renderFooter = () => (
    <>
      <Button onClick={onClose}>Хаах</Button>

      <Popconfirm
        title="Сэдвийг татгалзах уу?"
        onConfirm={() => handleAction("refuse")}
        okText="Тийм"
        cancelText="Үгүй"
      >
        <Button danger>Татгалзах</Button>
      </Popconfirm>

      <Button type="primary" onClick={() => handleAction("approve")}>
        Зөвшөөрөх
      </Button>
    </>
  );

  return (
    <Modal
      title="Сэдвийн дэлгэрэнгүй"
      open={isModalOpen}
      onCancel={onClose}
      width={800}
      footer={renderFooter()}
    >
      {renderFields()}
    </Modal>
  );
};

export default ApproveDetail;
