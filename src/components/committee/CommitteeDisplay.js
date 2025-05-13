// CommitteeDisplay.js
import React, { useState } from "react";
import {
    Row,
    Col,
    Form,
    Card,
    List,
    Tag,
    Typography,
    Button,
    Table,
    message,
    InputNumber
} from "antd";
import CommitteeMemberItem from "./CommitteeMemberList";
import CommitteeScoreModal from "./CommitteScoreSaveModal";
import api from "../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { Text } = Typography;

const CommitteeDisplay = ({
    committees,
    committee,
    index,
    handleDeleteExternal,
    handleAddOutsider,
    renderCommitteeStudentPrograms,
    componentId,
    setCommittees,
}) => {
    const [selectedCommittee, setSelectedCommittee] = useState(null);
    const [externalReviewersScore, setExternalReviewersScore] = useState([]);
    const [scoreForm] = Form.useForm();
    const [editableScores, setEditableScores] = useState({});
    const [editableExternalScores, setEditableExternalScores] = useState({});
      const [editMode, setEditMode] = useState(false);
    const getStudentTableColumns = (graders = [], committee = null) => {
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
                        selectedCommittee?.externalReviewers || []
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
    const isCommitteeReadyToFinalize = (committee) => {
        const totalMembers = committee?.members.length;
        const totalStudents = committee?.students.length;

        // Check if every member has given score to every student
        return committee?.students.every((student) =>
            committee?.members.every((member) =>
                member.committeeScores?.some(
                    (cs) => cs.student?.id === student.student?.id
                )
            )
        );
    };
    const handleSubmitScores = async (values) => {
        const committeeScores = [];
        const externalScores = [];

        Object.entries(values).forEach(([studentKey, graders]) => {
            const student = selectedCommittee.students.find(
                (s) => s.id.toString() === studentKey.toString()
            );

            Object.entries(graders).forEach(([graderKey, score]) => {
                if (score === undefined || score === null) return;

                if (graderKey.startsWith("external-")) {
                    const externalReviewerId = graderKey.replace(
                        "external-",
                        ""
                    );

                    externalScores.push({
                        student_id: student.student.id,
                        external_reviewer_id: Number(externalReviewerId),
                        score,
                    });
                } else {
                    const teacher = selectedCommittee.members.find(
                        (t) =>
                            t.teacher &&
                            t.teacher.id.toString() === graderKey.toString()
                    );

                    if (teacher) {
                        committeeScores.push({
                            student_id: student.student.id,
                            thesis_id: student.student.thesis.id,
                            committee_member_id: teacher.id,
                            component_id: componentId,
                            committee_id: selectedCommittee.id,
                            score,
                        });
                    }
                }
            });
        });

        try {
            // Save committee scores
            const response = await api.post(
                "/committee-scores/batch",
                committeeScores
            );
            const newScores = response.data.data;

            // Save external reviewer scores
            let savedExternalScores = [];
            if (externalScores.length > 0) {
                const extResponse = await api.post(
                    "/external-reviewer-scores/batch",
                    externalScores
                );
                savedExternalScores = extResponse.data.data;
            }

            message.success("Оноо амжилттай хадгалагдлаа");

            // Update state as before
            setCommittees((prevCommittees) =>
                prevCommittees.map((committee) => {
                    if (committee.id !== selectedCommittee.id) return committee;

                    // ✅ Update committee member scores
                    const updatedMembers = committee.members.map((member) => {
                        const scoresForMember = newScores.filter(
                            (s) => s.committee_member?.id === member.id
                        );

                        const newCommitteeScores = scoresForMember.map((s) => ({
                            id: s.id,
                            score: s.score,
                            student: s.student,
                            component_id: s.component_id,
                            created_at: s.created_at,
                        }));

                        return {
                            ...member,
                            committeeScores: [
                                ...(member.committeeScores || []).filter(
                                    (old) =>
                                        !newCommitteeScores.some(
                                            (ns) =>
                                                ns.student.id ===
                                                    old.student?.id &&
                                                ns.component_id ===
                                                    old.component_id
                                        )
                                ),
                                ...newCommitteeScores,
                            ],
                        };
                    });

                    // ✅ Update external reviewer scores
                    const updatedReviewers =
                        committee.externalReviewers?.map((rev) => {
                            const reviewerScores = savedExternalScores.filter(
                                (s) => s.external_reviewer_id === rev.id
                            );

                            const newExternalScores = reviewerScores.map(
                                (s) => ({
                                    id: s.id,
                                    score: s.score,
                                    student_id: s.student_id,
                                    component_id: s.grading_component_id,
                                    created_at: s.created_at,
                                })
                            );

                            return {
                                ...rev,
                                scores: [
                                    ...(rev.scores || []).filter(
                                        (old) =>
                                            !newExternalScores.some(
                                                (ns) =>
                                                    ns.student_id ===
                                                        old.student_id &&
                                                    ns.component_id ===
                                                        old.component_id
                                            )
                                    ),
                                    ...newExternalScores,
                                ],
                            };
                        }) || [];

                    return {
                        ...committee,
                        members: updatedMembers,
                        externalReviewers: updatedReviewers,
                    };
                })
            );

            scoreForm.resetFields();
            setSelectedCommittee(null);
        } catch (error) {
            console.error("Error submitting scores:", error);
            message.error("Оноо хадгалахад алдаа гарлаа");
        }
    };
    const handleSubmitScoresTable = async () => {
        const scores = Object.entries(editableScores).map(([key, score]) => {
            const [studentId, graderId] = key.split("-").map(Number);
            const committeeMember = committee.members.find(m => m.id === graderId);
            return {
              student_id: studentId,
              committee_member_id: graderId,
              score: parseFloat(score),
            };
          });
          console.log("editableExternalScores", editableExternalScores);

          const externalScores = Object.entries(editableExternalScores).map(([key, score]) => {
            const [, studentIdStr, reviewerIdStr] = key.split("-"); // 'external-3-1'
            return {
              student_id: parseInt(studentIdStr),            // "3" → 3
              external_reviewer_id: parseInt(reviewerIdStr), // "1" → 1
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
            console.log("Editable scores payload", {
                committee_id: committee.id,
                component_id: committee.grading_component.id,
                scores,
              });

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
              const  response=  await api.post("/committee/external-reviewer-scores/batch", payload);
                toast.success("Оноо амжилттай шинэчлэгдлээ!");
                setEditableExternalScores(payload.external_scores.reduce((acc, score) => {
                    const key = `external-${score.student_id}-${score.external_reviewer_id}`;
                    acc[key] = score.score;
                    return acc;
                  }, {}));
                  

              }
           
              
           
      
    
          } catch (err) {
            console.error(err);
            message.error("Оноо хадгалах үед алдаа гарлаа.");
          }finally{
            setEditMode(false)
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
    const calculateCommitteeAverages = (committee, componentId) => {
        const {
            members = [],
            students = [],
            externalReviewers = [],
        } = committee;

        return students.map((student) => {
            const studentId = student.student?.id;

            // Комиссын гишүүдийн оноонууд
            const teacherScores = members
                .map((member) => {
                    const scoreObj = member.committeeScores?.find(
                        (cs) => cs.student?.id === studentId
                    );
                    return parseFloat(scoreObj?.score);
                })
                .filter((score) => !isNaN(score));

            // Гадаад шүүгчдийн оноонууд
            //   console.log("externalReviewersdfghjk",externalReviewers)
            const externalScores = externalReviewers
                .flatMap((reviewer) => reviewer.scores || [])
                .filter((score) => score.student_id === studentId)
                .map((score) => parseFloat(score.score))
                .filter((score) => !isNaN(score));
            //   console.log('externalScores', externalScores)
            // Нийт оноо
            const allScores = [...teacherScores, ...externalScores];

            // Дундаж тооцоолол
            const average =
                allScores.length > 0
                    ? parseFloat(
                          (
                              allScores.reduce((sum, s) => sum + s, 0) /
                              allScores.length
                          ).toFixed(2)
                      )
                    : null;

            return {
                student_id: studentId,
                average: average,
            };
        });
    };
    const handleFinalizeCommittee = async (committee) => {
        try {
            // Calculate averages first
            const studentAverages = calculateCommitteeAverages(
                committee,
                componentId
            );

            //   console.log("studentAverages",studentAverages)

            const res = await api.post(
                "/committee-scores/batch-finalize-by-committee",
                {
                    committee_id: committee.id,
                    component_id: committee.grading_component.id,

                    scores: studentAverages, // Include calculated averages
                }
            );
            //   console.log("reas", res)

            const data = res.data;
            setCommittees((prev) =>
                prev.map((c) =>
                    c.id === committee.id
                        ? {
                              ...c,
                              scores: Array.isArray(data)
                                  ? data
                                  : data?.data ?? [],
                          }
                        : c
                )
            );

            message.success("Оноо амжилттай илгээгдлээ!");

            //   fetchData();
        } catch (error) {
            console.error(error);
            message.error("Оноо илгээхэд алдаа гарлаа!");
        }
    };
    const handleOpenScoreModal = (committee) => {
        const latest = committees.find((c) => c.id === committee.id);
        setSelectedCommittee(latest);
        setTimeout(() => {
            scoreForm.resetFields();
            scoreForm.setFieldsValue(getInitialFormValues(latest)); // Set new
        }, 0);
    };

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={18} lg={18}>
                <Card title="Багш нар" bordered={false} size="small">
                    <List
                        dataSource={committee?.members || []}
                        renderItem={(member) => (
                            <CommitteeMemberItem
                                member={member}
                                onDeleteExternal={handleDeleteExternal}
                            />
                        )}
                    />
                    {committee?.externalReviewers?.length > 0 && (
                        <List
                            dataSource={committee?.externalReviewers || []}
                            renderItem={(externalReviewer) => (
                                <CommitteeMemberItem
                                    member={externalReviewer}
                                    onDeleteExternal={handleDeleteExternal}
                                />
                            )}
                        />
                    )}

                    <div style={{ marginTop: 16 }}>
                        <Text strong>Хөтөлбөрүүд:</Text>
                        <div style={{ marginTop: 8 }}>
                            {renderCommitteeStudentPrograms(committee)}
                        </div>
                    </div>
                </Card>

                <Button
                    type="dashed"
                    style={{ marginLeft: 8, marginBottom: 10 }}
                    onClick={() => handleAddOutsider(committee)}
                >
                    Гадны Гишүүн нэмэх
                </Button>
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
                    columns={getStudentTableColumns(
                        committee?.members || [],
                        committee
                    )}
                    rowKey={(record) => record.student.id}
                    pagination={10}
                    bordered
                    style={{ fontSize: "9px" }}
                />



{editMode ? (
    <>
      <Button onClick={() => setEditMode(false)} style={{ marginRight: 8 }}>
        Болих
      </Button>
      <Button type="primary" onClick={handleSubmitScoresTable}>
                  Оноо хадгалах
                </Button>
    </>
  ) : (
    <Button onClick={() => setEditMode(true)}>Засах</Button>
  )}


               
            </Col>
            <CommitteeScoreModal
                visible={!!selectedCommittee}
                selectedCommittee={selectedCommittee}
                onClose={() => setSelectedCommittee(null)}
                onSubmit={handleSubmitScores}
                getInitialFormValues={getInitialFormValues}
                scoreForm={scoreForm}
            />
        </Row>
    );
};

export default CommitteeDisplay;
