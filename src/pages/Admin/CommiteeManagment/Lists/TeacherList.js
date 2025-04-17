// TeacherList.jsx
import React from "react";
import { Table, Input, Select, Row, Col } from "antd";
// Багш нарын мэдээлэл
const TeacherList = ({
  teachers,
  filterName,
  setFilterName,
  filterStatus,
  setFilterStatus,
  columns,
  loading,
  rowStyle,
  getTeacherCommittees, // багшийн хамт олныг тооцох функц
  handleDeleteMember,
}) => {
  // Багшдыг нэр болон статустайгаар шүүх
  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.lastname} ${teacher.firstname}`.toLowerCase();
    const matchesName = fullName.includes(filterName.toLowerCase());
    const teacherCommittees = getTeacherCommittees(teacher.id);
    let matchesStatus = true;
    if (filterStatus === "choosed") {
      matchesStatus = teacherCommittees.length > 0;
    } else if (filterStatus === "unchoosed") {
      matchesStatus = teacherCommittees.length === 0;
    }
    return matchesName && matchesStatus;
  });


  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Input
            placeholder="Багшийн нэрийг хайх"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </Col>
        <Col span={8}>
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            options={[
              { value: "all", label: "Бүх багш" },
              { value: "choosed", label: "Сонгосон багш" },
              { value: "unchoosed", label: "Сонгоогүй багш" },
            ]}
            style={{ width: "100%" }}
          />
        </Col>
      </Row>
      <Table 
        dataSource={filteredTeachers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        bordered
        // onRow={rowStyle} 
        onRow={(record) => rowStyle(record)}
      />
    </>
  );
};

export default TeacherList;
