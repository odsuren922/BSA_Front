import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Tag,
  Statistic,
  Input,
  Select,
  Table,
  Spin,
  Skeleton,Tooltip, Modal,Typography
} from "antd";
import GradingSchemaTable from "../../components/grading/GradingSchemaTable";
import StudentCount from "../../components/Common/StudentCount";
import api from "../../context/api_helper";
import {
  TeamOutlined,FileMarkdownOutlined
} from "@ant-design/icons";
import { Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { exportThesisToExcel } from "../../components/thesis/ExportThesisScoreExcel";


const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;
const ThesisCyclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thesisCycle, setCycle] = useState();
  const [gradingSchema, setGradingSchema] = useState([]);
  const [theses, setTheses] = useState([]);
  const [studentCounts, setStudentCounts] = useState([]);
  const [filteredTheses, setFilteredTheses] = useState([]);

    // Add loading states
    const [loadingCycle, setLoadingCycle] = useState(true);
    const [loadingTheses, setLoadingTheses] = useState(true);
    const [loadingStudentCounts, setLoadingStudentCounts] = useState(true);
    const [loadingGradingSchema, setLoadingGradingSchema] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  useEffect(() => {
    fetchThesisCycle();
    fetchGradingSchema();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    searchText,
    selectedDepartment,
    selectedProgram,
    selectedStudent,
    selectedSupervisor,
  ]);

  const fetchThesisCycle = async () => {
    try {
        setLoadingCycle(true);
        setLoadingTheses(true);
        setLoadingStudentCounts(true);
        setTableLoading(true);

    const [cycleResponse, thesesResponse, studentCountByProgram] = await Promise.all([
        api.get(`/thesis-cycles/${id}`),
        api.get(`/cycles/${id}/theses`),
        api.get(`/cycles/${id}/student-counts`)
      ]);
      

      setCycle(cycleResponse.data);
      setTheses(thesesResponse.data);
    
      console.log("these", thesesResponse.data);
      setStudentCounts(studentCountByProgram.data);
      setFilteredTheses(thesesResponse.data);
    } catch (error) {
      console.error(" Error:", error);
      
    } finally {
        setLoadingCycle(false);
        setLoadingTheses(false);
        setLoadingStudentCounts(false);
        setTableLoading(false);
      }
  };
  const fetchGradingSchema = async () => {
    try {
        setLoadingGradingSchema(true);
      const response = await api.get(`/thesis-cycles/${id}/grading-schema`);
      console.log("grading schema", response.data);
      setGradingSchema(response.data); // Set the grading schema response
    } catch (error) {
      console.error("Error fetching grading schema:", error);
    }
    finally {
        setLoadingGradingSchema(false);
      }
  };

  const applyFilters = () => {
    // setTableLoading(true);
    try {
      let filtered = theses;

      if (searchText) {
        filtered = filtered.filter((thesis) =>
          thesis.name_mongolian.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      if (selectedDepartment) {
        filtered = filtered.filter(
          (thesis) => thesis.department === selectedDepartment
        );
      }
      if (selectedProgram) {
        filtered = filtered.filter(
          (thesis) => thesis.student_info.program === selectedProgram
        );
      }
      if (selectedStudent) {
        filtered = filtered.filter((thesis) =>
          `${thesis.student_info.firstname} ${thesis.student_info.lastname}`
            .toLowerCase()
            .includes(selectedStudent.toLowerCase())
        );
      }

      if (selectedSupervisor) {
        filtered = filtered.filter((thesis) =>
          `${thesis.supervisor_info.firstname} ${thesis.supervisor_info.lastname}`
            .toLowerCase()
            .includes(selectedSupervisor.toLowerCase())
        );
      }

      setFilteredTheses(filtered);
    } finally {
    //   setTableLoading(false);
    }
  };


const gradingComponentColumns = Array.isArray(gradingSchema) && gradingSchema.length > 0
  ? [
      ...gradingSchema[0].grading_components.flatMap((component) => {
        const columns = [
          {
            title: component.name,
            key: `component_${component.id}`,
            render: (_, record) => {
              const scoreObj = record.scores?.find(
                (s) => s.component_id === component.id
              );
              return <span>{scoreObj ? scoreObj.score : "-"}</span>;
            },
          },
        ];

        if (component.by_who === "examiner") {
          columns.push({
            title: `${component.name} (Шүүмж багш)`,
            key: `assigned_teacher_${component.id}`,
            render: (_, record) => {
              const assigned = record.assigned_gradings?.find(
                (g) => g.component_id === component.id
              );
              const teacher = assigned?.assigned_by;
              return teacher
                ? `${teacher.lastname.charAt(0)}.${teacher.firstname}`
                : "—";
            },
          });
        }

        return columns; // always return an array
      }),
      {
        title: "Нийт оноо",
        key: "total_score",
        render: (_, record) => {
          const total = record.scores?.reduce((sum, s) => {
            return sum + parseFloat(s.score || 0);
          }, 0);
          return <strong>{total.toFixed(2)}</strong>;
        },
      },
    ]
  : [];




  
  const columns = [
    {
        title: "БСА Нэр",
        dataIndex: "name_mongolian",
        key: "name_mongolian",
        fixed: "left", 
        render: (text) => (
          <Tooltip title={text}>
            <div style={{ minWidth: 200 }}>
  {text}
</div>

          </Tooltip>
        ),
      },
    {
      title: "Суралцагч",
      key: "student_info",
      fixed: "left", 
      render: (_, record) => (
        <div>
          <div  style={{ minWidth: 180 }}> 
            {record.student_info.lastname} {record.student_info.firstname}
          </div>
          <div className="text-muted">{record.student_info.program}</div>
        </div>
      ),
    },
    {
        title: "SISI ID",
        key: "student_info",
        // fixed: "left", 
        render: (_, record) => (
          <div>

              {record.student_info.sisi_id}

          </div>
        ),
      },
    {
      title: "Удирдагч багш",
      key: "supervisor_info",
      render: (_, record) => (
        <div  style={{ minWidth: 180 }}> 
          {record.supervisor_info.lastname} {record.supervisor_info.firstname}
        </div>
      ),
    },    
    {
      title: "Тэнхим",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Төлөв",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Үечилсэн төлөвлөгөө",
      key: "plan_status",
      render: (_, record) => (
        <div>
          <Tag color={getPlanTagColor(record.plan_status)}>
            {getPlanStatusMessage(record.plan_status)}
          </Tag>
        </div>
      ),
    },
    {
      title: "Дэлгэрэнгүй",
      key: "plan_status",
      render: (_, record) => (
        <div style={{ textAlign: "center", marginTop: "auto" }}>
          <Button
            type="primary"
            size="small"
            href={`/aboutthesis/${record.id}`}
          >
            харах
          </Button>
        </div>
      ),
    },
    
      ...gradingComponentColumns,

    //schema info with student scores

    
  ];
  const getPlanStatusMessage = (planStatus) => {
    if (!planStatus) return "Mэдээлэл алга";

    const { student_sent, teacher_status, department_status } = planStatus;

    if (!student_sent && teacher_status === "returned") {
      return "Буцаагдсан";
    } else if (!student_sent && teacher_status === "pending") {
      return "Илгээгүй байна";
    } else if (student_sent && teacher_status === "pending") {
      return "Төлөвлөгөөг илгээсэн.";
    } else if (
      teacher_status === "approved" &&
      department_status !== "approved"
    ) {
      return "Удирдагч багш баталсан.";
    } else if (
      teacher_status === "approved" &&
      department_status === "approved"
    ) {
      return "Тэнхим бүрэн баталсан.";
    }

    return "Тодорхойгүй төлөв";
  };

  const getPlanTagColor = (planStatus) => {
    if (!planStatus) return "default";

    const { student_sent, teacher_status, department_status } = planStatus;

    if (!student_sent && teacher_status === "returned") {
      return "red";
    } else if (!student_sent && teacher_status === "pending") {
      return "orange";
    } else if (student_sent && teacher_status === "pending") {
      return "blue";
    } else if (
      teacher_status === "approved" &&
      department_status !== "approved"
    ) {
      return "green";
    } else if (
      teacher_status === "approved" &&
      department_status === "approved"
    ) {
      return "green";
    }

    return "default";
  };

  // Unique values for filters
  const departmentOptions = [
    ...new Set(theses.map((thesis) => thesis.department)),
  ];
  const programOptions = [
    ...new Set(theses.map((thesis) => thesis.student_info.program)),
  ];
  const studentOptions = [
    ...new Set(
      theses.map(
        (thesis) =>
          `${thesis.student_info.firstname} ${thesis.student_info.lastname}`
      )
    ),
  ];
  const supervisorOptions = [
    ...new Set(
      theses.map(
        (thesis) =>
          `${thesis.supervisor_info.firstname} ${thesis.supervisor_info.lastname}`
      )
    ),
  ];

  return (
    <Container className="mt-5 ">
      <Button onClick={() => navigate(-1)} type="primary" className="mb-3">
        ← Буцах
      </Button>

      <Spin spinning={loadingCycle && loadingTheses && loadingStudentCounts}>
        {thesisCycle ? (
          <Card title="Бакалаврын ажил" className="mb-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <p>
                  <strong>Нэр:</strong> {thesisCycle.name}
                </p>
                <p>
                  <strong>Хичээлийн жил:</strong> {thesisCycle.year}
                </p>
              </Col>
              <Col xs={24} md={8}>
                <p>
                  <strong>Төлөв:</strong>{" "}
                  <Tag color="blue">{thesisCycle.status}</Tag>
                </p>
                <p>
                  <strong>Нийт судалгааны ажлын тоо:</strong>{" "}
                  {thesisCycle.totalTheses}
                </p>
              </Col>
              <Col xs={24} md={8}>
                <p>
                  <strong>Эхлэх өдөр:</strong> {thesisCycle.start_date}
                </p>
                <p>
                  <strong>Дуусах өдөр:</strong> {thesisCycle.end_date}
                </p>
              </Col>

              <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    console.log("Үнэлгээний схем товч дарагдлаа");
                    await fetchGradingSchema();
                    setShowGradingModal(true);
                  }}
                >
                  Үнэлгээний схем харах
                </button>
            </Row>
          </Card>
        ) : (
          <Card title="Уншиж байна..." className="mb-4">
            <Skeleton active />
          </Card>
        )}
      </Spin>

<Spin spinning={loadingStudentCounts}>
        <Row gutter={[16, 16]} className="mb-4">
              <StudentCount studentCounts ={studentCounts}/>
        </Row>
      </Spin>

      {/* Filters Section */}
      <Card className="mb-3">
        <Row gutter={[16, 16]}>
         
          {/* <Col xs={24} md={6}>
            <Select
            placeholder="Тэнхимээр шүүх"
              style={{ width: "100%" }}
              allowClear
              onChange={setSelectedDepartment}
              value={selectedDepartment}
            >
              {departmentOptions.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Col> */}
          {/* major */}
          <Col xs={24} md={6}>
            <Select
              placeholder="Хөтөлбөрөөр шүүх"
              style={{ width: "100%" }}
              allowClear
              onChange={setSelectedProgram}
              value={selectedProgram}
            >
              {programOptions.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Search
              placeholder="БСА нэрээр хайх"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Search
              placeholder="Оюутны нэрээр хайх"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Search
              placeholder="Удирдагчийн нэрээр хайх"
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
  <Spin spinning={tableLoading}>


  <Button  color="cyan" variant="outlined" onClick={() => exportThesisToExcel(filteredTheses, gradingSchema, thesisCycle)} className="mb-3">
  <FileMarkdownOutlined /> Excel татах
</Button>
    <Table
      columns={columns}
      dataSource={tableLoading ? [] : filteredTheses} // Show empty during load
      rowKey="id"
      pagination={{ pageSize: 20 }}
      bordered
      scroll={{ x: true }}
      loading={tableLoading}
      locale={{
        emptyText: tableLoading ? 'Ачааллаж байна...' : 'Өгөгдөл байхгүй' // Custom empty text
      }}
    />
  </Spin>
</Card>

<Modal
  title={<Title level={4}>Үнэлгээний схем</Title>}
  open={showGradingModal}
  onCancel={() => setShowGradingModal(false)}
  footer={null}
  width={800} // similar to size="lg"
  centered
>
  <GradingSchemaTable
    gradingSchema={gradingSchema}
    thesisCycle={thesisCycle}
    cycleId={id}
  />
</Modal>


    </Container>
  );
};

export default ThesisCyclePage;
