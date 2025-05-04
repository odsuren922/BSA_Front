import React, { useState, useEffect } from "react";
import { Button, Form, Modal, Row, Col, Alert } from "react-bootstrap";
//TODO:: can create thesis Schema

import api from "../../context/api_helper";
const CycleFormModal = ({ show, onHide, onSubmit, cycle,user,gradingSchemas }) => {
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    end_year:  new Date().getFullYear(),
    semester: "Намар",
    start_date: "",
    end_date: "",
    grading_schema_id: "",
    status: "Идэвхитэй",
    dep_id: user.dep_id,
});
  const [dateError, setDateError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal

  useEffect(() => {
    if (cycle) {
    
      setFormData(cycle);
    } else {
      setFormData({
        name: "",
        year: new Date().getFullYear(),
        end_year:  new Date().getFullYear()+1,
        semester: "Намар",
        start_date: "",
        end_date: "",
        grading_schema_id: "",
        status: "Идэвхитэй",
        dep_id: user.dep_id,
      });
    }
  }, [cycle]);


  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    if (updatedFormData.start_date && updatedFormData.end_date) {
      if (updatedFormData.end_date < updatedFormData.start_date) {
        setDateError("Дуусах өдөр эхлэх өдрөөс өмнө байж болохгүй.");
      } else {
        setDateError("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateError) return;
    onSubmit(formData);
  };

  // Show confirmation modal before deleting
  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirmed = () => {
    setShowDeleteConfirm(false);
    const updatedData = { ...formData, status: "Устгах" };
    onSubmit(updatedData);
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return "";

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;

    if (diffTime < 0) return "Тохиромжгүй огноо";

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    return `${weeks} долоо хоног ${days} өдөр`;
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {cycle ? "Edit Cycle" : "Шинэ судалгааны ажлын цикл үүсгэх"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="cycleName">
                  <Form.Label>БСА нэр</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="year">
                  <Form.Label>Хичээлийн жил</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="end_year">
                  <Form.Label>Хичээлийн жил</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={formData.end_year}
                    onChange={(e) =>
                      setFormData({ ...formData, end_year: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="semester">
                  <Form.Label>Улирал</Form.Label>
                  <Form.Select
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                  >
                    <option>Намар</option>
                    <option>Хавар</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="start_date">
                  <Form.Label>Эхлэх өдөр</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    required
                    value={formData.start_date}
                    onChange={handleDateChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="end_date">
                  <Form.Label>Дуусах өдөр</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    required
                    value={formData.end_date}
                    onChange={handleDateChange}
                  />
                  {dateError && <Alert variant="danger">{dateError}</Alert>}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="grading_schema_id">
                  <Form.Label>Дүгнэх аргачлал сонгох</Form.Label>
                  <Form.Select
                    value={formData.grading_schema_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grading_schema_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Сонгох</option>
                    {gradingSchemas.map((schema) => (
                      <option key={schema.id} value={schema.id}>
                        {schema.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="status">
                  <Form.Label>Төлөв</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Идэвхитэй">Идэвхитэй</option>
                    <option value="Хаагдсан">Хаагдсан</option>
                    <option value="Хүлээгдэж буй">Хүлээгдэж буй</option>
                    <option value="Цуцлагдсан">Цуцлагдсан</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          {formData.start_date && formData.end_date && (
            <Alert variant="info">
              Хугацаа:{" "}
              {calculateDuration(formData.start_date, formData.end_date)}
            </Alert>
          )}

          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Цуцлах
            </Button>
            {/* Delete Button (only for existing cycles) */}
            {cycle && (
              <Button variant="danger" onClick={confirmDelete}>
                Устгах
              </Button>
            )}
            <Button variant="primary" type="submit" disabled={!!dateError}>
              {cycle ? "Хадгалах" : "Үүсгэх"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Баталгаажуулах</Modal.Title>
        </Modal.Header>
        <Modal.Body>Та энэ БСА-г устгахдаа итгэлтэй байна уу?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Үгүй
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmed}>
            Тийм, устгах
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CycleFormModal;
