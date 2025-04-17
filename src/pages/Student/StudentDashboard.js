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
  Empty
} from "antd";
import AboutThesisTabs from "../../components/thesis/ThesisTabs";

//TODO::EDIT 
import {
  studentOutlined,
  ScheduleOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import api from "../../context/api_helper";

import { Container } from "reactstrap";
import { useAuth } from "../../context/AuthContext";
const { Title, Text, Paragraph } = Typography;
const StudentDashboard = () => {
  const { user } = useAuth();
    const [loading, setLoading] = useState(true);
 // const [thesis, setThesis] = useState(student?.thesis ?? {});
  const [thesis, setThesis] = useState([]);
   const [student, setStudent] = useState([]);
    const [supervisor, setSupervisor] = useState([]);
    const [thesisCycle, setThesisCycle] = useState([]);
        const [tasks, setTasks] = useState([]); //Tasks and subtasks data
    
      const [gradingSchema, setGradingSchema] = useState([]);
      const [score, setScore] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const thesis = await api.get(`/thesisInfo/${user.thesis.id}`);

        setThesis(thesis.data.data);
        setStudent(thesis.data.data.student);
        setSupervisor(thesis.data.data.supervisor);
        setGradingSchema(thesis.data.data.thesis_cycle.grading_schema);
        setThesisCycle(thesis.data.data.thesis_cycle);
        setScore(thesis.data.data.scores);
        setTasks(thesis.data.data.tasks);

        console.log(thesis.data.data.thesis_cycle)
      } catch (error) {
        console.error("Өгөгдөл татахад алдаа гарлаа:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
}, [user.thesis.id]);


  const recentTasks = [
  ];


  return (
    <>
      <div style={{ padding: "20px" }}>
        <h3 className="mb-4">Бакалаврын судалгааны ажил удирдах систем</h3>

        <Row gutter={[16, 16]}>
        <Col md={16} xs={24}>
      {thesis ? (
        <Card style={{ padding: 16 }} bordered={false} hoverable>
          <Title level={5}>{thesis.name_mongolian}</Title>
          <Text type="secondary">{thesis.name_english}</Text>
          <Paragraph style={{ marginTop: 12 }}>
            {thesis.description}
          </Paragraph>
        </Card>
      ) : (
        <Card style={{ textAlign: 'center', padding: 32 }} bordered={false}>
          <Empty description="Бакалаврын судалгааны ажил олдсонгүй" />
        </Card>
      )}
    </Col>

    <Col span={8}>
  <Card title="Оюутны мэдээлэл" bordered={false}>
    <p>
      <b>Нэр:</b> {student.lastname} {student.firstname}
    </p>
    <p>
      <b>Хөтөлбөр:</b> {student.program}
    </p>
    <p>
      <b>Семестр:</b> {thesisCycle.semester} - {thesisCycle.year} / {thesisCycle.end_year}
    </p>
  </Card>
</Col>

        </Row>

        <Row style={{ marginTop: 24 }} gutter={[16, 16]}>


          <Col span={16}>
            <Card>
            <AboutThesisTabs
                    id={thesis.id}
                    gradingSchema={gradingSchema}
                    thesisCycle={thesisCycle}
                    score={score}
                    tasks={tasks}
                  />

              {/* <List
                item="horizontal"
                dataSource={recentTasks}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<FileTextOutlined />} />}
                      title={item.title}
                      description={`Status: ${item.status}`}
                    />
                  </List.Item>
                )}
              /> */}
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Quick Access" bordered={false}>
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
