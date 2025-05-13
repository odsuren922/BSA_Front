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
  Skeleton
} from "antd";
import GradingSchemaTable from "../../components/grading/GradingSchemaTable";
import StudentCount from "../../components/Common/StudentCount";
import api from "../../context/api_helper";
import {
  TeamOutlined,
} from "@ant-design/icons";
import { Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Search } = Input;
const { Option } = Select;

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

    //   const cycleResponse = await api.get(`/thesis-cycles/${id}`);
    //   const thesesResponse = await api.get(`/cycles/${id}/theses`);
    //   const studentCountByProgram = await api.get(
    //     `/cycles/${id}/student-counts`
    //   );
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
    //   console.log("grading schema", response.data);
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

  const columns = [
    {
      title: "БСА Нэр",
      dataIndex: "name_mongolian",
      key: "name_mongolian",
    },
    {
      title: "Суралцагч",
      key: "student_info",
      render: (_, record) => (
        <div>
          <div>
            {record.student_info.lastname} {record.student_info.firstname}
          </div>
          <div className="text-muted">{record.student_info.program}</div>
        </div>
      ),
    },
    {
      title: "Удирдагч багш",
      key: "supervisor_info",
      render: (_, record) => (
        <div>
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
        <Tag color={status === "Completed" ? "blue" : "green"}>
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
  ];
  const getPlanStatusMessage = (planStatus) => {
    if (!planStatus) return "Статусын мэдээлэл алга байна";

    const { student_sent, teacher_status, department_status } = planStatus;

    if (!student_sent && teacher_status === "returned") {
      return "Төлөвлөгөөг буцаагдсан.";
    } else if (!student_sent && teacher_status === "pending") {
      return "Төлөвлөгөөг илгээгүй байна.";
    } else if (student_sent && teacher_status === "pending") {
      return "Төлөвлөгөөг илгээсэн.";
    } else if (
      teacher_status === "approved" &&
      department_status !== "approved"
    ) {
      return "Удирдагч багш төлөвлөгөөг баталсан.";
    } else if (
      teacher_status === "approved" &&
      department_status === "approved"
    ) {
      return "Төлөвлөгөөг тэнхим бүрэн баталсан.";
    }

    return "Тодорхойгүй төлөв.";
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
            </Row>
          </Card>
        ) : (
          <Card title="Уншиж байна..." className="mb-4">
            <Skeleton active />
          </Card>
        )}
      </Spin>


{/* 
<Spin spinning={loadingGradingSchema}>
        {thesisCycle && (
          <Card title="Үнэлгээний схем" className="mb-4">
            <GradingSchemaTable
              gradingSchema={gradingSchema}
              thesisCycle={thesisCycle}
              cycleId={id}
            />
          </Card>
        )}
      </Spin> */}

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



    </Container>
  );
};

export default ThesisCyclePage;
