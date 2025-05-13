import React, { useEffect, useState } from "react";
import { useLocation , useNavigate} from "react-router-dom";
import { Table, Button, message, Space, InputNumber ,Typography,Tooltip} from "antd";
import {
FileMarkdownOutlined
  } from "@ant-design/icons";
import api from "../../../context/api_helper";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const SupervisorGradingPage = () => {
    const { Title, Text } = Typography;

  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const cycleId = query.get("cycleId");
  const schemaId = query.get("schemaId");
  const componentId = query.get("component");

  const [editMode, setEditMode] = useState(false);
  const [editedScores, setEditedScores] = useState({});
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fetchGradingData = async () => {
    setLoading(true);
    try {
      const thesesRes = await api.get(`/cycles/${cycleId}/theses`);
      const scoresRes = await api.get(`/thesis-cycles/${cycleId}/grading-components/${componentId}/scores`);

      const theses = thesesRes.data;
      const scores = scoresRes.data.data;

      const scoreMap = {};
      scores.forEach(score => {
        scoreMap[score.student.id] = score;
      });

      const formatted = theses.map(thesis => {
        const student = thesis.student_info;
        const score = scoreMap[student.id];

        return {
          key: thesis.id,
          student_id: student.id,
          thesis_id: thesis.id,
          supervisor_id: thesis.supervisor_info?.id,
          student_name: `${student.lastname} ${student.firstname}`,
          teacher_name: `${thesis.supervisor_info?.lastname} ${thesis.supervisor_info?.firstname} `|| "—",
          score: score?.score || null,
          scored_at: score?.created_at || "—",
          thesis_title: thesis.name_mongolian,
        };
      });

      setScores(formatted);
    } catch (err) {
      console.error(err);
      message.error("Оноо ачааллахад алдаа гарлаа.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGradingData();
  }, [cycleId, schemaId, componentId]);

  const handleSaveScores = async () => {
    const payloads = scores
      .filter((row) => editedScores[row.student_id] !== undefined)
      .map((row) => ({
        thesis_id: row.thesis_id,
        student_id: row.student_id,
        component_id: componentId,
        score: Number(editedScores[row.student_id]),
        given_by_type: "teacher",
        given_by_id: row.supervisor_id,
      }));

    try {
      await Promise.all(payloads.map((p) => api.post("/scores", p)));
      message.success("Оноо амжилттай хадгалагдлаа.");
      setEditMode(false);
      setEditedScores({});
      fetchGradingData();
    } catch (err) {
      console.error(err);
      message.error("Оноо хадгалах үед алдаа гарлаа.");
    }
  };

  const columns = [
    {
      title: "Төгсөлтийн ажлын сэдэв",
      dataIndex: "thesis_title",
      key: "thesis_title",
    },
    {
      title: "Оюутан",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Удирдагч багш",
      dataIndex: "teacher_name",
      key: "teacher_name",
    },
    {
      title: "Оноо",
      dataIndex: "score",
      key: "score",
      render: (text, record) =>
        editMode ? (
          <InputNumber
            min={0}
            max={100}
            value={editedScores[record.student_id] ?? text}
            onChange={(value) =>
              setEditedScores((prev) => ({
                ...prev,
                [record.student_id]: value,
              }))
            }
          />
        ) : (
          text ?? "—"
        ),
    },
  ];
  const exportSupervisorScoresToExcel = () => {
    const data = scores.map((row, index) => ({
      "№": index + 1,
      "Төгсөлтийн ажлын сэдэв": row.thesis_title,
      "Оюутан": row.student_name,
      "Удирдагч багш": row.teacher_name,
      "Оноо": formatScore(row.score),
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supervisor Scores");
  
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, `supervisor_scores_${Date.now()}.xlsx`);
  };
  
  const formatScore = (score) => {
    const parsed = parseFloat(score);
    return isNaN(parsed) ? "-" : parsed % 1 === 0 ? parsed.toFixed(0) : parsed.toString();
  };
  
  return (
    <div>
<div className="flex items-center justify-between mb-4 mt-4">
  {/* Зүүн тал */}
  <div className="flex items-center gap-2">
    <Tooltip title="Буцах">
      <Button
        type="text"
        className="p-0 text-lg flex items-center"
        onClick={() => navigate(-1)}
        icon={<span className="text-xl">←</span>}
      />
    </Tooltip>
    <Title level={4} style={{ marginBottom: 0 }}>
      Удирдагч багшийн үнэлгээ
    </Title>
  </div>

  {/* Баруун тал */}
  <div>
    {!editMode ? (
      <Button type="default" onClick={() => setEditMode(true)}>
        Оноо оруулах
      </Button>
    ) : (
      <Button type="primary" onClick={handleSaveScores}>
        Бүгдийг хадгалах
      </Button>
    )}

<Button color="cyan" variant="outlined" onClick={exportSupervisorScoresToExcel} style={{ marginLeft: 8 }}>
 <FileMarkdownOutlined /> Excel татах
</Button>
  </div>
</div>


      <Table
        bordered
        columns={columns}
        dataSource={scores}
        loading={loading}
        rowKey={(row) => row.student_id}
        pagination={false}
      />
    </div>
  );
};

export default SupervisorGradingPage;
