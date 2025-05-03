import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  InputNumber,
  List,
  Tag,
  Alert,
  Statistic,
  Typography,
  Avatar,
  Table,
  Collapse,
  Spin,
} from "antd";
import {
  CalculatorOutlined,
  TeamOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CommitteeCalculator from "../../../components/committee/CommitteeCalculator";
import api from "../../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { Title, Text } = Typography;

const CommitteeManagement = ({ cycleId, componentId, user }) => {
  const [committees, setCommittees] = useState([]);

  const [gradingComponent, setGradingComponent] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [studentCounts, setStudentCounts] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customTeacherCount, setCustomTeacherCount] = useState(0);
  const [customStudentCount, setCustomStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [scoreForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [cycleId, user.dep_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [committeesRes, counts] = await Promise.all([
        api.get(
          `/thesis-cycles/${cycleId}/grading-components/${componentId}/committees`
        ),
        api.get(`/thesis-cycles/${cycleId}/counts`),
      ]);
      console.log("committeesRes.data.data.", counts.data);

      //   setTheses(ThesisDate.data);
      //   setGradingComponent(gradingComponent.data);
      setGradingComponent(committeesRes.data.data.grading_component);

      const committeesData = committeesRes.data.data;
      const roleOrder = {
        leader: 1,
        secretary: 2,
        member: 3,
      };
      console.log("committeesData", committeesData);
      setCommittees(committeesData);
      //   setCommittees(committeesWithScores);

      setCustomTeacherCount(counts.data.teacher_count);
      setCustomStudentCount(
        counts.data.program_counts.reduce(
          (sum, item) => sum + item.student_count,
          0
        )
      );
      setStudentCounts(counts.data.program_counts);
    } catch (error) {
      console.error("Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScoreModal = (committee) => {
    setSelectedCommittee(committee);
    setTimeout(() => {
      scoreForm.resetFields();
      const initialValues = getInitialFormValues(committee);
      scoreForm.setFieldsValue(initialValues);
    }, 0);
  };
  const roleColorMap = {
    member: "blue",
    secretary: "orange",
    leader: "red",
  };

  const getCommitteeColor = () => {
    const softColors = [
      "rgba(245, 34, 45, 0.15)", // red
      "rgba(250, 173, 20, 0.15)", // gold
      "rgba(19, 194, 194, 0.15)", // cyan
      "rgba(82, 196, 26, 0.15)", // green
      "rgba(250, 84, 28, 0.15)", // volcano
      // "rgba(47, 84, 235, 0.15)",    // blue
      "rgba(114, 46, 209, 0.15)", // purple
      "rgba(255, 215, 0, 0.15)", // yellow/gold
      "rgba(0, 0, 0, 0.05)", // light gray
      "rgba(24, 144, 255, 0.15)", // geekblue
      "rgba(255, 192, 203, 0.15)", // pink
    ];

    const index = Math.floor(Math.random() * softColors.length);
    return softColors[index];
  };
  const refreshCommittees = fetchData;

  const handleCreateCommittees = ({ committees }) => {
    Promise.all(
      committees.map((c) =>
        api.post("/committees", {
          name: c.name,
          dep_id: user.dep_id,
          grading_component_id: componentId,
          thesis_cycle_id: cycleId,
          color: getCommitteeColor(),
        })
      )
    )

      .then(() => {
        toast.success("Комиссууд амжилттай үүсгэгдлээ");
        refreshCommittees();
      })
      .catch(() => toast.error("Үүсгэхэд алдаа гарлаа"));
  };

  const handleSubmitScores = async (values) => {
    const payload = [];

    Object.entries(values).forEach(([studentKey, teachers]) => {
      const student = selectedCommittee.students.find(
        (s) => s.id.toString() === studentKey.toString()
      );

      Object.entries(teachers).forEach(([teacherKey, score]) => {
        const teacher = selectedCommittee.members.find(
          (t) => t.teacher && t.teacher.id.toString() === teacherKey.toString()
        );
        //TODO::

        if (teacher && score !== undefined && score !== null) {
            console.log("student.thesis.id",student.student.thesis.id)
          payload.push({
            student_id: student.student.id,
            thesis_id : student.student.thesis.id,
            committee_member_id: teacher.id,
            component_id: componentId,
            committee_id: selectedCommittee.id,
            score,
          });
        }
      });
    });
    try {
      console.log("payload:", payload);

      await api.post("/committee-scores/batch", payload);

      toast.success("Оноо амжилттай хадгалагдлаа");
      setSelectedCommittee(null);
      fetchData();
    } catch (error) {
      console.error("Error submitting scores:", error);
      toast.error("Алдаа гарлаа");
    }
  };

  const getInitialFormValues = (committee) => {
    if (!committee) return {};

    const initialValues = {};

    committee.students?.forEach((student) => {
      initialValues[student.id] = {};
      (student.scores || []).forEach((grade) => {
        initialValues[student.id][grade.teacher_id] = grade.score;
      });
    });

    return initialValues;
  };
  const isCommitteeReadyToFinalize = (committee) => {
    const totalMembers = committee.members.length;
    const totalStudents = committee.students.length;

    // Check if every member has given score to every student
    return committee.students.every((student) =>
      committee.members.every((member) =>
        member.committeeScores?.some(
          (cs) => cs.student?.id === student.student?.id
        )
      )
    );
  };

  const handleFinalizeCommittee = async (committee) => {
    try {
      const res = await api.post(
        "/committee-scores/batch-finalize-by-committee",
        {
          committee_id: committee.id,
        }
      );

        toast.success("Оноо амжилттай илгээгдлээ!");
        fetchData(); // Refresh after finalize
   
    } catch (error) {
      console.error(error);
      toast.error("Оноо илгээхэд алдаа гарлаа!");
    }
  };
  const isCommitteeFinalized = (committee) => {

    if (!committee.scores || committee.scores.length === 0) {
      return false;
    }
  
  
    return (
      committee.students.length > 0 &&
      committee.scores.length === committee.students.length
    );
  };
  
  const renderCommitteeMemberItem = (member) => {
    const firstName = member.teacher?.firstname || "";
    const firstLetter = member.teacher?.lastname || "";
    const roleLabels = {
      member: "Гишүүн",
      secretary: "Нарийн бичиг",
      leader: "Ахлах багш",
    };

    return (
      <List.Item
        key={member.id}
        actions={[
          <Tag color={roleColorMap[member.role]} key={member.role}>
            {roleLabels[member.role]}
          </Tag>,
        ]}
      >
        <List.Item.Meta title={`${firstLetter} ${firstName}`} />
      </List.Item>
    );
  };

  const renderCommitteeStudentPrograms = (committee) => {
    const programCounts = {};
    const programColors = {
      CS: "geekblue",
      IT: "green",
      SE: "volcano",
      Тодорхойгүй: "default",
    };

    committee.students?.forEach((s) => {
      const program = s.student?.program || "Тодорхойгүй";
      programCounts[program] = (programCounts[program] || 0) + 1;
    });

    return Object.entries(programCounts).map(([program, count]) => (
      <Tag color={programColors[program]} key={program}>
        {count} {program}
      </Tag>
    ));
  };

  const getStudentTableColumns = (graders = []) => {
    const baseColumns = [
      {
        title: "№",
        dataIndex: "index",
        key: "index",
        render: (_, __, index) => index + 1,
        width: 50,
        align: "center",
      },
      {
        title: "Ангилал",
        dataIndex: ["student", "program"],
        key: "program",
        width: 100,
      },
      {
        title: "ID",
        dataIndex: ["student", "sisi_id"],
        key: "sisi_id",
        width: 80,
      },
      {
        title: "Нэр.Овог",
        dataIndex: "student",
        key: "fullname",
        render: (student) => (
          <Text strong>{`${student?.lastname || ""}.${
            student?.firstname || ""
          }`}</Text>
        ),
        width: 150,
      },
      {
        title: "Удирдагч",
        dataIndex: "student",
        key: "supervisor",
        render: (student) => {
          const thesis = student.thesis;
          console.log(student);
          const supervisor = thesis?.supervisor;
          return supervisor
            ? `${supervisor.lastname?.charAt(0) || ""}. ${
                supervisor.firstname || ""
              }`
            : "-";
        },
        width: 120,
      },
    ];

    const teacherScoreColumns = graders.map((grader) => ({
      title: (
        <div style={{ textAlign: "center" }}>
          <div>{`${grader.teacher?.lastname || ""}`}</div>
          <div>{`${grader.teacher?.firstname || ""}`}</div>
        </div>
      ),
      key: `score-${grader.id}`,
      render: (_, record) => {
        const studentId = record.student.id;

        const scoreObj = grader.committeeScores?.find(
          (cs) => cs.student?.id === studentId
        );

        const score = parseFloat(scoreObj?.score);

        return (
          <div style={{ textAlign: "center" }}>
            {scoreObj ? (
              <Tag style={{ fontSize: 14, padding: "4px 8px", minWidth: 40 }}>
                {score}
              </Tag>
            ) : (
              <Tag color="default" style={{ opacity: 0.6 }}>
                -
              </Tag>
            )}
          </div>
        );
      },
      width: 120,
      align: "center",
    }));
    const scoreColumns = [
      {
        title: "Нийт",
        key: "totalScore",
        render: (_, record) => {
          const studentId = record.student.id;

          // Collect all scores for this student from all graders
          const scores = graders
            .map(
              (grader) =>
                grader.committeeScores?.find(
                  (cs) => cs.student?.id === studentId
                )?.score
            )
            .filter((s) => s !== undefined && !isNaN(parseFloat(s)))
            .map((s) => parseFloat(s));

          const avg =
            scores.length > 0
              ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(
                  2
                )
              : "-";

          return (
            <Text strong style={{ fontSize: 14 }}>
              {avg}
            </Text>
          );
        },
        width: 80,
        align: "center",
      },
    ];

    return [...baseColumns, ...teacherScoreColumns, ...scoreColumns];
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]} className="mb-4">
        {studentCounts.map((item, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card hoverable>
              <Statistic
                title={item.program}
                value={item.student_count}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        ))}

        <Col xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <Statistic
              title="Нийт багшийн тоо"
              value={customTeacherCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={4} style={{ marginBottom: 0 }}>
            Комиссын жагсаалт
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<CalculatorOutlined />}
            onClick={() => setShowConfirmModal(true)}
          >
            Комисс тооцоолох
          </Button>
        </Col>
      </Row>
      {loading ? (
        <Spin tip="Ачааллаж байна..." />
      ) : committees.length === 0 ? (
        <Alert
          message="Мэдээлэл байхгүй"
          description="Одоогоор бүртгэлтэй комисс байхгүй байна."
          type="info"
          showIcon
        />
      ) : (
        <Collapse
          accordion
          style={{
            background: "#ffffff",
            // border: "1px solid rgb(70, 159, 203)",
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          {committees.map((committee, index) => (
            <Collapse.Panel
              key={committee.id || index}
              header={
                <div>
                <strong>{committee.name || `Комисс ${index + 1}`}</strong>{" "}
                <Tag color="processing" style={{ marginLeft: 8 }}>
                  {committee.students?.length} оюутан
                </Tag>
                {isCommitteeFinalized(committee) ? (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    Илгээсэн
                  </Tag>
                ) : (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    Илгээгээгүй
                  </Tag>
                )}
              </div>
              
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={10} lg={8}>
                  <Card title="Багш нар" bordered={false} size="small">
                    <List
                      dataSource={committee.members}
                      renderItem={renderCommitteeMemberItem}
                      locale={{ emptyText: "Багш нэмэгдээгүй байна" }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Хөтөлбөрүүд:</Text>
                      <div style={{ marginTop: 8 }}>
                        {renderCommitteeStudentPrograms(committee)}
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={14} lg={24}>
                  <Button
                    type="primary"
                    style={{ marginBottom: 10 }}
                    onClick={() => handleOpenScoreModal(committee)}
                  >
                    Оноо оруулах
                  </Button>

                  <Button
                    type="primary"
                    disabled={!isCommitteeReadyToFinalize(committee)}
                    onClick={() => handleFinalizeCommittee(committee)}
                  >
                    Оноог илгээх
                  </Button>

                  <Table
                    dataSource={committee.students || []}
                    columns={getStudentTableColumns(committee.members)}
                    rowKey={(record) => record.id}
                    pagination={10}
                    bordered
                    style={{ fontSize: "9px" }}
                  />
                </Col>
              </Row>
            </Collapse.Panel>
          ))}
        </Collapse>
      )}

      <Modal
        title="Багш, оюутны тоог шалгах"
        visible={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowConfirmModal(false)}>
            Болих
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setShowConfirmModal(false);
              setShowCalculator(true);
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

      <Modal
        title="Оноо оруулах"
        open={!!selectedCommittee}
        onCancel={() => setSelectedCommittee(null)}
        onOk={() => scoreForm.submit()}
        width={800}
      >
        <Form
          form={scoreForm}
          onFinish={handleSubmitScores}
          initialValues={getInitialFormValues(selectedCommittee)}
        >
          {selectedCommittee?.students?.map((student) => (
            <Card
              key={`student-${student.id}`}
              size="small"
              title={`${student.student?.lastname || ""}.${
                student.student?.firstname || ""
              }`}
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[8, 8]} style={{ marginBottom: 10 }}>
                {selectedCommittee.members?.map((teacher) => {
                  const grade = teacher.committeeScores?.find(
                    (cs) => cs.student?.id === student.student?.id
                  );

                  return (
                    <Col span={8} key={`score-${student.id}-${teacher.id}`}>
                      <div style={{ marginBottom: 4 }}>
                        {grade?.score === undefined && (
                          <Tag color="green">Хоосон</Tag>
                        )}
                      </div>

                      <Form.Item
                        label={`${teacher.teacher?.lastname || ""} ${
                          teacher.teacher?.firstname || ""
                        }`}
                        name={[
                          student.id.toString(),
                          teacher.teacher?.id?.toString(),
                        ]}
                        initialValue={grade?.score || null}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          ))}
        </Form>
      </Modal>

      <CommitteeCalculator
        show={showCalculator}
        visible={showCalculator}
        onClose={() => setShowCalculator(false)}
        availableTeachers={customTeacherCount}
        availableStudents={customStudentCount}
        onCreate={handleCreateCommittees}
      />
    </div>
  );
};

export default CommitteeManagement;
