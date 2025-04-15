import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Modal,
  Row,
  Col,
  Alert,
  Table,
  Card,
  Badge,
} from "react-bootstrap";
import { Plus, Trash, Pencil, Calculator } from "react-bootstrap-icons";
import { Collapse } from "antd";
import api from "../../context/api_helper";
import SchemaEditorModal from "../../components/thesisCycle/SchemaEditorModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GradingSchemaManagement = () => {
  const [schemas, setSchemas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editSchema, setEditSchema] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteID, setDeleteID] = useState(null);

  useEffect(() => {
    fetchGradingSchemas();
  }, []);

  const fetchGradingSchemas = async () => {
    try {
      const response = await api.get("/grading-schemas");
      setSchemas(response.data);
    } catch (error) {
      console.error("Error fetching schemas:", error);
    }
  };
  const confirmDelete = async (schemaId) => {
    setShowDeleteConfirm(true);
    setDeleteID(schemaId);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    const schemaId = deleteID;
    //if (window.confirm("Are you sure you want to delete this schema?")) {
    try {
      await api.delete(`/grading-schemas/${schemaId}`);
      setDeleteID(null);
      setSchemas(schemas.filter((s) => s.id !== schemaId));
      toast.success("Амжилттай устаглаа!");
    } catch (error) {
      console.error("Error deleting schema:", error);
      toast.error("Устгаж чадсангүй!");
    }
    // }
  };

  return (
    <>
      <div>
        <Row className="mb-3">
          <Col>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus className="me-2" />
              Шинээр нэмэх
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Card className="p-3">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Нэр</th>
                    <th>Жил</th>
                    <th>Үйлдлүүд</th>
                  </tr>
                </thead>
                <tbody>
                  {schemas.map((schema, index) => (
                    <tr key={schema.id}>
                      <td>{index + 1}</td>
                      <td>{schema.name}</td>
                      <td>{schema.year}</td>
                      <td>
                        <Button
                          variant="link"
                          onClick={() => {
                            setEditSchema(schema);
                            setShowModal(true);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="link"
                          className="text-danger"
                          // onClick={() => handleDelete(schema.id)}
                          onClick={() => confirmDelete(schema.id)}
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>

            <Collapse className="mt-4" style={{ border: "none" }}>
              {/*       <Collapse accordion className="mt-4"> */}
              {schemas.map((schema) => (
                <Collapse.Panel
                  key={schema.id}
                  header={`${schema.name} (${schema.year})`}
                  className="mb-3"
                  style={{ backgroundColor: "#fdfdfd" }}
                >
                  <div className="p-0">
                    {schema.grading_components?.map((component, index) => (
                      <div key={index} className="mb-4">
                        <h5>
                          {component.name} ({component.score}%)
                        </h5>
                        <p>
                          <strong></strong>  {component.scheduled_week} -р долоо хоногт
                        </p>
                        <p>
                          <strong>Дүгнэгч:</strong> {component.by_who}
                        </p>
                        {component.grading_criteria?.length > 0 && (
                          <>
                            <h6>Шалгуур үзүүлэлтүүд:</h6>
                            <ul>
                              {component.grading_criteria.map(
                                (criteria, idx) => (
                                  <li key={idx}>
                                    {criteria.name} - {criteria.score} оноо
                                  </li>
                                )
                              )}
                            </ul>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </Collapse.Panel>
              ))}
            </Collapse>
          </Col>
        </Row>

        <SchemaEditorModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setEditSchema(null);
          }}
          onSubmit={fetchGradingSchemas}
          schema={editSchema}
        />
      </div>

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
          <Button variant="danger" onClick={handleDelete}>
            Тийм, устгах
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GradingSchemaManagement;
