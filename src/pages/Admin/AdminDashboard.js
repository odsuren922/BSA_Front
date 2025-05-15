import React, { useState, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  ListGroup,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";
import { Spin, Skeleton } from "antd";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";

import { Empty } from "antd";
import { Link } from "react-router-dom";
import { CalendarPlus, PeopleFill } from "react-bootstrap-icons";
import api from "../../context/api_helper";
//import { useAuth } from "../../context/AuthContext";
import { UserProvider, useUser } from "../../context/UserContext";

import GradingSchemaTable from "../../components/grading/GradingSchemaTable";
const AdminDashboard = () => {
  const { user } = useUser();
  const [thesisCycle, setThesisCycle] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [gradingLoading, setGradingLoading] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const [gradingSchema, setGradingSchema] = useState([]);
  const [showGradingModal, setShowGradingModal] = useState(false);

  useEffect(() => {
    fetchtasks();
  }, []);
  const fetchtasks = async () => {
    console.log(user);
    try {
      //   const response = await api.get(`/active-cycles`);
      console.log("dep_id",user.dep_id);
      const response = await api.get("/active-cycles", {
        params: { dep_id: user.dep_id },
      });
      console.log('response', response.data);

      if (response.data && response.data.id) {
        setThesisCycle(response.data);
      } else {
        setThesisCycle(null); // эсвэл false гэж тохируулж болно
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setThesisCycle(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchGradingSchema = async () => {
    if (!thesisCycle?.id) return;
    setGradingLoading(true); // эхлэх үед
    try {
      const response = await api.get(
        `/thesis-cycles/${thesisCycle.id}/grading-schema`
      );
      console.log("Grading schema response:", response.data);
      setGradingSchema(response.data);
    } catch (error) {
      console.error("Error fetching grading schema:", error);
    } finally {
      setGradingLoading(false); // дуусах үед
    }
  };

  const quickActions = [
    {
      title: "Шинэ улирал үүсгэх",
      icon: <CalendarPlus size={20} />,
      link: "/thesis-cycles",
    },
    {
      title: "Комисс товлох",
      icon: <PeopleFill size={20} />,
      link: "/CommitteeScheduler",
    },
  ];


  
  

  return (
    <Container fluid className="p-4">
      <Breadcrumbs breadcrumbItem="Бакалаврын судалгааны ажлын удирдах систем" />
      {/* Stats Row */}
      <Row className="mb-4 mt-2">
        <Col xs={12} md={8} className="mb-3">
          <Card
            title={loading ? "Уншиж байна..." : thesisCycle ? null : ""}
            className="mb-4 shadow-sm border-0 rounded-3"
          >
            {loading ? (
              <Card.Body className="mt-2 ms-3">
                <Skeleton active />
              </Card.Body>
            ) : thesisCycle ? (
            //     <ThesisCycleCard
            //     thesisCycle={thesisCycle}
            //     fetchGradingSchema={fetchGradingSchema}
            //     setShowGradingModal={setShowGradingModal}
            //     navigate={navigate}
            //   />
            <Card
            className="shadow-sm border-0 rounded-3"
            onClick={() => {
              console.log("Card clicked");
              // optionally toggle something
            }}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="mt-2 ms-3">
              <p><strong>Он:</strong> {thesisCycle.year}</p>
              <p><strong>Семестр:</strong> {thesisCycle.semester}</p>
              <p><strong>Эхлэх огноо:</strong> {thesisCycle.start_date}</p>
              <p><strong>Дуусах огноо:</strong> {thesisCycle.end_date}</p>
              <p><strong>Харьяалагдах БСА-ын тоо:</strong> {thesisCycle.totalTheses}</p>
        
              <div className="mt-3 d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    console.log("Үнэлгээний схем товч дарагдлаа");
                    await fetchGradingSchema();
                    setShowGradingModal(true);
                  }}
                >
                  Үнэлгээний схем харах
                </button>
        
                <button
                  className="btn btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Дэлгэрэнгүй товч дарагдлаа");
                    navigate(`/allthesis/${thesisCycle.id}`);
                  }}
                  style={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
                >
                  Дэлгэрэнгүй харах
                </button>
              </div>
            </Card.Body>
          </Card>
              
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Идэвхтэй семестр олдсонгүй"
              >
                <Link to="/thesis-cycles">
                  <Button type="primary">Шинэ цикл үүсгэх</Button>
                </Link>
              </Empty>
            )}
          </Card>
        </Col>

        <Col xs={24} md={4}>
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="d-flex align-items-center py-3">
              <div className="card-body text-center">
                <div className="d-flex justify-content-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="User avatar"
                      className="rounded-circle"
                      style={{ width: "64px", height: "64px" }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: "64px", height: "64px" }}
                    >
                      <i className="bi bi-person-circle fs-2 text-secondary"></i>
                    </div>
                  )}
                </div>

                <h5 className="card-title mt-3">
                  {user.firstname} {user.lastname}
                </h5>
                <p className="text-muted">
                  Мэдээллийн технологи, электроникийн сургууль
                </p>
                <p>
                  <strong>{user.superior}</strong>
                </p>
                <p>{user.phone}</p>
                <p>{user.mail}</p>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0 pt-0"></Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        {/* Recent Activity */}

        <Col md={8} className="mb-4">
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Header as="h5">Мэдээлэл</Card.Header>
            <Card.Body>


                
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col md={4}>
          <Card>
            <Card.Header as="h5">Шуурхай үйлдлүүд</Card.Header>
            <ListGroup variant="flush">
              {quickActions.map((action, index) => (
                <ListGroup.Item
                  key={index}
                  action
                  href={action.link}
                  className="d-flex align-items-center"
                >
                  <span className="me-3">{action.icon}</span>
                  {action.title}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Modal
        show={showGradingModal}
        onHide={() => setShowGradingModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Үнэлгээний схем</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {gradingLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : thesisCycle ? (
            <GradingSchemaTable
              gradingSchema={gradingSchema}
              thesisCycle={thesisCycle}
              cycleId={thesisCycle.id}
            />
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
