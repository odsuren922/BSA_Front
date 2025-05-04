import React, { useState, useEffect } from "react";
import api from "../../context/api_helper";
import {
  Tabs,
  Button,
  Col,
  Card,
  Row,

} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import generatePDF from "../../components/plan/pdfGenerator";
import ThesisScores from "../../pages/Thesis/ThesisScore.js";
//import { useAuth } from "../../context/AuthContext.js";
import { useUser } from "../../context/UserContext";
// import ThesisFileUpload from "./UploadFile.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GanttChart from "../../components/plan/GanttChart";
import ScoreForm from "./ScoreForm.js";

const AboutThesisTabs = ({
  id,
  gradingSchema,
  thesisCycle,
  score,
  tasks,
  supervisor,
  thesis,
}) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

   const [scores, setScores] = useState([]);
  const safeTasks = tasks ?? [];
;

  const { user } = useUser();

  console.log("gradingSchema", gradingSchema);
  const fetchFiles = async () => {
    try {
        if(id){
            const filesRes = await api.get(`/thesis/${id}/files`);
      console.log(filesRes);
      console.log(filesRes.data);
      setFiles(filesRes.data);
        } else {
            return
        }
      
    } catch (err) {
      console.error("File fetch error", err);
    }
  };
  useEffect(() => {
    fetchScores();
  }, [id]);
  const fetchScores = async () => {
    setLoading(true);
    try {
        if(id){
      const res = await api.get(`/scores/getScoreByThesis/${id}/`);

      console.log(res.data);
      setScores(res.data.data);
    } else {
        return
    }
    } catch (err) {
      toast.error("Оноо дуудахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };
  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      const res = await api.get(`/thesis/${id}`);

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
                  {
                    id ?(
                        <ThesisScores
                        thesisId={id}
                        thesisCycle={thesisCycle}
                        supervisor={supervisor}
                        thesis={thesis}
                        gradingSchema={gradingSchema}
                        scores={scores}
                        loading={loading}
      
                      />
                    ):(
                        <Col xl={24} style={{ marginBottom: "10px" }}>
                        <Card>
                          <p
                            style={{
                              color: "#6c757d",
                              fontSize: "14px",
                              marginTop: "10px",
                            }}
                          >
                            Судалгааны ажил олдсонгүй.
                          </p>
                        </Card>
                      </Col>

                    )
                  }

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
        ...(user.role !== "student"
            ? [
                {
                  label: "Оноо өгөх",
                  key: "3",
                  children: (
                    <div>
                      {thesis.supervisor ? (
                        <ScoreForm
                          thesisId={id}
                          gradingSchema={gradingSchema}
                          Supervisorid={thesis.supervisor.id}
                          Studentid={thesis.student.id}
                          thesisCycleId={thesisCycle.id}
                          scores={scores}
                          loading={loading}
                          onSuccess={fetchScores}
                        />
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
                              Мэдээлэл алга
                            </p>
                          </Card>
                        </Col>
                      )}
                    </div>
                  ),
                },
              ]
            : []),
        
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

export default AboutThesisTabs;
