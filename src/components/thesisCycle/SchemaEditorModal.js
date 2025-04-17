import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { Calculator } from "react-bootstrap-icons";
import api from "../../context/api_helper";
import { toast } from "react-toastify";
import { Trash } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

//TODO:: step_num nemeh->component number aas oldog bolgoh

const SchemaEditorModal = ({ show, onHide, onSubmit, schema }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    year: new Date().getFullYear(),
    grading_components: [],
  });

  useEffect(() => {
    if (schema) {
      setFormData({
        name: schema.name,
        description: schema.description || "",
        year: schema.year,
        grading_components: schema.grading_components,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        year: new Date().getFullYear(),
        grading_components: [],
      });
    }
  }, [schema]);

  const handleAddComponent = () => {
    setFormData((prev) => ({
      ...prev,
      grading_components: [
        ...prev.grading_components,
        { name: "", score: "", by_who: "Удирдагч багш", scheduled_week: "" },
      ],
    }));
  };

  const calculateTotal = () => {
    return formData.grading_components.reduce(
      (sum, comp) => sum + Number(comp.score || 0),
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.year) {
      alert("Бүх шаардлагатай талбаруудыг бөглөнө үү");
      return;
    }

    try {
      if (schema) {
        console.log("wtf", formData);
        console.log("schema_id", schema.id);
        const res = await api.put(`/grading-schemas/${schema.id}`, formData);
        console.log("res", res);
      } else {
        console.log("formData", formData);
        await api.post("/grading-schemas", formData);
      }
      onSubmit();
      onHide();
      toast.success("Схемийг амжилттай хадгаллаа!");
    } catch (error) {
      toast.error("Схемийг хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
      console.error(error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <Calculator className="me-2" />
          {schema ? "Шалгалтын схемийг засах" : "Шинэ схем үүсгэх"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Схемийн нэр</Form.Label>
                <Form.Control
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Он</Form.Label>
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
            <Col md={12}>
              <Form.Group>
                <Form.Label>Тайлбар</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="border-top pt-4">
            <h5>Үнэлгээний задаргаа</h5>
            {formData.grading_components.map((component, compIndex) => (
              <div key={compIndex} className="border p-3 mb-3">
                <Row className="g-3 mb-3">
                  <Col md={4}>
                    <Form.Control
                      placeholder="Нэр"
                      value={component.name}
                      onChange={(e) => {
                        const updated = [...formData.grading_components];
                        updated[compIndex].name = e.target.value;
                        setFormData({
                          ...formData,
                          grading_components: updated,
                        });
                      }}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="number"
                      placeholder="Оноо %"
                      value={component.score}
                      onChange={(e) => {
                        const updated = [...formData.grading_components];
                        updated[compIndex].score = e.target.value;
                        setFormData({
                          ...formData,
                          grading_components: updated,
                        });
                      }}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={component.by_who}
                      onChange={(e) => {
                        const updated = [...formData.grading_components];
                        updated[compIndex].by_who = e.target.value;
                        setFormData({
                          ...formData,
                          grading_components: updated,
                        });
                      }}
                    >
                      <option value="supervisor">Удирдагч багш</option>
                      <option value="committee">Комисс</option>
                      <option value="examiner">Шүүмж багш</option>
                    </Form.Select>
                  </Col>

                  <Col md={2}>
                    <Form.Control
                      //  type="datepicker"
                      placeholder="Долоо хоног"
                      value={component.scheduled_week}
                      onChange={(e) => {
                        const updated = [...formData.grading_components];
                        updated[compIndex].scheduled_week = e.target.value;
                        setFormData({
                          ...formData,
                          grading_components: updated,
                        });
                      }}
                    />
                  </Col>

                  <Col md={1} className="d-flex align-items-center">
                    <Button
                      variant="danger"
                      onClick={() => {
                        const updated = formData.grading_components.filter(
                          (_, index) => index !== compIndex
                        );
                        setFormData({
                          ...formData,
                          grading_components: updated,
                        });
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}

            <Button onClick={handleAddComponent} className="mt-3 ">
              Задаргаа нэмэх
            </Button>
            {/* <Button variant="danger" onClick={handleAddComponent} className="mt-3 ms-3">
              Компонент нэмэх
            </Button> */}
            <Alert
              variant={calculateTotal() === 100 ? "success" : "danger"}
              className="mt-3"
            >
              Нийт жин: {calculateTotal()}%
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Цуцлах
          </Button>
          <Button variant="primary" type="submit">
            {schema ? "Өөрчлөлт хадгалах" : "Схем үүсгэх"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SchemaEditorModal;
