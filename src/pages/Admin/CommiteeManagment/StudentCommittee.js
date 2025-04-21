import React, { useState, useEffect } from "react";

import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Select,
  Row,
  Col,
  InputNumber,
  Radio,
} from "antd";
import api from "../../../context/api_helper";
import { Container } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { Search } = Input;
const { Option } = Select;
//Комиссын сурагчдын жагсаалт
const StudentCommittee = ({ cycleId, componentId }) => {
  const [filterAssigned, setFilterAssigned] = useState("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);
  const [theses, setTheses] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  // Filters
  const [searchText, setSearchText] = useState("");
  //   const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  const [filteredTheses, setFilteredTheses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [thesesResponse, committeesRes] = await Promise.all([
          //   api.get("/students"),
          api.get(`/cycles/${cycleId}/active-theses`), 
          api.get(
            `/thesis-cycles/${cycleId}/grading-components/${componentId}/committees`
          ),
        ]);
        console.log("committeesRes.data", committeesRes.data.data);
        setFilteredTheses(thesesResponse.data);
        setTheses(thesesResponse.data);
        console.log("thesesResponse.data)", thesesResponse.data);
        setCommittees(committeesRes.data.data);
        toast.success(" амжилттай үүсгэсэн!");
      } catch (e) {
        //toast.error("Мэдээлэл ачаалахад алдаа гарлаа");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    searchText,
    selectedProgram,
    selectedStudent,
    selectedSupervisor,
    filterAssigned,
  ]);

  const getStudentCommittees = (studentId) => {
    return committees
      .filter((committee) =>
        (committee.students || []).some(
          (student) => student.student.id === studentId
        )
      )
      .map((committee) => committee.name);
  };

  const handleAdd = async () => {
    if (!selectedCommitteeId || selectedStudentIds.length === 0) {
      toast.warning("Комисс болон оюутан сонгоно уу");
      return;
    }

    const unassignedStudentIds = selectedStudentIds.filter(
      (id) =>
        !committees.some((committee) =>
          (committee.students || []).some((s) => s.student?.id === id)
        )
    );

    if (unassignedStudentIds.length === 0) {
      toast.warning(
        "Сонгосон оюутнууд аль хэдийн комисст хуваарилагдсан байна"
      );
      return;
    }

    try {
      console.log("Selected committee ID:", selectedCommitteeId);
      console.log("Selected student IDs:", selectedStudentIds);

      const res = await api.post(
        `/committees/${selectedCommitteeId}/students`,
        {
          student_ids: selectedStudentIds,
        }
      );
      console.log("student added", res.data);
      setCommittees((prev) =>
        prev.map((committee) => {
          if (committee.id === selectedCommitteeId) {
            return {
              ...committee,
              students: [...(committee.students || []), ...res.data.data],
            };
          }
          return committee;
        })
      );

      toast.success(" Оюутнууд амжилттай нэмэгдлээ");

      setSelectedStudentIds([]);

      //   const updatedTheses = await api.get(`/cycles/${cycleId}/theses`);
      //   console.log("updatedTheses.data", updatedTheses.data)
      //   setTheses(updatedTheses.data);
      // setFilteredTheses(updatedTheses.data);
    } catch {
      toast.error("Оюутан нэмэхэд алдаа гарлаа");
    }
  };
  const handleRemoveStudent = async (committeeId, committeeStudentId) => {
    try {
      await api.delete(
        `/committees/${committeeId}/students/${committeeStudentId}`
      );
      toast.success("Оюутан комиссоос амжилттай хасагдлаа");

      // Remove from UI
      setCommittees((prevCommittees) =>
        prevCommittees.map((committee) => {
          if (committee.id === committeeId) {
            return {
              ...committee,
              students: (committee.students || []).filter(
                (student) => student.id !== committeeStudentId
              ),
            };
          }
          return committee;
        })
      );
    } catch (error) {
      toast.error("Оюутан хасахад алдаа гарлаа");
      console.error(error);
    }
  };

  const applyFilters = () => {
    let filtered = theses;

    if (searchText) {
      filtered = filtered.filter((thesis) =>
        thesis.name_mongolian.toLowerCase().includes(searchText.toLowerCase())
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

    // ✅ Filter by assignment status
    if (filterAssigned === "assigned") {
      filtered = filtered.filter((thesis) =>
        committees.some((committee) =>
          (committee.students || []).some(
            (student) => student.student?.id === thesis.student_info.id
          )
        )
      );
    } else if (filterAssigned === "unassigned") {
      filtered = filtered.filter(
        (thesis) =>
          !committees.some((committee) =>
            (committee.students || []).some(
              (student) => student.student?.id === thesis.student_info.id
            )
          )
      );
    }

    setFilteredTheses(filtered);
  };

  const programOptions = [
    ...new Set(theses.map((thesis) => thesis.student_info.program)),
  ];

  const rowSelection = {
    selectedRowKeys: selectedStudentIds,
    onChange: (selectedRowKeys) => {
      setSelectedStudentIds(selectedRowKeys);
    },
    getCheckboxProps: (record) => {
      const isAlreadyAssigned = committees.some((committee) =>
        (committee.students || []).some(
          (student) => student.student?.id === record.student_info.id
        )
      );
      return {
        disabled: isAlreadyAssigned,
      };
    },
  };

  const columns = [
    {
      title: "№",
      key: "index",
      render: (text, record, index) => <span>{index + 1}</span>,
    },

    {
      title: "Хөтөлбөр",
      key: "program",
      render: (_, record) => {
        return <div>{record.student_info.program}</div>;
      },
    },
    {
      title: "Хэрэгжүүлэгч",
      key: "student_info",
      render: (_, record) => (
        <div>
          {record.student_info.lastname} {record.student_info.firstname}
        </div>
      ),
    },
    {
      title: "Удирдагч",
      key: "supervisor_info",
      render: (_, record) => (
        <div>
          {record.supervisor_info.lastname} {record.supervisor_info.firstname}
        </div>
      ),
    },
    {
      title: "Комисс",
      key: "committee",
      render: (_, record) => {
        const committeeNames = getStudentCommittees(record.student_info.id);
        console.log(record.student_info.id);
        return (
          <>
            {committeeNames.length > 0 ? (
              committeeNames.map((name, index) => (
                <Tag key={index} color="blue">
                  {name}
                </Tag>
              ))
            ) : (
              <Tag color="gray"></Tag>
            )}
          </>
        );
      },
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
      title: "Үйлдэл",
      key: "action",
      render: (_, record) => {
        const studentId = record.student_info.id;
        const studentCommittee = committees.find((committee) =>
          (committee.students || []).some(
            (s) => s.student?.id === studentId || s.id === studentId
          )
        );

        if (!studentCommittee) return null;

        // get corresponding committee_student_id
        const committeeStudent = (studentCommittee.students || []).find(
          (s) => s.student?.id === studentId || s.id === studentId
        );

        return (
          <Button
            danger
            size="small"
            onClick={() =>
              handleRemoveStudent(studentCommittee.id, committeeStudent.id)
            }
          >
            Хасах
          </Button>
        );
      },
    },
  ];

  const rowStyle = (record) => {
    const studentCommittees = committees.filter((committee) =>
      (committee.students || []).some(
        (student) => student.student?.id === record.id
      )
    );

    if (studentCommittees.length > 0) {
      const primaryCommittee = studentCommittees[0];

      return {
        style: {
          backgroundColor: primaryCommittee.color || "#f0f9ff",
          borderLeft: `4px solid ${primaryCommittee.color || "#1890ff"}`,
        },
      };
    }

    return {
      style: {},
    };
  };

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Radio.Group
            value={selectedCommitteeId}
            onChange={(e) => setSelectedCommitteeId(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            {committees.map((c) => (
              <Radio.Button key={c.id} value={c.id}>
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: c.color || "#1890ff",
                    border: "1px solid rgba(0,0,0,0.1)",
                    marginRight: 7,
         
                  }}
                ></span>
                {c.name} ({(c.students || []).length})
              </Radio.Button>
            ))}
          </Radio.Group>
        </Col>

        <Col style={{ marginTop: 16 }}>
          <Button
            type="primary"
            onClick={handleAdd}
            disabled={!selectedCommitteeId}
          >
            Хуваарилах ({selectedStudentIds.length})
          </Button>
        </Col>
      </Row>

      <Card className="mb-3">
        <Row gutter={[16, 16]}>
       

          {/* major */}
          <Col xs={24} md={6}>
            <Select
              placeholder="Хөтөлбөр"    
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

          <Col xs={24} md={6}>
            <Select
              value={filterAssigned}
              onChange={setFilterAssigned}
              style={{ width: "100%" }}
            >
              <Option value="all">Бүгд</Option>
              <Option value="assigned">Хуваарилагдсан</Option>
              <Option value="unassigned">Хуваарилагдаагүй</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              alignItems: "center",
            }}
          >
            <div>
              <b>Харуулж буй оюутнууд:</b> {filteredTheses.length}
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: 8 }}>Хуудас бүрт:</span>
              <InputNumber
                min={1}
                max={1000}
                value={pageSize}
                onChange={(value) => setPageSize(value || 1)} // fallback to 1 if empty
                style={{ width: 100 }}
              />
            </div>
          </div>
        </>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredTheses}
          //   rowKey={(record) => record.id}
          rowKey={(record) => record.student_info.id}
          //pagination={{ pageSize: pageNumber }}
          pagination={{ pageSize }}
          bordered
          scroll={{ x: true }}
          onRow={(record) => {
            const studentCommittees = committees.filter((committee) =>
              (committee.students || []).some(
                (student) => student.student.id === record.student_info.id
              )
            );

            if (studentCommittees.length > 0) {
              const committeeColor = studentCommittees[0].color || "#f0f9ff";
              return {
                style: {
                  backgroundColor: committeeColor,
                  borderLeft: `4px solid ${committeeColor}`,
                },
              };
            }

            return {};
          }}
        />
      </Card>
    </>
  );
};

export default StudentCommittee;
