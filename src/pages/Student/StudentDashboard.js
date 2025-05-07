// StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Menu,
  Card,
  Row,
  Col,
  Progress,
  List,
  Avatar,
  Button,
  Typography,
  Empty,
} from "antd";
import AboutThesisTabs from "../../components/thesis/ThesisTabs";


import {
  studentOutlined,
  ScheduleOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import api from "../../context/api_helper";

import { Container } from "reactstrap";
// import { useAuth } from "../../context/AuthContext";
import { UserProvider, useUser } from "../../context/UserContext";
const { Title, Text, Paragraph } = Typography;
const StudentDashboard = () => {

  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  // const [thesis, setThesis] = useState(student?.thesis ?? {});
  const [thesis, setThesis] = useState([]);
  const [student, setStudent] = useState(user);
  const [supervisor, setSupervisor] = useState([]);
  const [thesisCycle, setThesisCycle] = useState([]);
  const [tasks, setTasks] = useState([]); //Tasks and subtasks data

  const [gradingSchema, setGradingSchema] = useState([]);
  const [score, setScore] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("user", user);
        const thesis = await api.get(`/thesisInfoBySid`);
        console.log(thesis.data.data);
        setThesis(thesis.data.data);

        setSupervisor(thesis.data.data.supervisor);

        if (thesis?.data?.data?.thesis_cycle) {
          setThesisCycle(thesis.data.data.thesis_cycle);
          setGradingSchema(thesis.data.data.thesis_cycle.grading_schema);
        } else {
          setThesisCycle(null); // or set default/fallback value
        }
        setScore(thesis.data.data.scores);
        if (thesis?.data?.data?.tasks) {
          setTasks(thesis.data.data.tasks);
        } else {
          setTasks(null);
        }
      } catch (error) {
        console.error("Өгөгдөл татахад алдаа гарлаа:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  const recentTasks = [];

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h3 className="mb-4">Бакалаврын судалгааны ажлын удирдах систем</h3>

        <Row gutter={[16, 16]}>
          <Col md={16} xs={24}>
            {thesis.id ? (
              <Card style={{ padding: 16 }} bordered={false} hoverable>
                <Title level={5}>{thesis.name_mongolian}</Title>
                <Text type="secondary">{thesis.name_english}</Text>
                <Paragraph style={{ marginTop: 12 }}>
                  {thesis.description}
                </Paragraph>
              </Card>
            ) : (
              <Card
                style={{ textAlign: "center", padding: 32 }}
                bordered={false}
              >
                <Empty description="Бакалаврын судалгааны ажил олдсонгүй" />
              </Card>
            )}
          </Col>

          <Col span={8}>
            <Card title="Оюутны мэдээлэл" bordered={false}>
              <p>
              <b>Нэр:</b> {(student.firstname || student.fnamem)} {(student.lastname || student.lnamem)}

              </p>
              <p>
                <b>Хөтөлбөр:</b> {(student.program || student.pname) }
              </p>
              <p>
                <b>Sisi id :</b> {(student.num_id || student.cardnr) }
              </p>
              <p>
                <p>
                  <b>Семестр:</b>{" "}
                  {thesisCycle?.semester &&
                  thesisCycle?.year &&
                  thesisCycle?.end_year ? (
                    `${thesisCycle.semester} - ${thesisCycle.year} / ${thesisCycle.end_year}`
                  ) : (
                    <span style={{ color: "#999" }}>Тодорхойгүй</span>
                  )}
                </p>
              </p>
            </Card>
          </Col>
        </Row>

        <Row style={{ marginTop: 24 }} gutter={[16, 16]}>
          <Col span={16}>
            <Card>
              <AboutThesisTabs
               thesis ={thesis}
                id={thesis.id}
                gradingSchema={gradingSchema}
                thesisCycle={thesisCycle}
                score={score}
                tasks={tasks}
                supervisor={supervisor}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Мэдэгдэл" bordered={false}>
              {/* <Button
                icon={<ScheduleOutlined />}
                block
                style={{ marginBottom: 8 }}
              >
                Schedule
              </Button>
              <Button icon={<BookOutlined />} block style={{ marginBottom: 8 }}>
                Grades
              </Button>
              <Button icon={<studentOutlined />} block>
                Profile
              </Button> */}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default StudentDashboard;
