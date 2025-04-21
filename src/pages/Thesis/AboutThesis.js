import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../context/api_helper";
import { useAuth } from "../../context/AuthContext";
import ThesisScores from "./ThesisScore";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
} from "reactstrap";
import { Button, Spin, Typography } from "antd";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Divider } from "antd";
import AboutThesisTabs from "../../components/thesis/ThesisTabs";
const { Title, Text, Paragraph } = Typography;
const AboutThesis = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [student, setStudent] = useState([]);
  const [supervisor, setSupervisor] = useState([]);

  const [thesis, setThesis] = useState([]);
  const [thesisCycle, setThesisCycle] = useState([]);

  const [gradingSchema, setGradingSchema] = useState([]);
  const [score, setScore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]); //Tasks and subtasks data
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const thesis = await api.get(`/thesisInfo/${id}`);
        console.log(thesis.data.data);
        setThesis(thesis.data.data);
        setStudent(thesis.data.data.student);
        setSupervisor(thesis.data.data.supervisor);
        setGradingSchema(thesis.data.data.thesis_cycle.grading_schema);
        setThesisCycle(thesis.data.data.thesis_cycle);
        setScore(thesis.data.data.scores);
        setTasks(thesis.data.data.tasks);
      } catch (error) {
        console.error("Өгөгдөл татахад алдаа гарлаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Ачаалж байна..." />
      </div>
    );
  }
  if (!thesis) {
    return (
      <Container className="text-center mt-5">
        <p className="text-muted">Төгсөлтийн ажлын мэдээлэл олдсонгүй.</p>
      </Container>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container className="mt-4 mb-10">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="m-0 leading-none">
              <Button
                type="text"
                className="p-0 text-lg flex items-center"
                onClick={() => navigate(-1)}
                icon={<span className="text-xl">←</span>}
              />
              Бакалаврын судалгааны ажил
            </h4>
          </div>

          <Row gutter={[16, 16]}>
            <Col md={9} xs={12}>
              <Card className="p-4 shadow-sm">
                <CardBody>
                  <CardTitle tag="h5">{thesis.name_mongolian}</CardTitle>
                  <CardSubtitle tag="h6" className="mb-2 text-muted">
                    {thesis.name_english}
                  </CardSubtitle>
                  <CardText>{thesis.description}</CardText>

                  <AboutThesisTabs
                  thesis ={thesis}
                    id={thesis.id}
                    gradingSchema={gradingSchema}
                    thesisCycle={thesisCycle}
                    score={score}
                    tasks={tasks}
                    supervisor={supervisor}
                  />
                </CardBody>
              </Card>
            </Col>

            <Col md={3} xs={12}>
              <Card className="p-3 shadow-sm">
                <Divider>Удирдагч багш</Divider>

                {/* <h5>Удирдагч багш</h5> */}
                {supervisor ? (
                  <p>
                    {supervisor.superior}
                    <br />
                    {supervisor.firstname} {supervisor.lastname}
                    <br />
                    <span className="text-muted">Имэйл:{supervisor.mail}</span>
                  </p>
                ) : (
                  <p className="text-muted">Одоогоор удирдагчгүй</p>
                )}
                {/* <h5>Суралцагч</h5> */}
                <Divider>Суралцагч</Divider>
                {student ? (
                  <p>
                    {student.firstname} {student.lastname}
                    <br />
                    <span className="text-muted">{student.program}</span>
                    <br />
                    <span className="text-muted">ID: {student.sisi_id}</span>
                    <br />
                    <span className="text-muted">Утас: {student.phone}</span>
                    <br />
                    <span className="text-muted">Имэйл: {student.mail}</span>
                  </p>
                ) : (
                  <p className="text-muted">Оюутан олдсонгүй</p>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default AboutThesis;
