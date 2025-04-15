// StudentList.js
import React from "react";
import { Table, Tag } from "antd";

const StudentList = ({
  data,
  rowSelection,
  studentCommitteeMap,
}) => {
  const columns = [
    {
      title: "Хөтөлбөр",
      key: "program",
      render: (_, record) => <div>{record.student_info.program}</div>,
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
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Completed" ? "blue" : "green"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Комисс",
      key: "committee",
      render: (_, record) => {
        const committeeName = studentCommitteeMap[record.student_info.id];
        return committeeName ? (
          <Tag color="blue">{committeeName}</Tag>
        ) : (
          <Tag color="default">Хуваарилагдаагүй</Tag>
        );
      },
    },
  ];

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ pageSize: 20 }}
      bordered
      scroll={{ x: true }}
    />
  );
};

export default StudentList;
