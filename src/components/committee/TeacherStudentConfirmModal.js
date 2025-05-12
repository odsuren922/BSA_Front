// components/TeacherStudentConfirmModal.js
import React from "react";
import { Modal, Form, InputNumber, Button } from "antd";

const TeacherStudentConfirmModal = ({
  visible,
  onCancel,
  onConfirm,
  customTeacherCount,
  setCustomTeacherCount,
  customStudentCount,
  setCustomStudentCount,
}) => {
  return (
    <Modal
      title="Багш, оюутны тоог шалгах"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Болих
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            onCancel();
            onConfirm();
          }}
        >
          Үргэлжлүүлэх
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item label="Багш нарын тоо">
          <InputNumber
            style={{ width: "100%" }}
            value={customTeacherCount}
            onChange={setCustomTeacherCount}
          />
        </Form.Item>
        <Form.Item label="Оюутнуудын тоо">
          <InputNumber
            style={{ width: "100%" }}
            value={customStudentCount}
            onChange={setCustomStudentCount}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeacherStudentConfirmModal;
