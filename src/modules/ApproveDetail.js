import React, { useEffect } from "react";
<<<<<<< HEAD
import { Modal, Row, Col, Button, message, notification, Popconfirm } from "antd";
=======
import { Modal, Row, Col, Button, message, notification } from "antd";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
import { postData } from "../utils";

const ApproveDetail = ({ isModalOpen, data, onClose, onActionComplete }) => {
  useEffect(() => {
    console.log("Modal Data:", data);
  }, [data]);

  const renderFields = () => {
    if (!data?.fields) return null;

    let fieldsArray = [];

    try {
<<<<<<< HEAD
      fieldsArray =
        typeof data.fields === "string" ? JSON.parse(data.fields) : data.fields;
    } catch (err) {
      console.error("fields parse алдаа:", err);
      return <div>Мэдээллийг уншиж чадсангүй</div>;
    }

=======
      const firstParse = JSON.parse(data.fields);
      fieldsArray = JSON.parse(firstParse); // stringified JSON array
    } catch (error) {
      console.error("❗ Failed to parse fields in ApproveDetail:", error);
      return <p>Мэдээллийг уншиж чадсангүй.</p>;
    }

    // 3 баганатай харуулахын тулд мөрөөр нь хуваах
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
<<<<<<< HEAD
              <div style={{ color: "#595959", fontWeight: "500" }}>
=======
              <div
                style={{
                  color: "#595959",
                  fontWeight: "500",
                }}
              >
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
                {field.value}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    ));
  };

<<<<<<< HEAD
  const handleAction = async (actionType) => {
=======
  const handleAction = async (action) => {
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    try {
      const payload = {
        topic_id: data.topic_id,
        req_id: data.req_id,
        student_id: data.created_by_id,
        res_date: new Date().toISOString().replace("T", " ").slice(0, 19),
<<<<<<< HEAD
        action: actionType, // e.g., 'approve' or 'refuse'
=======
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      };

      await postData("topic_confirm", payload);

      notification.success({
        message: "Амжилттай",
<<<<<<< HEAD
        description:
          actionType === "approve"
            ? "Сэдвийг амжилттай зөвшөөрлөө!"
            : "Сэдвийг татгалзлаа!",
=======
        description: "Сэдвийг амжилттай зөвшөөрлөө!",
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      });

      if (onActionComplete) onActionComplete();
      onClose();
    } catch (error) {
<<<<<<< HEAD
      console.error("Action error:", error);
=======
      console.error("❌ Error handling topic confirm:", error);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      message.error("Алдаа гарлаа!");
    }
  };

<<<<<<< HEAD
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
=======
  const renderFooter = () => [
    <Button key="cancel" onClick={onClose}>
      Болих
    </Button>,
    <Button key="confirm" type="primary" onClick={() => handleAction("submitted")}>
      Зөвшөөрөх
    </Button>,
  ];

  return (
    <Modal
      title="Дэлгэрэнгүй"
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
