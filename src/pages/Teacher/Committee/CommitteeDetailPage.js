import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  List,
  Tag,
  Typography,
  Table,
  DatePicker,
  Empty,
  Row,
  Col,
  Button,
  Modal,
  Steps,
  Spin,
  InputNumber,
  message
} from "antd";
import { useUser } from "../../../context/UserContext";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../../context/api_helper";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const { TabPane } = Tabs;
const { Text } = Typography;

const roleColorMap = {
  member: "blue",
  secretary: "orange",
  leader: "red",
};

const roleLabels = {
  member: "Гишүүн",
  secretary: "Нарийн бичиг",
  leader: "Ахлах багш",
};

const programColors = {
  CS: "geekblue",
  IT: "green",
  SE: "volcano",
  Тодорхойгүй: "default",
};

const CommitteeDetailsPage = () => {
  const { id } = useParams();
  const [committee, setCommittee] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gradingComponents, setGradingComponents] = useState([]);
  const [selectedComId, setSelectedComId] = useState(null);
  const location = useLocation();
  const { grading_component, thesis_cycle } = location.state || {};
  const [assignedLoading, setAssignedLoading] = useState(false);
   const { user } = useUser();
   const [editableScores, setEditableScores] = useState({});
   const [editableExternalScores, setEditableExternalScores] = useState({});
      const [editMode, setEditMode] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [open, setOpen] = useState(false);
  const [stepNum, setStepNum] = useState(1);
  const selectedComponent = gradingComponents.find(
    (c) => c.id === selectedComId
  );
  const selectedTeacher = committee?.members.find(
    (m) => m.id === selectedMemberId
  );
  const selectedStudents = committee?.students.filter((s) =>
    selectedRowKeys.includes(s.student.id)
  );
  const [assignedData, setAssignedData] = useState([]);

  const fetchAssigned = async () => {
    if (!selectedComId || !thesis_cycle?.id) return;
  
    setAssignedLoading(true);
    try {
      const res = await api.get(
        `/assigned-grading/component/${selectedComId}/cycle/${thesis_cycle.id}`
      );
      console.log("Assigned Data:", res.data);
      setAssignedData(res.data.data);
    } catch (err) {
      console.error("Fetch assigned error:", err);
    } finally {
      setAssignedLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAssigned();
  }, [selectedComId]);

  useEffect(() => {
    const fetchCommittee = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/committees/${id}`);
        const gradingSchema = await api.get(
          `/thesis-cycles/${thesis_cycle.id}/grading-schema-filter`
        );
  
        const data = response.data.data;
        console.log("committee data",data )
        setGradingComponents(gradingSchema.data[0].grading_components);
        setCommittee(data);
      } catch (err) {
        console.error("Committee fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCommittee();
  }, [id]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    getCheckboxProps: (record) => {
      const assigned = assignedData.find(
        (a) => a.student_id === record.student.id
      );
      return {
        disabled: !!assigned,
      };
    },
  };

  const getStudentTableColumns = () => [
    {
      title: "№",
      render: (_, __, index) => index + 1,
      width: 50,
      align: "center",
    },
    {
      title: "Mэргэжил",
      dataIndex: ["student", "program"],
      render: (program) => (
        <Tag color={programColors[program]}>{program || "Тодорхойгүй"}</Tag>
      ),
    },
    {
      title: "ID",
      dataIndex: ["student", "sisi_id"],
    },
    {
      title: "Нэр.Овог",
      dataIndex: "student",
      render: (student) => (
        <Text strong>{`${student?.lastname || ""} ${
          student?.firstname || ""
        }`}</Text>
      ),
    },
    {
      title: "Удирдагч",
      dataIndex: "student",
      render: (student) => {
        const supervisor = student?.thesis?.supervisor;
        return supervisor
          ? `${supervisor.lastname} ${supervisor.firstname}`
          : "-";
      },
    },
    {
      title: "Судалгааны сэдэв",
      render: (record) => (
        <Text>{`${record.student.thesis.name_mongolian}`}</Text>
      ),
    },

    {
      title: "Дэлгэрэнгүй",
      render: (text, record) => (
        <a href={`/aboutthesis/${record.student.thesis.id}`}>Дэлгэрэнгүй</a>
      ),
    },
 {
      title: "Томилогдсон багш",
      dataIndex: "student",
      render: (student) => {
        const assigned = assignedData.find((a) => a.student_id === student.id);
        const teacher = committee.members.find(
          (m) => m.teacher?.id === assigned?.assigned_by_id
        );

        return assigned ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag color="green">
              {teacher
                ? `${teacher.teacher.lastname} ${teacher.teacher.firstname}`
                : "Багш"}
            </Tag>
            <Button
              danger
              size="small"
              onClick={() => handleDeleteAssignedGrading(assigned.id)}
            >
              X
            </Button>
          </div>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
      width: 200,
    }


      
  ];
  const getStudentTableColumns2 = (graders = [], committee = null) => {
    const baseColumns =[

        {
          title: "№",
          render: (_, __, index) => index + 1,
          width: 50,
          align: "center",
        },
        {
          title: "Mэргэжил",
          dataIndex: ["student", "program"],
          render: (program) => (
            <Tag color={programColors[program]}>{program || "Тодорхойгүй"}</Tag>
          ),
        },
        {
          title: "ID",
          dataIndex: ["student", "sisi_id"],
        },
        {
          title: "Нэр.Овог",
          dataIndex: "student",
          render: (student) => (
            <Text strong>{`${student?.lastname || ""} ${
              student?.firstname || ""
            }`}</Text>
          ),
           fixed: "left"
        },
        {
          title: "Удирдагч",
          dataIndex: "student",
          render: (student) => {
            const supervisor = student?.thesis?.supervisor;
            return supervisor
              ? `${supervisor.lastname} ${supervisor.firstname}`
              : "-";
          },
        },
        {
          title: "Судалгааны сэдэв",
          render: (record) => (
            <Text>{`${record.student.thesis.name_mongolian}`}</Text>
          ),
        },
    
        {
          title: "Дэлгэрэнгүй",
          render: (text, record) => (
            <a href={`/aboutthesis/${record.student.thesis.id}`}>Дэлгэрэнгүй</a>
          ),
        },
        // {
        //     title: "Шүүмжлэгч багш",
        //     dataIndex: "student",
        //     render: (student) => {
        //       const assigned = assignedData.find((a) => a.student_id === student.id);
        //       const teacher = committee.members.find(
        //         (m) => m.teacher?.id === assigned?.assigned_by_id
        //       );
          
        //       return assigned ? (
        //         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        //           <Tag color="green">
        //             {teacher
        //               ? `${teacher.teacher.lastname} ${teacher.teacher.firstname}`
        //               : "Багш"}
        //           </Tag>
        //           <Button
        //             danger
        //             size="small"
        //             onClick={() => handleDeleteAssignedGrading(assigned.id)}
        //           >
        //             X
        //           </Button>
        //         </div>
        //       ) : (
        //         <Text type="secondary">-</Text>
        //       );
        //     },
        //   }
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
          const key = `${studentId}-${grader.id}`;
          const currentScore = editableScores[key] ?? grader.committeeScores?.find(
            (cs) => cs.student?.id === studentId
          )?.score;
      
          return editMode  ?  (
            <InputNumber
              min={0}
              max={100}
              value={currentScore}
              onChange={(value) => {
                setEditableScores((prev) => ({
                  ...prev,
                  [key]: value,
                }));
              }}
              style={{ width: "100%" }}
            />
        ):(
            <span >
              {currentScore ?? " "}
           </span>
         );
        },
        width: 120,
        align: "center",
      }));
      
      const externalReviewerScoreColumns = (committee?.externalReviewers || []).map((rev) => ({
        title: (
          <div style={{ textAlign: "center" }}>


           
            <div>{`${rev?.lastname || ""}`}</div>
            <div>{`${rev?.firstname || ""}`}</div>
 

          </div>
        ),
        key: `external-${rev.id}`,
        render: (_, record) => {
          const studentId = record.student.id;
          const reviewerId = rev.id;
          const key = `external-${studentId}-${reviewerId}`;
      
          const existingScore = rev.scores?.find(s => s.student_id === studentId)?.score;
          const score = editableExternalScores[key] ?? existingScore;
      
          return editMode  ?  (
            <InputNumber
              min={0}
              max={100}
              value={score}
              onChange={(value) => {
                setEditableExternalScores((prev) => ({
                  ...prev,
                  [key]: value,
                }));
              }}
              style={{ width: "100%" }}
            />
        ):(
            <span >
            {score ?? " "}
           </span>
          );
        },
        width: 140,
        align: "center"
      }));
      
    
            const scoreColumns = [
                {
                    title: "Нийт",
                    key: "totalScore",
                    render: (_, record) => {
                        const studentId = record.student.id;
    
                        // Committee teacher scores
                        const teacherScores = graders
                            .map(
                                (grader) =>
                                    grader.committeeScores?.find(
                                        (cs) => cs.student?.id === studentId
                                    )?.score
                            )
                            .filter((s) => s !== undefined && !isNaN(parseFloat(s)))
                            .map((s) => parseFloat(s));
    
                        // External reviewer scores
                        const externalScores = (
                            committee?.externalReviewers || []
                        )
                            .flatMap((rev) => rev?.scores || [])
                            .filter((s) => s.student_id === studentId)
                            .map((s) => parseFloat(s.score))
                            .filter((s) => !isNaN(s));
    
                        // Combine all scores
                        const allScores = [...teacherScores, ...externalScores];
    
                        const avg =
                            allScores.length > 0
                                ? (
                                      allScores.reduce((sum, s) => sum + s, 0) /
                                      allScores.length
                                  ).toFixed(2)
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
            return [
                ...baseColumns,
                ...teacherScoreColumns,
                ...externalReviewerScoreColumns,
                ...scoreColumns,
            ];
      
        };
  const handleDeleteAssignedGrading = async (assignedId) => {
    Modal.confirm({
      title: "Та энэ томилгоог устгахдаа итгэлтэй байна уу?",
      okText: "Тийм",
      cancelText: "Үгүй",
      okType: "danger",
      async onOk() {
        try {
          await api.delete(`/assigned-grading/${assignedId}`);
          await fetchAssigned();
          toast.success("Амжилттай устгагдлаа");
        } catch (error) {
          console.error("Устгах үед алдаа:", error);
          toast.error("Устгаж чадсангүй");
        }
      },
    });
  };
  
  const handleAssignedGrading = async () => {
    if (!selectedMemberId || !selectedComId || selectedRowKeys.length === 0) {
      return Modal.warning({
        title: "Мэдээлэл дутуу байна",
        content: "Оюутан, багш, эсвэл үнэлгээний компонент сонгогдоогүй байна.",
      });
    }

    try {
      const selectedStudents = committee.students.filter((s) =>
        selectedRowKeys.includes(s.student.id)
      );

      const thesisIds = selectedStudents.map((s) => s.student.thesis.id);
      const studentIds = selectedStudents.map((s) => s.student.id);

      const response = await api.post(`/assigned-grading`, {
        grading_component_id: selectedComId,
        thesis_cycle_id: thesis_cycle.id,
        thesis_ids: thesisIds,
        student_ids: studentIds,
        assigned_by_type: "teacher",
        assigned_by_id: selectedMemberId,
      });

      Modal.success({
        title: "Амжилттай",
        content: "Багш амжилттай томилогдлоо!",
      });
      await fetchAssigned();
      // Reset after assignment
      setSelectedRowKeys([]);
      setSelectedMemberId(null);
      setOpen(false);
    } catch (error) {
      console.error(error);
      Modal.error({
        title: "Алдаа гарлаа",
        content: "Багш томилох явцад алдаа гарлаа.",
      });
    }
  };
  const handleSubmitScores = async () => {
    const scores = Object.entries(editableScores).map(([key, score]) => {
      const [studentId, graderId] = key.split("-").map(Number);
      const committeeMember = committee.members.find(m => m.id === graderId);
      return {
        student_id: studentId,
        committee_member_id: graderId,
        score: parseFloat(score),
      };
    });
    const externalScores = Object.entries(editableExternalScores).map(([key, score]) => {
        const [, studentIdStr, reviewerIdStr] = key.split("-");
        return {
          student_id: parseInt(studentIdStr),
          external_reviewer_id: parseInt(reviewerIdStr),
          score: parseFloat(score),
        };
      });
      
      
      
      // Илгээх payload жишээ:
      const payload = {
     
        grading_component_id: committee.grading_component.id,
        external_scores: externalScores
      };
      console.log("payload",payload)

    try {
        if (!scores.length && !payload.external_scores.length) {
            message.warning("Оноо хадгалагдсан байна!");
            return;
          }
          


          if (scores.length > 0) {
            const res = await api.post("/committee-scores/save-editable-scores", {
              committee_id: committee.id,
              component_id: committee.grading_component.id,
              scores,
            });
          
            toast.success("Оноо амжилттай шинэчлэгдлээ!");
          

            const updatedEditableScores = scores.reduce((acc, item) => {
              const key = `${item.student_id}-${item.committee_member_id}`;
              acc[key] = item.score;
              return acc;
            }, {});
            
            setEditableScores(updatedEditableScores); 
          }

              if(payload.external_scores.length>0){
                await api.post("/committee/external-reviewer-scores/batch", payload);
                message.success("Оноо амжилттай шинэчлэгдлээ!");
                setEditableExternalScores(payload.external_scores.reduce((acc, score) => {
                    const key = `external-${score.student_id}-${score.external_reviewer_id}`;
                    acc[key] = score.score;
                    return acc;
                  }, {}));
              }
      toast.success("Оноо амжилттай хадгалагдлаа!");
    } catch (err) {
      console.error(err);
      toast.error("Оноо хадгалах үед алдаа гарлаа.");
    }
  };
  
 // if (loading) return <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 100 }} />;

 if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!committee) {
    return <Empty description="Committee not found" />;
  }
  
  return (
    <div style={{ padding: 24 }}>
    

       
      <Typography.Title level={3}>{committee?.name}</Typography.Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Оюутнууд" key="1">


          <Col xs={24} md={14} lg={24}>
            <Card  loading={loading}>


            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text strong style={{ fontSize: 14 }}>
  {committee.grading_component.name} — {committee.grading_component.score} оноо
</Text>
  {editMode ? (
    <>
      <Button color="purple" variant="outlined" onClick={() => setEditMode(false)} style={{ marginRight: 8 }}>
        Болих
      </Button>
      <Button color="purple" variant="filled" onClick={handleSubmitScores}>
        Оноо хадгалах
      </Button>
    </>
  ) : (
    <Button  color="purple" variant="outlined" onClick={() => setEditMode(true)}>Засах</Button>
  )}
</div>

              <Table
                dataSource={committee.students}
                columns={getStudentTableColumns2(committee?.members || [], committee)}
                rowKey={(record) => record.student.id} // эсвэл record.id
                pagination={false}
                scroll={{ x: "max-content" }} 
                // rowSelection={rowSelection}
              />




            </Card>
          </Col>
   
        </TabPane>
   

        <TabPane tab="Багш нар" key="2">
        <Card  loading={loading}>
            <List
              dataSource={committee.members}
              renderItem={(member) => (
                <List.Item
                  actions={[
                    <Tag color={roleColorMap[member.role]} key={member.role}>
                      {roleLabels[member.role]}
                    </Tag>,
                  ]}
                >
                  <List.Item.Meta
                    title={`${member.teacher?.lastname} ${member.teacher?.firstname}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
        {user.role !== "student" && (
        <TabPane tab="Шүүмж багш томилох" key="3">
          <Row justify="center">
            <Col xs={24} sm={20} md={16} lg={14}>
              <Steps
                current={stepNum - 1}
                onChange={() => setStepNum(1)}
                style={{ marginBottom: 24 }}
              >
                <Steps.Step title="Компонент сонгох" />
                <Steps.Step title="Багш ба оюутан сонгох" />
              </Steps>
            </Col>
          </Row>

          {stepNum === 1 && (
            <Col xs={24} md={12} lg={12}>
            <Card title="Үнэлгээний компонент сонгох" loading={assignedLoading || loading} >

                <List
                  grid={{ gutter: 12, column: 3 }}
                  dataSource={gradingComponents}
                  renderItem={(component) => {
                    const isSelected = selectedComId === component.id;
                    return (
                      <List.Item>
                        <Card
                          hoverable
                          onClick={() => setSelectedComId(component.id)}
                          style={{
                            borderColor: isSelected ? "#1890ff" : "#f0f0f0",
                            backgroundColor: isSelected ? "#e6f7ff" : "#fff",
                            transition: "0.3s",
                          }}
                        >
                          <Card.Meta
                            title={<Text strong>{component.name}</Text>}
                            description={`Оноо: ${component.score}`}
                          />
                        </Card>
                      </List.Item>
                    );
                  }}
                />
                <Button type="primary" onClick={() => setStepNum(2)}>
                  Дараах
                </Button>
              </Card>
            </Col>
          )}

          {stepNum === 2 && (
            <>
              <Col xs={24} md={12} lg={12}>
                <div>
                  <h4>Багш сонгох</h4>
                  <List
                    grid={{ gutter: 12, column: 3 }}
                    dataSource={committee.members}
                    renderItem={(member) => {
                      const isSelected = selectedMemberId === member.teacher.id;

                      return (
                        <List.Item>
                          <Card
                            hoverable
                            onClick={() => setSelectedMemberId(member.teacher.id)}
                            style={{
                              borderColor: isSelected ? "#1890ff" : "#f0f0f0",
                              backgroundColor: isSelected ? "#e6f7ff" : "#fff",
                              transition: "0.3s",
                            }}
                          >
                            <Card.Meta
                              title={
                                <Text strong>
                                  {`${member.teacher?.lastname} ${member.teacher?.firstname}`}
                                </Text>
                              }
                              description={
                                <Tag color={roleColorMap[member.role]}>
                                  {roleLabels[member.role]}
                                </Tag>
                              }
                            />
                          </Card>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              </Col>

              <Col xs={24} md={14} lg={24}>
                <Card>
                  <Table
                    dataSource={committee.students}
                    columns={getStudentTableColumns()}
                    rowKey={(record) => record.student.id} // эсвэл record.id
                    pagination={false}
                    rowSelection={rowSelection}
                  />
                </Card>
                <Button type="primary" onClick={() => setOpen(true)}>
                  Багш Томилох
                </Button>
              </Col>
            </>
          )}
        </TabPane>
        )}
      </Tabs>
      <Modal
        title="Баталгаажуулах"
        open={open}
        onCancel={() => {
          setOpen(false);
          setSelectedMemberId(null);
          setSelectedRowKeys([]);
        }}
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            Болих
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleAssignedGrading}
            //   disabled={!selectedComponent || !selectedTeacher || selectedStudents.length === 0}
          >
            Баталгаажуулах
          </Button>,
        ]}
      >
        <p>
          <strong>Үнэлгээний компонент:</strong>{" "}
          {selectedComponent?.name || "—"}
        </p>
        <p>
          <strong>Багш:</strong>{" "}
          {selectedTeacher
            ? `${selectedTeacher.lastname} ${selectedTeacher.firstname}`
            : "—"}
        </p>

        <p>
          <strong>Оюутнууд:</strong>
        </p>
        <ul>
          {selectedStudents?.map((s) => (
            <li key={s.student.id}>
              {s.student.lastname} {s.student.firstname} —{" "}
              {s.student.thesis.name_mongolian}
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default CommitteeDetailsPage;
