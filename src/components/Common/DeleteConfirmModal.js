// components/common/DeleteConfirmModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";

const DeleteConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = "Баталгаажуулах",
  message = "Та устгахдаа итгэлтэй байна уу?",
  confirmText = "Тийм, устгах",
  cancelText = "Үгүй",
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;
