import React, { useState, useEffect } from "react";
import { Button, Card, Col, Form, InputNumber, Row, Select, Spin } from "antd";
import { toast } from "react-toastify";
import api from "../../context/api_helper";
import { useUser } from "../../context/UserContext";

const ScoreForm = ({
  thesisId,
  gradingSchema,
  onSuccess,
  Supervisorid,
  Studentid,
  thesisCycleId,
  scores,
  loading,
}) => {
  const [form] = Form.useForm();
  const [loadingSend, setloadingSend] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [scoreValue, setScoreValue] = useState(0);
  const { user } = useUser();
  const [hasPermission, setHasPermission] = useState(false);
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    if (!selectedComponent) return;

    const matched = scores?.find(
      (s) => s.component?.id === selectedComponent.id
    );
    const newScore = matched?.score ?? 0;

    setScoreValue(newScore);
    form.setFieldsValue({ score: newScore }); // form дээр оноо update хийнэ
    setEditMode(false); // өмнөх editMode-г reset хийх
  }, [selectedComponent, scores]);

  useEffect(() => {
    const checkPermission = async () => {
      if (!selectedComponent) {
        setHasPermission(false);
        return;
      }

      if (selectedComponent?.by_who === "supervisor") {
        setHasPermission(true);
        // setHasPermission(user.id === Supervisorid && user.role === "teacher");
      } else if (selectedComponent?.by_who === "committee") {
        setHasPermission(false);
        try {
          const res = await api.post("/committees/check-assignment", {
            thesis_cycle_id: thesisCycleId,
            grading_component_id: selectedComponent.id,
            student_id: Studentid,
            teacher_id: user.id,
          });

          setHasPermission(res.data.match);
          if (!res.data.match) {
            toast.error(
              "Та энэ оюутныг үнэлэх эрхгүй байна. Та энэ хороонд хамаарахгүй байна."
            );
          }
        } catch (e) {
          toast.error("Шалгах явцад алдаа гарлаа.");
          setHasPermission(false);
        }
      } else if (selectedComponent?.by_who === "examiner") {
        try {
          const res = await api.post("/assigned-grading/check-assignment", {
            grading_component_id: selectedComponent.id,
            student_id: Studentid,
            assigned_by_id: user.id,
            assigned_by_type: "teacher",
          });

          setHasPermission(res.data.match);
          if (!res.data.match) {
            toast.error(
              "Та энэ оюутныг үнэлэх эрхгүй байна. Та энэ хороонд хамаарахгүй байна."
            );
          }
        } catch (e) {
          toast.error("Шалгах явцад алдаа гарлаа.");
          setHasPermission(false);
        }
      }
    };

    checkPermission();
  }, [selectedComponent, user]);

  const handleScoreSubmit = async () => {
    try {
      setloadingSend(true);
      if (selectedComponent.by_who !== "committee") {
        await api.post("/scores", {
          student_id: Studentid,
          thesis_id: thesisId,
          given_by_id: user.id,
          given_by_type: "teacher",
          component_id: selectedComponent.id,
          score: scoreValue,
        });
      }

      toast.success("Амжилттай оноо өглөө!");

      form.resetFields();
      if (selectedComponent) {
        const matched = scores?.find(
          (s) => s.component?.id === selectedComponent.id
        );
        setScoreValue(matched?.score ?? 0);
      }

      onSuccess?.();
    } catch (error) {
      toast.error("Алдаа гарлаа: " + error.message);
    } finally {
      setloadingSend(false);
    }
  };
  const existingScore = scores?.find(
    (s) => s.component?.id === selectedComponent?.id
  );

  return (
    <Card title="Үнэлгээ өгөх" className="mb-4">
      {loading ? (
        <Spin />
      ) : (
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Үнэлгээний компонент" required>
                <Select
                  placeholder="Компонент сонгох"
                  value={selectedComponent?.id}
                  onChange={(id) => {
                    const selected = gradingSchema?.grading_components?.find(
                      (c) => c.id === id
                    );
                    setSelectedComponent(selected);

                    const matched = scores?.find((s) => s.component?.id === id);
                    setScoreValue(matched?.score ?? 0);

                    // also reset the form value
                    form.setFieldsValue({ score: matched?.score ?? 0 });
                  }}
                  options={
                    gradingSchema?.grading_components?.map((component) => ({
                      label: component.name,
                      value: component.id,
                    })) || []
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Боломжит Оноо">
                {selectedComponent?.score ?? "—"}
              </Form.Item>
            </Col>
            {hasPermission && (
              <Col span={12}>
                <Form.Item
                  label="Оноо"
                  name="score"
                  rules={[
                    {
                      required: true,
                      message: "Оноо оруулна уу!",
                      type: "number",
                    },
                    { min: 0, max: 100 },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    value={scoreValue}
                    disabled={!editMode}
                    onChange={(value) => setScoreValue(value)}
                  />
                </Form.Item>
                <Row gutter={16} justify="start">
                  <Col>
                    <Button
                      type="default"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode
                        ? "Болих"
                        : existingScore
                        ? "Засах"
                        : "Оноо өгөх"}
                    </Button>
                  </Col>
                  {editMode && (
                    <Col>
                      <Button
                        type="primary"
                        onClick={handleScoreSubmit}
                        loading={loadingSend}
                      >
                        Хадгалах
                      </Button>
                    </Col>
                  )}
                </Row>
              </Col>
            )}
            {!hasPermission && <Col>Оноо өгөх эрх үүсээгүй байна.</Col>}
          </Row>
        </Form>
      )}
    </Card>
  );
};

export default ScoreForm;
