// import React, { useState, useEffect } from "react";
// import { Row, Col, Card, CardBody } from "reactstrap";
// import PlanTable from "../../components/plan/PlanTable";
// import GanttChart from "../../components/plan/GanttChart";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button, Spin, Tag, Table } from "antd"; // NEW
// import { PlusOutlined, FilePdfOutlined } from "@ant-design/icons";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import ConfirmModal from "../../components/Common/ConfirmModal";
// import api from "../../context/api_helper";
// import { useAuth } from "../../context/AuthContext";
// import "./Plan.css";
// import generatePDF from "../../components/plan/pdfGenerator";
// //it is saving all changes by real time but decided to not use it but just
// //save the code for some reason
// const TableComponent = () => {
//   //const { id } = useParams();
//   const [data, setData] = useState([]); //Tasks and subtasks data
//   const [thesis, setThesis] = useState(null);
//   const [thesisCycle, setThesisCycle] = useState(null);

//   const { user } = useAuth();
//   const { id } = useParams();

//   const thesisId = id;
//   const [loading, setLoading] = useState(false);
//   const [btnLoading, setBtnLoading] = useState(false);
//   const [sendBtnLoading, setSendBtnLoading] = useState(false);
//   const [UnsendBtnLoading, setUnSendBtnLoading] = useState(false);
//   const [pdfLoading, setPdfLoading] = useState(false);

//   const [planStatus, setPlanStatus] = useState([]);
//   const [isReturnModalOpen, setReturnModalOpen] = useState(false);
//   const [confirmAction, setConfirmAction] = useState(null); // Хийх ёстой action
//   const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Modal нээгдсэн эсэх

//   const navigate = useNavigate();
//   useEffect(() => {
//     if (thesisId) {
//       fetchtasks();
//     }
//   }, [thesisId]);

//   const fetchtasks = async () => {
//     setLoading(true);
//     try {
//       const Thesis = await api.get(`/onethesis/${thesisId}`);

//       const thesisData = Thesis?.data?.data;

//       if (!thesisData) {
//         toast.error("Төслийн мэдээлэл ачааллахад алдаа гарлаа.");
//         return;
//       }
//       setData(thesisData.tasks ?? []);
//       setThesis(thesisData);
//       setThesisCycle(thesisData.thesis_cycle ?? null);
//       setPlanStatus(thesisData.thesisPlanStatus ?? {});
//     } catch (error) {
//       if (error.response?.status === 403) {
//         toast.error("Та энэ төлөвлөгөөг үзэх эрхгүй байна.");
//         navigate("/student/dashboard");
//       } else {
//         console.error("Error fetching tasks:", error);
//         toast.error("Төлөвлөгөө ачаалахад алдаа гарлаа.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
//   const confirmAndExecute = (actionName) => {
//     setConfirmAction(actionName);
//     setIsConfirmOpen(true);
//   };
//   const handleConfirmedAction = () => {
//     if (confirmAction === "approve") handleApprove();
//     else if (confirmAction === "return") handleReturn();
//     else if (confirmAction === "submit") handleSubmit();
//     else if (confirmAction === "unsubmit") handleUnsubmit();

//     setIsConfirmOpen(false);
//   };

//   //TODO::
//   // Handle input change for tasks
//   const handleInputChange = async (index, field, value) => {
//     const updatedData = [...data];
//     updatedData[index][field] = value;
//     setData(updatedData);
//     // console.log("Updating project:", updatedData[index].id, field, value);
//     try {
//       const res = await api.put(`/tasks/${updatedData[index].id}`, {
//         name: value,
//       });

//       //   console.log(res);
//     } catch (error) {
//       console.error("Error updating project:", error);
//     }
//   };

//   // Handle input change for subtasks

//   const handleSubProjectChange = async (rowIndex, subIndex, field, value) => {
//     const updatedData = [...data];

//     // Update the subtask value
//     updatedData[rowIndex].subtasks[subIndex][field] = value;
//     setData(updatedData);

//     try {
//       const res = await api.put(
//         `/subtask/${updatedData[rowIndex].subtasks[subIndex].id}`,
//         { [field]: value }
//       );
//       //   console.log("Updated subtask:", res);
//     } catch (error) {
//       console.error("Error updating subtask:", error);
//     }
//   };

//   // Add new project
//   const handleAddRow = async () => {
//     setBtnLoading(true);
//     try {
//       const response = await api.post("/tasks", {
//         role: user.role,
//         thesis_id: thesisId,
//       });
//       setData([...data, response.data.task]);
//       toast.success("Шинэ мөр амжилттай нэмэгдлээ");
//     } catch (error) {
//       console.error("Error adding project:", error);
//       toast.error("Мөр нэмэхэд алдаа гарлаа");
//     } finally {
//       setBtnLoading(false);
//     }
//   };

//   // Add new subproject
//   const handleAddSubProject = async (rowIndex) => {
//     try {
//       // const today = new Date().toISOString().split("T")[0];
//       const response = await api.post("/subtask", {
//         task_id: data[rowIndex].id,
//       });

//       const updatedData = [...data];
//       updatedData[rowIndex].subtasks.push(response.data.subtask);
//       //   console.log("add", response);
//       setData(updatedData);
//     } catch (error) {
//       console.error("Error adding subproject:", error);
//     }
//   };
//   // Delete a project
//   const handleDeleteRow = async (index) => {
//     try {
//       const response = await api.delete(`/tasks/${data[index].id}`);
//       //   console.log(response);

//       setData(data.filter((_, i) => i !== index));
//     } catch (error) {
//       console.error("Error deleting project:", error);
//     }
//   };
//   // Delete a subproject
//   const handleDeleteSubProject = async (rowIndex) => {
//     const updatedData = [...data];
//     const subtasks = updatedData[rowIndex].subtasks;

//     if (subtasks.length > 1) {
//       try {
//         // console.log(subtasks[subtasks.length - 1].id);
//         await api.delete(`/subtask/${subtasks[subtasks.length - 1].id}`);
//         subtasks.pop();
//       } catch (error) {
//         console.error("Error deleting subproject:", error);
//       }
//     } else {
//       subtasks[0] = { name: "", start_date: "", end_date: "", description: "" };
//     }

//     setData(updatedData);
//   };
//   //TODO:: TEACHER Approve
//   const handleApprove = async () => {
//     // if (!planStatus?.student_sent) {
//     //   toast.warning("Оюутан төлөвлөгөөг илгээгүй байна.");
//     //   return;
//     // }

//     try {
//       const response = await api.patch(
//         `/thesis-plan-status/${thesisId}/teacher-status`,
//         {
//           status: "approved",
//         }
//       );
//       setPlanStatus((prev) => ({ ...prev, teacher_status: "approved" }));
//       toast.success("Төлөвлөгөөг амжилттай зөвшөөрлөө");
//     } catch (error) {
//       console.error("Error approving plan:", error);
//       toast.error("Төлөвлөгөөг зөвшөөрөх үед алдаа гарлаа");
//     }
//   };

//   const handleReturn = async () => {
//     try {
//       const response = await api.patch(
//         `/thesis-plan-status/${thesisId}/teacher-status`,
//         {
//           status: "returned",
//         }
//       );
//       //   console.log("Plan approved:", response);
//       setPlanStatus((prev) => ({ ...prev, teacher_status: "returned" }));
//       toast.success("Төлөвлөгөөг амжилттай буцаалаа");
//     } catch (error) {
//       console.error("Error approving plan:", error);
//     }
//   };

//   const handleSubmit = async () => {
//     setSendBtnLoading(true);
//     try {
//       const response = await api.patch(
//         `/thesis-plan-status/${thesisId}/student-send`
//       );
//       //   console.log("Plan submitted:", response);
//       toast.success("Төлөвлөгөөг амжилттай илгээлээ");
//       setPlanStatus((prev) => ({ ...prev, student_sent: true }));
//     } catch (error) {
//       console.error("Error submitting plan:", error);
//     } finally {
//       setSendBtnLoading(false);
//     }
//   };

//   const handleUnsubmit = async () => {
//     setUnSendBtnLoading(true);
//     try {
//       const response = await api.patch(
//         `/thesis-plan-status/${thesisId}/student-Unsend`
//       );
//       setPlanStatus((prev) => ({ ...prev, student_sent: false }));
//       toast.success("Төлөвлөгөөг амжилттай буцаалаа");
//     } catch (error) {
//       if (error.response && error.response.status === 403) {
//         toast.error("Багш төлөвлөгөөг зөвшөөрсөн тул буцаах боломжгүй.");
//       } else {
//         toast.error("Төлөвлөгөөг буцаах явцад алдаа гарлаа.");
//       }
//       console.error("Error unsubmitting plan:", error);
//     } finally {
//       setUnSendBtnLoading(false);
//     }
//   };

//   const handlepDF = async () => {
//     setPdfLoading(true);
//     try {
//       const res = await api.get(`/thesis/${thesisId}`);
//       const thesis_info = res.data.data;

//       if (
//         !thesis_info ||
//         !thesisCycle ||
//         !thesisCycle.start_date ||
//         !thesisCycle.end_date
//       ) {
//         toast.error("Төлөвлөгөөний мөчлөг олдсонгүй тул PDF үүсгэж чадахгүй.");
//         return;
//       }

//       generatePDF(data, thesis_info, thesisCycle);
//     } catch (error) {
//       console.error("ERROR:", error);
//     } finally {
//       setPdfLoading(false);
//     }
//   };
//   const formatToMongoliaTime = (utcDateStr) => {
//     return new Date(utcDateStr).toLocaleString("mn-MN", {
//       timeZone: "Asia/Ulaanbaatar",
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };
//   const isEditable =
//     (user.role === "student" && planStatus?.teacher_status !== "approved") ||
//     user.role === "supervisor";

//   const renderPlanStatus = () => {
//     if (!planStatus) return <div>Төлөв: Статусын мэдээлэл алга байна</div>;

//     const {
//       student_sent,
//       student_sent_at,
//       teacher_status,
//       teacher_status_updated_at,
//       department_status,
//       department_status_updated_at,
//     } = planStatus;

//     let message = "";
//     let tagColor = "default";

//     if (!student_sent && teacher_status === "returned") {
//       message = "Төлөвлөгөө буцаагдсан.";
//       tagColor = "red";
//     } else if (!student_sent && teacher_status === "pending") {
//       message = "Төлөвлөгөө илгээгүй байна.";
//       tagColor = "orange";
//     } else if (student_sent && teacher_status !== "approved") {
//       message = " Төлөвлөгөө илгээсэн.";
//       tagColor = "blue";
//     } else if (
//       teacher_status === "approved" &&
//       department_status !== "approved"
//     ) {
//       message = "Удирдагч багш төлөвлөгөөг баталсан.";
//       tagColor = "green";
//     } else if (
//       teacher_status === "approved" &&
//       department_status === "approved"
//     ) {
//       message = "Төлөвлөгөөг тэнхим бүрэн баталсан.";
//       tagColor = "green";
//     }

//     return (
//       <div>
//         <Tag color={tagColor}>{message}</Tag>
//       </div>
//     );
//   };
//   const convertToGanttTasks = (tasks) => {
//     const ganttTasks = [];

//     tasks.forEach((task) => {
//       if (task.subtasks) {
//         task.subtasks.forEach((sub) => {
//           ganttTasks.push({
//             id: `subtask-${sub.id}`,
//             name: sub.name,
//             start: sub.start_date,
//             end: sub.end_date,
//             progress: 0, // or use a real value if available
//             dependencies: "", // you can fill this in if you track dependencies
//           });
//         });
//       }
//     });

//     return ganttTasks;
//   };
//   if (!thesisId) {
//     return (
//       <div style={{ padding: "50px", textAlign: "center" }}>
//         <h4 style={{ color: "gray" }}>
//           Таны дипломын ажлын мэдээлэл олдсонгүй.
//         </h4>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {loading ? (
//         <div style={{ textAlign: "center", padding: "50px" }}>
//           <Spin tip="Уншиж байна..." size="large" />
//         </div>
//       ) : (
//         <Row>
//           <div className="flex items-center gap-2 mb-3">
//             <h4 className="m-0 leading-none">
//               <Button
//                 type="text"
//                 className="p-0 text-lg flex items-center"
//                 onClick={() => navigate(-1)}
//                 icon={<span className="text-xl">←</span>}
//               />
//               7 хоногийн үйлчлэлсэн төлөвлөгөө
//             </h4>
//           </div>

//           <Col xl={8} style={{ marginBottom: "10px" }}>
//             <Card>
//               <CardBody>
//                 {thesisCycle ? (
//                   <div
//                     style={{
//                       display: "flex",
//                       flexDirection: "row",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       padding: "10px 20px",

//                       flexWrap: "wrap",
//                       gap: "20px",
//                     }}
//                   >
//                     <div>
//                       <strong>Эхлэх өдөр:</strong>{" "}
//                       <Tag color="blue">{thesisCycle?.start_date}</Tag>
//                     </div>
//                     <div>
//                       <strong>Дуусах өдөр:</strong>{" "}
//                       <Tag color="red">{thesisCycle?.end_date}</Tag>
//                     </div>
//                     <div style={{ flex: 1 }}>{renderPlanStatus()}</div>
//                   </div>
//                 ) : (
//                   <div>Төлөвлөгөөний мөчлөг алга</div>
//                 )}
//               </CardBody>
//             </Card>
//           </Col>
//           {/* <Split className="split" sizes={[40, 60]} minSize={200} gutterSize={10}> */}

//           <Col xl={8} style={{ marginBottom: "10px" }}>
//             <Card>
//               <CardBody>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     paddingBottom: "10px",
//                   }}
//                 >
//                   {isEditable &&
//                     (data.length > 0 ? (
//                       <Button
//                         type="primary"
//                         icon={<PlusOutlined />}
//                         loading={btnLoading}
//                         onClick={handleAddRow}
//                       >
//                         Мөр нэмэх
//                       </Button>
//                     ) : (
//                       <Button
//                         type="primary"
//                         icon={<PlusOutlined />}
//                         loading={btnLoading}
//                         onClick={handleAddRow}
//                       >
//                         Төлөвлөгөө үүсгэх
//                       </Button>
//                     ))}

//                   <div>
//                     <Button
//                       type="default"
//                       icon={<FilePdfOutlined />}
//                       loading={pdfLoading}
//                       onClick={handlepDF}
//                       style={{ marginRight: "10px" }}
//                       disabled={!data.length || !thesisCycle?.start_date}
//                     >
//                       PDF
//                     </Button>
//                   </div>
//                 </div>

//                 <PlanTable
//                   data={data}
//                   handleInputChange={handleInputChange}
//                   handleSubProjectChange={handleSubProjectChange}
//                   handleAddSubProject={handleAddSubProject}
//                   handleDeleteSubProject={handleDeleteSubProject}
//                   handleDeleteRow={handleDeleteRow}
//                   isEditable={isEditable}
//                 />
//               </CardBody>
//             </Card>
//           </Col>

//           <Col xl={10} style={{ marginBottom: "10px" }}>
//             <Card>
//               <GanttChart tasks={convertToGanttTasks(data)} />;
//             </Card>
//           </Col>
//           {/* </Split> */}
//         </Row>
//       )}

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "flex-end",
//           marginTop: "20px",
//           gap: "10px",
//         }}
//       >
//         {user.role === "student" && (
//           <Button
//             type="primary"
//             onClick={() => confirmAndExecute("submit")}
//             loading={sendBtnLoading}
//             disabled={
//               planStatus?.student_sent ||
//               planStatus?.teacher_status === "approved"
//             }
//           >
//             Хөтөлбөр илгээх
//           </Button>
//         )}

//         {user.role === "student" && (
//           <Button
//             danger
//             //onClick={handleUnsubmit}
//             onClick={() => confirmAndExecute("unsubmit")}
//             loading={UnsendBtnLoading} // Show loading spinner while unsubmitting
//             disabled={
//               !planStatus?.student_sent ||
//               planStatus?.teacher_status === "approved"
//             }
//           >
//             Илгээсэн төлөвлөгөөг буцаах
//           </Button>
//         )}

//         {user.role === "supervisor" && (
//           <>
//             <Button
//               type="primary"
//               onClick={() => confirmAndExecute("approve")}
//               disabled={planStatus?.teacher_status === "approved"}
//             >
//               Зөвшөөрөх
//             </Button>
//             <Button
//               danger
//               onClick={() => confirmAndExecute("return")}
//               disabled={planStatus?.teacher_status !== "approved"}
//             >
//               Татгалзах
//             </Button>
//           </>
//         )}
//         <ConfirmModal
//           open={isConfirmOpen}
//           onOk={handleConfirmedAction}
//           onCancel={() => setIsConfirmOpen(false)}
//           content={
//             confirmAction === "approve"
//               ? "Та энэ төлөвлөгөөг зөвшөөрөхийг хүсэж байна уу?"
//               : confirmAction === "return"
//               ? "Та энэ төлөвлөгөөг татгалзах уу?"
//               : confirmAction === "submit"
//               ? "Та төлөвлөгөөг илгээхийг хүсэж байна уу?"
//               : confirmAction === "unsubmit"
//               ? "Та илгээсэн төлөвлөгөөг буцаахыг хүсэж байна уу?"
//               : ""
//           }
//         />
//       </div>
//     </div>
//   );
// };

// export default TableComponent;
