import React, { useState, useEffect } from "react";
import api from "../../context/api_helper";
import { Tabs, Button, Col, Card, Form, InputNumber, Row } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import generatePDF from "../../components/plan/pdfGenerator";
import GradingSchemaTable from "../../components/grading/GradingTable";
import ThesisScores from "../../pages/Thesis/ThesisScore.js";
//import { useAuth } from "../../context/AuthContext.js";
import { UserProvider, useUser } from "../../context/UserContext";
import ThesisFileUpload from "./UploadFile.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GanttChart from "../../components/plan/GanttChart";

const AboutThesisTabs = ({
  id,
  gradingSchema,
  thesisCycle,
  score,
  tasks,
  supervisor,
  thesis 
}) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [editableData, setEditableData] = useState([]);
  const safeTasks = tasks ?? [];

  const [editingKey, setEditingKey] = useState("");

  const { user } = useUser();
  useEffect(() => {
    if (gradingSchema && gradingSchema.grading_components) {
      const preparedData = [
        {
          key: "score",
          year: gradingSchema.year,
          name: gradingSchema.name,
          ...gradingSchema.grading_components.reduce(
            (acc, component, index) => {
              acc[`component_${index + 1}`] = component.score;
              return acc;
            },
            {}
          ),
        },
        {
          key: "by_who",
          year: "",
          name: "",
          ...gradingSchema.grading_components.reduce(
            (acc, component, index) => {
              acc[`component_${index + 1}`] = component.by_who;
              return acc;
            },
            {}
          ),
        },
      ];

      setEditableData(preparedData);
    }

    // if (id) {
    //   fetchFiles();
    // }
  }, [gradingSchema, id]);

  const fetchFiles = async () => {
    try {
      const filesRes = await api.get(`/thesis/${id}/files`);
      console.log(filesRes);
      console.log(filesRes.data);
      setFiles(filesRes.data);
    } catch (err) {
      console.error("File fetch error", err);
    }
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      const res = await api.get(`/thesis/${id}`); //TODO :: resource ashigladag bolgoh

      generatePDF(tasks, res.data.data, thesisCycle);
    } catch (error) {
      console.error("ERROR:", error);
    } finally {
      setPdfLoading(false);
    }
  };
  const approveFile = async (fileId) => {
    try {
      console.log(fileId);
      console.log(user.id);
      const a = await api.put(`/thesis/files/${fileId}/approve`, {
        accepted_by: user.id,
      });
      console.log(a);

      fetchFiles();
    } catch {
      console.error("Батлахад алдаа гарлаа");
    } finally {
      toast.success("Таны тайлан амжилттай баталлаа.");
    }
  };

  const convertToGanttTasks = (tasks) => {
    const ganttTasks = [];

    tasks.forEach((task) => {
      if (task.subtasks) {
        task.subtasks.forEach((sub) => {
          ganttTasks.push({
            id: `subtask-${sub.id}`,
            name: sub.name,
            start: sub.start_date,
            end: sub.end_date,
            progress: 0, // or use a real value if available
            dependencies: "", // you can fill this in if you track dependencies
          });
        });
      }
    });

    return ganttTasks;
  };

  return (
    <Tabs
      defaultActiveKey="1"
      centered
      items={[
        {
          label: "Дүнгийн мэдээлэл",
          key: "1",
          children: (
            <div>
              <Col xs={24} md={24}>
                {/* <Card title="Үнэлгээний схем" className="mb-4">
                  </Card> */}

                <ThesisScores
                  thesisId={id}
                  thesisCycle={thesisCycle}
                  supervisor={supervisor}
                  thesis={thesis}
                />
              </Col>
            </div>
          ),
        },
        {
          label: "Төлөвлөгөө",
          key: "2",
          children: (
            <div>
              7 хоногийн үйлчлэлсэн төлөвлөгөө
              <Row>
                {safeTasks.length > 0 ? (
                  <Col xl={24} style={{ marginBottom: "10px" }}>
                    <Card>
                      <GanttChart tasks={convertToGanttTasks(safeTasks)} />
                    </Card>
                  </Col>
                ) : (
                  <Col xl={24} style={{ marginBottom: "10px" }}>
                    <Card>
                      <p
                        style={{
                          color: "#6c757d",
                          fontSize: "14px",
                          marginTop: "10px",
                        }}
                      >
                        Төлөвлөгөөний мэдээлэл хараахан үүсээгүй байна.
                      </p>
                    </Card>
                  </Col>
                )}
              </Row>
              <Button
                type="default"
                icon={<FilePdfOutlined />}
                loading={pdfLoading}
                onClick={handlePDF}
                style={{ marginTop: "10px" }}
                disabled={!id}
              >
                PDF
              </Button>
              <a
                className="btn btn-primary btn-sm"
                href={id ? `/studentPlan/${id}` : "#"}
                style={{
                  pointerEvents: id ? "auto" : "none",
                  opacity: id ? 1 : 0.5,
                  marginLeft: "10px",
                }}
              >
                Төлөвлөгөө үүсгэх
              </a>
            </div>
          ),
        },
        //         {
        //   label: "Тайлан",
        //   key: "3",
        //   children: (
        //     <>
        //       {user.role === "student" && <ThesisFileUpload thesisId={id} />}
        //       <div style={{ marginTop: "20px" }}>
        //         <div style={{ marginTop: "20px" }}>
        //           {files.length > 0 &&
        //           files[files.length - 1].status !== "accepted" ? (
        //             <div style={{ marginBottom: "20px" }}>
        //               <p>
        //                 Сүүлд илгээсэн файл:
        //                 <a
        //                   href={`http://127.0.0.1:8000/storage/${
        //                     files[files.length - 1].file_path
        //                   }`}
        //                   target="_blank"
        //                   rel="noreferrer"
        //                 >
        //                   Харах
        //                 </a>
        //               </p>

        //               <h4>{files[files.length - 1].original_name}</h4>

        //               <iframe
        //                    src={`http://127.0.0.1:8000/storage/${files[files.length - 1].file_path}`}
        //                    width="100%"
        //                    height="500px"
        //                    title={files[files.length - 1].original_name}
        //                  />

        //               <div style={{ marginTop: "5px", color: "orange" }}>
        //                 Батлагдаагүй файл
        //               </div>

        //               {user?.id === supervisor.id && (
        //                 <Button
        //                   type="primary"
        //                   onClick={() =>
        //                     approveFile(files[files.length - 1].id)
        //                   }
        //                   style={{ marginTop: "10px" }}
        //                 >
        //                   Зөвшөөрөх
        //                 </Button>
        //               )}
        //             </div>
        //           ) : (
        //             <div></div>
        //           )}
        //         </div>

        //         {/* <h4>Батлагдсан файл:</h4> */}

        //         {files.some((file) => file.status === "accepted") ? (
        //           (() => {
        //             const lastaccepted = files
        //               .filter((file) => file.status === "accepted")
        //               .at(-1); // last one

        //             return (
        //               <div
        //                 key={lastaccepted.id}
        //                 style={{ marginBottom: "20px" }}
        //               >
        //                 <iframe
        //                   src={`http://127.0.0.1:8000/storage/${lastaccepted.file_path}`}
        //                   width="100%"
        //                   height="800px"
        //                   title={lastaccepted.original_name}
        //                 />
        //               </div>
        //             );
        //           })()
        //         ) : (
        //           <div></div>
        //         )}
        //       </div>
        //     </>
        //   ),
        // },
      ]}
    />
  );
};
const GiveScoreForm = ({ gradingSchema, thesisId, score, supervisor }) => {
  const [form] = Form.useForm();
  const { user } = useUser();

  const handleSubmit = async (values) => {
    await api.post("/thesis-scores", {
      thesis_id: thesisId,
      scores: values,
    });
    // toast.success("Амжилттай хадгаллаа");
  };

  return (
    <Form form={form} onFinish={handleSubmit}>
      {gradingSchema?.grading_components.map((comp) => {
        const oldScore = score?.find((s) => s.component_id === comp.id)?.score;
        const canEdit =
          user?.id === supervisor.id && comp.by_who === "supervisor";

        return (
          <Form.Item
            key={comp.id}
            label={comp.name}
            name={`component_${comp.id}`}
            initialValue={oldScore}
          >
            {canEdit ? (
              <InputNumber min={0} max={100} />
            ) : (
              <div>{oldScore ?? "Үнэлгээ ороогүй"}</div>
            )}
          </Form.Item>
        );
      })}

      {gradingSchema?.grading_components.some(
        (comp) => comp.by_who === "supervisor"
      ) &&
        user?.id === supervisor.id && (
          <Button type="primary" htmlType="submit">
            Хадгалах
          </Button>
        )}
    </Form>
  );
};

export default AboutThesisTabs;
