import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, DatePicker, Button, message, Space } from "antd";
import api from "../../../context/api_helper";
//TODO
const SupervisorGradingPage = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const cycleId = query.get("cycleId");
  const schemaId = query.get("schemaId");
  const componentId = query.get("component");

  const [scores, setScores] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchGradingData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/thesis-cycles/" + cycleId + "/grading-components/" + componentId + "/scores");
  
      const transformed = res.data.flatMap((student) =>
        student.scores.map((score) => ({
          teacher_name: `${score.teacher?.lastname || ""} ${score.teacher?.firstname || ""}`,
          student_name: `${student.student?.lastname || ""} ${student.student?.firstname || ""}`,
          score: score.score,
          scored_at: score.created_at,
          teacher_id: score.teacher?.id,
          student_id: student.student?.id,
        }))
      );
  
      setScores(transformed);
    } catch (err) {
      console.error(err);
      message.error("Failed to load grading data.");
    }
    setLoading(false);
  };
  


  useEffect(() => {
    fetchGradingData();
  }, [cycleId, schemaId, componentId]);

  const columns = [
    {
      title: "Teacher",
      dataIndex: "teacher_name",
      key: "teacher_name",
    },
    {
      title: "Student",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Scored At",
      dataIndex: "scored_at",
      key: "scored_at",
    },
  ];

  return (
    <div>
      <h2></h2>



      <Table
        bordered
        columns={columns}
        dataSource={scores}
        loading={loading}
        rowKey={(row) => `${row.teacher_id}-${row.student_id}`}
        pagination={false}
      />
    </div>
  );
};

export default SupervisorGradingPage;
