import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  message,
  Space,
  InputNumber,
  Typography,
  Tooltip,
  Input,
  Select,
} from "antd";
import api from "../../../context/api_helper";
import { useUser } from "../../../context/UserContext";
import {
    FileMarkdownOutlined
      } from "@ant-design/icons";
import { exportAssignedGradingToExcel } from "../../../components/export/exportAssignedGradingToExcel";
const AllThesisAssignedGradingPage = () => {
  const { Title } = Typography;
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const cycleId = query.get("cycleId");
  const schemaId = query.get("schemaId");
  const componentId = query.get("component");
  const [scoreFilter, setScoreFilter] = useState("all"); // all | given | not_given
  const [teacherFilter, setTeacherFilter] = useState("all"); // all | assigned | unassigned
 const { user } = useUser();

  const [editMode, setEditMode] = useState(false);
  const [editedScores, setEditedScores] = useState({});
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
  
  const [searchText, setSearchText] = useState({
    teacher_name: "",
    thesis_title: "",
    supervisor_name: "",
  });
  const navigate = useNavigate();

  const handleSearchChange = (field, value) => {
    setSearchText((prev) => ({
      ...prev,
      [field]: value.toLowerCase(),
    }));
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [thesesRes, assignedRes] = await Promise.all([
        api.get(`/cycles/${cycleId}/theses`),
        api.get(`/assigned-grading/component/${componentId}/cycle/${cycleId}`),
      ]);

      const theses = thesesRes.data;
      const assignedGrading = assignedRes.data.data;
      console.log("assignedGrading",assignedGrading)
      const scoreMap = {};
      assignedGrading.forEach((ag) => {
        scoreMap[ag.student_id] = {
          score: ag.score,
          assigned_by: ag.assigned_by,
        };
      });
      

      const formatted = theses.map((thesis) => {
        const student = thesis.student_info;
        const supervisor = thesis.supervisor_info;
        const match = scoreMap[student.id];

        return {
          key: thesis.id,
          student_id: student.id,
          thesis_id: thesis.id,
          supervisor_id: supervisor?.id,
          assigned_teacher_id: match?.assigned_by?.id,
          student_name: `${student.lastname} ${student.firstname}`,
          
          supervisor_name: `${supervisor.lastname} ${supervisor.firstname}`,
          teacher_name: match?.assigned_by
            ? `${match.assigned_by.lastname} ${match.assigned_by.firstname}`
            : "—",
          score: match?.score?.score || null,
          scored_at: match?.score?.created_at || "—",
          thesis_title: thesis.name_mongolian,
        };
      });

      setScores(formatted);
    } catch (err) {
      console.error(err);
      message.error("Мэдээлэл ачааллахад алдаа гарлаа.");
    }
    setLoading(false);
  };

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const [teachersRes,] = await Promise.all([
        api.get(`/teachers/${user.dep_id}`),
  
      ]);

      console.log(teachersRes);
      setTeachers(teachersRes.data);

    } catch (error) {
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchTeacherData();
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
        given_by_id: row.assigned_teacher_id,
      }));

    try {
      await Promise.all(payloads.map((p) => api.post("/scores", p)));
      message.success("Оноо амжилттай хадгалагдлаа.");
      setEditMode(false);
      setEditedScores({});
      fetchAll();
    } catch (err) {
      console.error(err);
      message.error("Оноо хадгалах үед алдаа гарлаа.");
    }
  };


  const handleSaveAssignedTeachers = async () => {
    const payloads = scores
      .filter((row) => !!row.assigned_teacher_id) // Only where teacher selected
      .map((row) => ({
        thesis_cycle_id: cycleId,
        grading_component_id: componentId,
        thesis_ids: [row.thesis_id],
        student_ids: [row.student_id],
        assigned_by_type: "teacher", // or "admin", if role differs
        assigned_by_id: row.assigned_teacher_id,
      }));
  
    try {
      await Promise.all(payloads.map((p) => api.post("/assigned-grading", p)));
      message.success("Шүүмж багш нар амжилттай оноогдлоо");
      fetchAll();
    } catch (error) {
      console.error(error);
      message.error("Шүүмж багш оноох үед алдаа гарлаа");
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
      dataIndex: "supervisor_name",
      key: "supervisor_name",
    },
    {
        title: "Шүүмж багш",
        dataIndex: "teacher_name",
        key: "teacher_name",
        render: (text, record) =>
          editMode ? (
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Шүүмж багш сонгох"
              optionFilterProp="children"
              value={record.assigned_teacher_id}
              onChange={(value) => {
                const updated = scores.map((row) =>
                  row.student_id === record.student_id
                    ? {
                        ...row,
                        assigned_teacher_id: value,
                        teacher_name:
                          teachers.find((t) => t.id === value)?.lastname +
                          " " +
                          teachers.find((t) => t.id === value)?.firstname,
                      }
                    : row
                );
                setScores(updated);
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              
            >
              {teachers.map((teacher) => (
                <Select.Option key={teacher.id} value={teacher.id}>
                  {teacher.lastname} {teacher.firstname}
                </Select.Option>
              ))}
            </Select>
          ) : (
            text ?? "—"
          ),
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

  const filteredScores = scores.filter((row) => {
    const matchesTeacher = row.teacher_name
      .toLowerCase()
      .includes(searchText.teacher_name);
    const matchesThesis = row.thesis_title
      .toLowerCase()
      .includes(searchText.thesis_title);
    const matchesSupervisor = row.supervisor_name
      .toLowerCase()
      .includes(searchText.supervisor_name);

    const matchesScore =
      scoreFilter === "all"
        ? true
        : scoreFilter === "given"
        ? row.score !== null
        : row.score === null;

    const matchesAssigned =
      teacherFilter === "all"
        ? true
        : teacherFilter === "assigned"
        ? row.assigned_teacher_id
        : !row.assigned_teacher_id;

    return (
      matchesTeacher &&
      matchesThesis &&
      matchesSupervisor &&
      matchesScore &&
      matchesAssigned
    );
  });

  return (
    <div>
      {/* Header with back and title */}
      <div className="flex items-center justify-between mb-4 mt-4">
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
            Шүүмж багшийн үнэлгээ
          </Title>
        </div>

        <div>
        <Button 
         color="cyan" variant="outlined"
        onClick={() => exportAssignedGradingToExcel(filteredScores)} style={{ marginLeft: 8 }}   icon={<FileMarkdownOutlined />}>
 Excel татах
</Button>

            
          {!editMode ? (
            <Button type="default" onClick={() => setEditMode(true)}>
              Засварлах
            </Button>
          ) : (
            <Button type="primary" onClick={handleSaveScores}>
              Оноо хадгалах
            </Button>
            
          )}



{editMode && (
  <Button type="default" onClick={handleSaveAssignedTeachers}>
    Шүүмж багш оноох
  </Button>
)}



        </div>
        
      </div>
      <Space wrap className="mb-4">
        <Select
          value={scoreFilter}
          onChange={(value) => setScoreFilter(value)}
          style={{ width: 180 }}
          options={[
            { value: "all", label: "Бүгд (оноо)" },
            { value: "given", label: "Оноо өгсөн" },
            { value: "not_given", label: "Оноо өгөөгүй" },
          ]}
        />

        <Select
          value={teacherFilter}
          onChange={(value) => setTeacherFilter(value)}
          style={{ width: 200 }}
          options={[
            { value: "all", label: "Бүгд (Шүүмж багш)" },
            { value: "assigned", label: "Шүүмж багштай" },
            { value: "unassigned", label: "Шүүмж багшгүй" },
          ]}
        />
      </Space>

      {/* Search filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          placeholder="Шүүмж багш хайх"
          allowClear
          onChange={(e) => handleSearchChange("teacher_name", e.target.value)}
        />
        <Input
          placeholder="Сэдэв хайх"
          allowClear
          onChange={(e) => handleSearchChange("thesis_title", e.target.value)}
        />
        <Input
          placeholder="Удирдагч багш хайх"
          allowClear
          onChange={(e) =>
            handleSearchChange("supervisor_name", e.target.value)
          }
        />
      </div>

      {/* Table */}
      <Table
        bordered
        columns={columns}
        dataSource={filteredScores}
        loading={loading}
        rowKey={(row) => row.student_id}
        pagination={false}
      />
    </div>
  );
};

export default AllThesisAssignedGradingPage;
