// CommitteeScoreModal.js
import React , {useEffect}from "react";
import { Modal, Form, Card, Row, Col, InputNumber, Tag } from "antd";

const CommitteeScoreModal = ({
  visible,
  selectedCommittee,
  onClose,
  onSubmit,
  getInitialFormValues,
  scoreForm,
}) => {
    useEffect(() => {
        if (selectedCommittee) {
          scoreForm.resetFields();
          scoreForm.setFieldsValue(getInitialFormValues(selectedCommittee));
        }
      }, [selectedCommittee]);
  
      
  return (
    <Modal
      title="Оноо оруулах"
      open={visible}
      onCancel={onClose}
      onOk={() => scoreForm.submit()}
      width={800}
    >
      <Form
        form={scoreForm}
        onFinish={onSubmit}
      >
        {selectedCommittee?.students?.map((student) => (
          <Card
            key={`student-${student.id}`}
            size="small"
            title={`${student.student?.lastname || ""}.${student.student?.firstname || ""}`}
            style={{ marginBottom: 16 }}
          >
          <Row gutter={[8, 8]} style={{ marginBottom: 10 }}>
  {/* Committee teacher inputs */}
  {selectedCommittee?.members?.map((teacher) => {
    const grade = teacher.committeeScores?.find(
      (cs) => cs.student?.id === student.student?.id
    );

    return (
      <Col span={8} key={`score-${student.id}-${teacher.id}`}>
        <div style={{ marginBottom: 4 }}>
          {grade?.score === undefined && <Tag color="green">Хоосон</Tag>}
        </div>

        <Form.Item
          label={`${teacher.teacher?.lastname || ""} ${teacher.teacher?.firstname || ""}`}
          name={[
            student.id.toString(),
            teacher.teacher?.id?.toString(),
          ]}
          initialValue={grade?.score || null}
        >
          <InputNumber min={0} max={100} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    );
  })}

  {/* External reviewer inputs */}
  {selectedCommittee?.externalReviewers?.map((reviewer) => {
    const score = reviewer.scores?.find(
      (s) => s.student_id === student.student?.id
    );

    return (
      <Col span={8} key={`ext-score-${student.id}-${reviewer.id}`}>
        <div style={{ marginBottom: 4 }}>
          {score?.score === undefined && <Tag color="blue">Гадаад</Tag>}
        </div>

        <Form.Item
          label={`${reviewer.lastname || ""} ${reviewer.firstname || ""} (гадаад)`}
          name={[
            student.id.toString(),
            `external-${reviewer.id.toString()}`
          ]}
          initialValue={score?.score || null}
        >
          <InputNumber min={0} max={100} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
    );
  })}
</Row>

          </Card>
        ))}
      </Form>
    </Modal>
  );
};

export default CommitteeScoreModal;
