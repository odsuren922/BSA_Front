import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Button, message, notification, Input } from "antd";
import { postData } from "../utils";

const ApproveDetail = ({ isModalOpen, data, onClose, onActionComplete }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    console.log("Modal Data:", data);
    setNote(""); // reset note when modal opens
  }, [data]);

  const renderFields = () => {
    if (!data) return <p>Мэдээлэл олдсонгүй.</p>;

    const topFields = [
      { label: "Гарчиг (монгол)", value: data.title_mn },
      { label: "Гарчиг (англи)", value: data.title_en },
      { label: "Тайлбар", value: data.description },
    ];

    const renderedTopFields = (
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        {topFields.map((field, index) => (
          <Col key={index} span={8}>
            <div>
              <strong>{field.label}</strong>
              <div style={{ color: "#595959", fontWeight: 500 }}>{field.value}</div>
            </div>
          </Col>
        ))}
      </Row>
    );

    const fieldValues = data.field_values || [];
    const rows = [];
    for (let i = 0; i < fieldValues.length; i += 3) {
      rows.push(fieldValues.slice(i, i + 3));
    }

    const renderedFieldValues = rows.map((row, rowIndex) => (
      <Row key={rowIndex} gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        {row.map((fv, colIndex) => (
          <Col key={colIndex} span={8}>
            <div>
              <strong>{fv.field?.name}</strong>
              <div style={{ color: "#595959", fontWeight: 500 }}>{fv.value}</div>
            </div>
          </Col>
        ))}
      </Row>
    ));

    return (
      <>
        {renderedTopFields}
        {renderedFieldValues}
        <div style={{ marginTop: 24 }}>
          <strong>Тайлбар (заавал биш)</strong>
          <Input.TextArea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Энд өөрийн тайлбараа бичнэ үү..."
          />
        </div>
      </>
    );
  };

  const handleAction = async () => {
    try {
      const payload = {
        topic_id: data.id,
        note: note,
      };

      await postData("proposal-topic-requests", payload);

      notification.success({
        message: "Амжилттай",
        description: "Сэдвийн хүсэлт амжилттай илгээгдлээ!",
      });

      if (onActionComplete) onActionComplete();
      onClose();
    } catch (error) {
      console.error("❌ Error handling topic confirm:", error);
      message.error("Алдаа гарлаа!");
    }
  };

  const renderFooter = () => [
    <Button key="cancel" onClick={onClose}>
      Болих
    </Button>,
    <Button key="confirm" type="primary" onClick={handleAction}>
      Сэдэв сонгох хүсэлт гаргах
    </Button>,
  ];

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
