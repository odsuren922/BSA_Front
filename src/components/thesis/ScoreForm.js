import React, { useState, useEffect } from "react";
import { Button, Typography, Alert,Card, Col, Form, InputNumber, Row, Select, Spin } from "antd";
import { toast } from "react-toastify";
import api from "../../context/api_helper";
import { useUser } from "../../context/UserContext";
import 'dayjs/locale/mn';

import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('mn');
dayjs.extend(utc);
dayjs.extend(timezone);
const { Text } = Typography;
const ScoreForm = ({
    thesisId,
    gradingSchema,
    onSuccess,
    Supervisorid,
    Studentid,
    thesisCycleId,
    scores,
    loading,
    deadloading,
    componentsDeadlines
}) => {
    const [form] = Form.useForm();
    const [loadingSend, setloadingSend] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [scoreValue, setScoreValue] = useState(0);
    const { user } = useUser();
    const [hasPermission, setHasPermission] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [committeeData, setCommitteeDate] = useState([]);
    const [permissionLoading, setPermissionLoading] = useState(false);

const [currentDeadline, setCurrentDeadline] = useState(null);

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
                // setHasPermission(false);
                try {
                    setPermissionLoading(true);
                    const res = await api.post("/committees/check-assignment", {
                        thesis_cycle_id: thesisCycleId,
                        grading_component_id: selectedComponent.id,
                        student_id: Studentid,
                        teacher_id: user.id,
                    });
                    console.log("data", res.data);

                    setHasPermission(res.data.match);

                    if (!res.data.match) {
                        toast.error(
                            "Та энэ оюутныг үнэлэх эрхгүй байна. Та энэ хороонд хамаарахгүй байна."
                        );
                    }
                    setCommitteeDate(res.data);

                    if (res.data.score) {
                        const apiScore = res.data.score.score;
                        setScoreValue(apiScore);
                        form.setFieldsValue({ score: apiScore });
                    } else {
                        setScoreValue(0);
                        form.setFieldsValue({ score: 0 });
                    }
                } catch (e) {
                    toast.error("Шалгах явцад алдаа гарлаа.");
                    setHasPermission(false);
                    setPermissionLoading(false);
                } finally {
                    setPermissionLoading(false);
                }
            } else if (selectedComponent?.by_who === "examiner") {
                try {
                    const res = await api.post(
                        "/assigned-grading/check-assignment",
                        {
                            grading_component_id: selectedComponent.id,
                            student_id: Studentid,
                            assigned_by_id: user.id,
                            assigned_by_type: "teacher",
                        }
                    );

                    setHasPermission(res.data.match);
                    if (!res.data.match) {
                        toast.error(
                            "Оноо өгөх эрх үүсээгүй байна."
                        );
                    }
                } catch (e) {
                    toast.error("Шалгах явцад алдаа гарлаа.");
                } finally {
                }
            }
        };

        checkPermission();
    }, [selectedComponent, user]);
    useEffect(() => {
        if (!selectedComponent?.id || componentsDeadlines.length === 0) {
          setCurrentDeadline(null);
          return;
        }
      
        const deadline = componentsDeadlines.find(
          (d) =>
            d.related_type === "App\\Models\\GradingComponent" &&
            d.related_id === selectedComponent.id
        );
      
        setCurrentDeadline(deadline || null);
      }, [selectedComponent, componentsDeadlines]);
      
      
      
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
            } else {
                console.log({
                    student_id: Studentid,
                    thesis_id: thesisId,
                    committee_member_id: committeeData.committee_member_id,
                    component_id: selectedComponent.id,
                    score: scoreValue,
                });

                await api.post("/committee-scores", {
                    student_id: Studentid,
                    thesis_id: thesisId,
                    committee_member_id: committeeData.committee_member_id,
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
            {loading ||deadloading ? (
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
                          form.setFieldsValue({ score: matched?.score ?? 0 });
                        }}
                        options={
                          gradingSchema?.grading_components
                            ?.filter((component) => component.by_who !== "committee")
                            .map((component) => ({
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
                </Row>
              
                {currentDeadline && (
                  <Row style={{ marginBottom: 12 }}>
                    <Col span={24}>
                    <Text strong style={{ fontSize: 17}}>
                      {dayjs().isAfter(dayjs.utc(currentDeadline.end_date)) ? (
                        <Alert
                          type="error"
                          showIcon
                          message={`Энэ бүрэлдэхүүнд үнэлгээ өгөх хугацаа дууссан: ${dayjs
                            .utc(currentDeadline.end_date)
                            .tz("Asia/Ulaanbaatar")
                            .format("YYYY-MM-DD HH:mm")}`}
                        />
                        
                      ) : (
                        <Alert
                          type="info"
                          showIcon
                          message={
                            <>
                              📆 Үнэлгээний хугацаа:{" "}
                              {dayjs
                                .utc(currentDeadline.start_date)
                                .tz("Asia/Ulaanbaatar")
                                .format("YYYY-MM-DD HH:mm")}{" "}
                              →{" "}
                              {dayjs
                                .utc(currentDeadline.end_date)
                                .tz("Asia/Ulaanbaatar")
                                .format("YYYY-MM-DD HH:mm")}
                            </>
                          }
                        />
                      )}

</Text>
                    </Col>
                  </Row>
                )}
              
                {/* Оноо оруулах хэсэг */}
                <Row gutter={16}>
                  {permissionLoading ? (
                    <Col>
                      <Spin />
                    </Col>
                  ) : hasPermission ? (
                    <Col span={12}>
                      <Form.Item label="Оноо" name="score">
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
                            disabled={
                                currentDeadline &&
                                dayjs().isAfter(dayjs.utc(currentDeadline.end_date))
                              }
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
                  ) : (
                    <Col>Оноо өгөх эрх үүсээгүй байна.</Col>
                  )}
                </Row>
              </Form>
              
            )}
        </Card>
    );
};

export default ScoreForm;
