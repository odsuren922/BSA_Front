import React from "react";
import { Modal } from "antd";

const ConfirmModal = ({ open, onOk, onCancel, content }) => {
  return (
    <Modal
      title="Баталгаажуулалт"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Тийм"
      cancelText="Үгүй"
      centered
    >
      <p>{content}</p>
    </Modal>
  );
};

export default ConfirmModal;
