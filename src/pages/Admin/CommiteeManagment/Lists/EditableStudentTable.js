
import React from "react";
import { Table, Tag, InputNumber, Form, Button } from "antd";

const EditableStudentTable = ({
  committee,
  editingCommitteeId,
  setEditingCommitteeId,
  handleSaveAll,
  form,
}) => {
  const isEditing = editingCommitteeId === committee.id;

  const getStudentTableColumns = (graders = [], committeeId) => {
    const baseColumns = [
      {
        title: "Оюутан",
        dataIndex: "student",
        key: "student",
        render: (student) =>
          student ? `${student.lastname} ${student.firstname}` : "-",
      },
    ];

    const teacherScoreColumns = graders.map((g) => ({
      title: `${g.teacher?.lastname || "Багш"} ${g.teacher?.firstname || ""}`,
      dataIndex: "grades",
      key: `score-${g.teacher_id}`,
      render: (_, record) => {
        const grade = record.grades?.find(
          (gr) => gr.teacher_id === g.teacher_id
        );

        return isEditing ? (
          <Form.Item
            name={`score-${record.id}-${g.teacher_id}`}
            style={{ margin: 0 }}
            rules={[{ required: true, message: "Дүн шаардлагатай" }]}
          >
            <InputNumber min={0} max={100} />
          </Form.Item>
        ) : (
          <Tag color="green">{grade?.score ?? "-"}</Tag>
        );
      },
    }));

    return [...baseColumns, ...teacherScoreColumns];
  };

  return (
    <>
      <Form form={form} component={false}>
        <Table
          columns={getStudentTableColumns(committee.graders, committee.id)}
          dataSource={committee.students}
          rowKey={(record) => record.student?.id || record.id}
          pagination={false}
        />
      </Form>

      {isEditing ? (
        <div style={{ marginTop: 8 }}>
          <Button type="primary" onClick={() => handleSaveAll(committee)}>
            Бүгдийг хадгалах
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => setEditingCommitteeId(null)}>
            Болих
          </Button>
        </div>
      ) : (
        <Button
          type="link"
          onClick={() => {
            const values = {};
            committee.students.forEach((student) => {
              student.grades.forEach((gr) => {
                values[`score-${student.id}-${gr.teacher_id}`] = gr.score ?? null;
              });
            });
            form.setFieldsValue(values);
            setEditingCommitteeId(committee.id);
          }}
        >
          Бүгдийг засах
        </Button>
      )}
    </>
  );
};

export default EditableStudentTable;
