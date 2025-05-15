import React, { useState, useEffect } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Modal,
    Form,
    InputNumber,
    List,
    Tag,
    Alert,
    Statistic,
    Typography,
    Avatar,
    Table,
    Collapse,
    Spin,
    Input,
    Radio,
    Select,
    message,
    Skeleton
} from "antd";
import {
    CalculatorOutlined,
    UserOutlined,
} from "@ant-design/icons";
import CommitteeCalculator from "../../../components/committee/CommitteeCalculator";
import api from "../../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentCount from "../../../components/Common/StudentCount";
import CommitteeMemberItem from "../../../components/committee/CommitteeMemberList";
import CommitteeScoreModal from "../../../components/committee/CommitteScoreSaveModal";
import TeacherStudentConfirmModal from "../../../components/committee/TeacherStudentConfirmModal";
import CommitteeDisplay from "../../../components/committee/CommitteeDisplay";
const { Title, Text } = Typography;
const { Panel } = Collapse;
const CommitteeManagement = ({
    cycleId,
    componentId,
    committees,
    setCommittees,
    user,
    fetchDatacom,
    loadingData,
}) => {
    const gradingComponent = committees.grading_component;
    const [showCalculator, setShowCalculator] = useState(false);
    const [studentCounts, setStudentCounts] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [customTeacherCount, setCustomTeacherCount] = useState(0);
    const [customStudentCount, setCustomStudentCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingCommittees, setLoadingCommittees] = useState(false);
    const [scoreForm] = Form.useForm();
    const [addOutsiderModalVisible, setAddOutsiderModalVisible] =
        useState(false);
    const [currentCommittee, setCurrentCommittee] = useState(null);
    const [outsiderForm] = Form.useForm();
    const [isCreatingNew, setIsCreatingNew] = useState(true);
    const [existingReviewers, setExistingReviewers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [counts, externalScore] = await Promise.all([
                api.get(`/thesis-cycles/${cycleId}/counts`),
            ]);

            setCustomTeacherCount(counts.data.teacher_count);
            setCustomStudentCount(
                counts.data.program_counts.reduce(
                    (sum, item) => sum + item.student_count,
                    0
                )
            );
            setStudentCounts(counts.data.program_counts);
        } catch (error) {
            console.error("Error initializing data:", error);
        } finally {
            setLoading(false);
        }
    };

    const roleColorMap = {
        member: "blue",
        secretary: "orange",
        leader: "red",
        external: "orange",
    };

    const getCommitteeColor = () => {
        const softColors = [
            "rgba(245, 34, 45, 0.15)", // red
            "rgba(250, 173, 20, 0.15)", // gold
            "rgba(19, 194, 194, 0.15)", // cyan
            "rgba(82, 196, 26, 0.15)", // green
            "rgba(250, 84, 28, 0.15)", // volcano
            // "rgba(47, 84, 235, 0.15)",    // blue
            "rgba(114, 46, 209, 0.15)", // purple
            "rgba(255, 215, 0, 0.15)", // yellow/gold
            "rgba(0, 0, 0, 0.05)", // light gray
            "rgba(24, 144, 255, 0.15)", // geekblue
            "rgba(255, 192, 203, 0.15)", // pink
        ];

        const index = Math.floor(Math.random() * softColors.length);
        return softColors[index];
    };

    const handleCreateCommittees = async (numCommittees) => {
        setLoadingCommittees(true);
        const length = committees.length;

        const newcommittees = Array.from({ length: numCommittees }, (_, i) => ({
            name: `Комисс ${i + length + 1}`,
            dep_id: user.dep_id,
            grading_component_id: componentId,
            thesis_cycle_id: cycleId,
            color: getCommitteeColor(),
        }));

        try {
            const responses = await Promise.all(
                newcommittees.map((c) => api.post("/committees", c))
            );
console.log("responses", responses);
            const savedCommittees = responses.map((res) => ({
                ...res.data.data,
                members: [],
                students: [],
                externalReviewers: [],
            }));

            setCommittees([...committees, ...savedCommittees]);

            toast.success("Комиссууд амжилттай үүсгэгдлээ");
        } catch (err) {
            toast.error("Үүсгэхэд алдаа гарлаа");
            console.error(err);
        } finally {
            setLoadingCommittees(false);
        }
    };

    const isCommitteeFinalized = (committee, componentId) => {
        if (!committee?.scores || committee.scores.length === 0) return false;

        const graders = committee?.members || [];
        const students = committee?.students || [];
        const externalReviewers = committee?.externalReviewers || [];

        return students.every((student) => {
            const studentId = student.student?.id;

            // Find saved final score from `committee.scores`
            const finalScoreObj = committee.scores.find(
                (s) =>
                    s.student_id === studentId &&
                    s.component_id === componentId &&
                    s.given_by_type === "App\\Models\\Committee" &&
                    s.given_by_id === committee.id
            );

            // Teacher (committee member) scores
            const teacherScores = graders
                .map(
                    (grader) =>
                        grader.committeeScores?.find(
                            (cs) =>
                                cs.student?.id === studentId &&
                                cs.component_id === componentId
                        )?.score
                )
                .filter((s) => s !== undefined && !isNaN(parseFloat(s)))
                .map((s) => parseFloat(s));

            // External reviewer scores
            const externalScores = externalReviewers
                .flatMap((rev) => rev?.scores || [])
                .filter(
                    (s) =>
                        s.student_id === studentId &&
                        (s.component_id === componentId ||
                            s.grading_component_id === componentId)
                )
                .map((s) => parseFloat(s.score))
                .filter((s) => !isNaN(s));

            // Combine scores
            const allScores = [...teacherScores, ...externalScores];

            // Calculate average
            const avg =
                allScores.length > 0
                    ? parseFloat(
                          (
                              allScores.reduce((sum, s) => sum + s, 0) /
                              allScores.length
                          ).toFixed(2)
                      )
                    : null;

            // Final check: must have saved score, and it must match avg
            return (
                finalScoreObj &&
                avg !== null &&
                parseFloat(finalScoreObj.score) === avg
            );
        });
    };

    const handleAddOutsider = async (committee) => {
        setCurrentCommittee(committee);
        setAddOutsiderModalVisible(true);
        setIsCreatingNew(true);
        try {
            const res = await api.get("/external-reviewers");

            const fetchedReviewers = res.data?.data || [];
            setExistingReviewers(fetchedReviewers);
        } catch (err) {
            toast.error("Гадны үнэлгээч авахад алдаа гарлаа");
        }
    };

    const handleSubmitOutsider = async (values) => {
        try {
            const payload = {
                ...values,
                committee_id: currentCommittee.id,
            };
            // console.log("payload", payload);
            const res = await api.post(`/external-reviewers`, payload);
            const reviewer = res.data.data;

            setCommittees((prev) =>
                prev.map((c) => {
                    if (c.id === currentCommittee.id) {
                        return {
                            ...c,
                            externalReviewers: [
                                ...(c.externalReviewers || []),
                                reviewer,
                            ],
                        };
                    }
                    return c;
                })
            );

            toast.success("Гадны үнэлгээч амжилттай нэмэгдлээ");
            setAddOutsiderModalVisible(false);
            outsiderForm.resetFields();
        } catch (error) {
            toast.error("Алдаа гарлаа");
            console.error(error);
        }
    };

    const handleDeleteExternal = async (member) => {
        try {
            const committeeId = member.committee_id;
            await api.delete(`/external-reviewers/${member.id}`);
            setCommittees((prev) =>
                prev.map((committee) => {
                    if (committee.id === committeeId) {
                        return {
                            ...committee,
                            externalReviewers:
                                committee.externalReviewers.filter(
                                    (m) => m.id !== member.id
                                ),
                        };
                    }
                    return committee;
                })
            );
            toast.success("Гишүүнийг амжилттай хаслаа");
        } catch (error) {
            message.error("Гишүүн хасах үед алдаа гарлаа");
        }
    };

    const renderCommitteeStudentPrograms = (committee) => {
        const programCounts = {};
        const programColors = {
            CS: "geekblue",
            IT: "green",
            SE: "volcano",
            Тодорхойгүй: "default",
        };

        committee.students?.forEach((s) => {
            const program = s.student?.program || "Тодорхойгүй";
            programCounts[program] = (programCounts[program] || 0) + 1;
        });

        return Object.entries(programCounts).map(([program, count]) => (
            <Tag color={programColors[program]} key={program}>
                {count} {program}
            </Tag>
        ));
    };

    return (
        <div style={{ padding: "24px" }}>
            <Row gutter={[16, 16]} className="mb-4">
                <StudentCount studentCounts={studentCounts} />

                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card hoverable>
                        <Statistic
                            title="Нийт багшийн тоо"
                            value={customTeacherCount}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row justify="space-between" align="middle" className="mb-4">
                <Col>
                    <Title level={4} style={{ marginBottom: 0 }}>
                        Комиссын жагсаалт
                    </Title>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<CalculatorOutlined />}
                        onClick={() => setShowConfirmModal(true)}
                    >
                        Комисс тооцоолох
                    </Button>
                </Col>
            </Row>
            {loading || loadingData ? (
     <Skeleton active paragraph={{ rows: 4 }} />

            ) : committees.length === 0 ? (
                <Alert
                    message="Мэдээлэл байхгүй"
                    description="Одоогоор бүртгэлтэй комисс байхгүй байна."
                    type="info"
                    showIcon
                />
            ) : (
                <Collapse
                    accordion
                    style={{
                        background: "#ffffff",
                        borderRadius: 8,
                    }}
                >
                    {committees.map((committee, index) => (
                        <Panel
                            key={committee.id || index}
                            header={
                                <div>
                                    <strong>
                                        {committee.name ||
                                            `Комисс ${index + 1}`}
                                    </strong>{" "}
                                    {isCommitteeFinalized(committee) ? (
                                        <Tag
                                            color="green"
                                            style={{ marginLeft: 8 }}
                                        >
                                            Илгээсэн
                                        </Tag>
                                    ) : (
                                        <Tag
                                            color="red"
                                            style={{ marginLeft: 8 }}
                                        >
                                            Илгээгээгүй
                                        </Tag>
                                    )}
                                </div>
                            }
                        >
                            <CommitteeDisplay
                                committees={committees}
                                committee={committee}
                                setCommittees={setCommittees}
                                index={index}
                                isCommitteeFinalized={isCommitteeFinalized}
                                componentId={componentId}
                                handleDeleteExternal={handleDeleteExternal}
                                handleAddOutsider={handleAddOutsider}
                                renderCommitteeStudentPrograms={
                                    renderCommitteeStudentPrograms
                                }
                            />
                        </Panel>
                    ))}
                </Collapse>
            )}

            <TeacherStudentConfirmModal
                visible={showConfirmModal}
                onCancel={() => setShowConfirmModal(false)}
                onConfirm={() => setShowCalculator(true)}
                customTeacherCount={customTeacherCount}
                setCustomTeacherCount={setCustomTeacherCount}
                customStudentCount={customStudentCount}
                setCustomStudentCount={setCustomStudentCount}
            />

            <CommitteeCalculator
                show={showCalculator}
                visible={showCalculator}
                onClose={() => setShowCalculator(false)}
                availableTeachers={customTeacherCount}
                availableStudents={customStudentCount}
                onCreate={handleCreateCommittees}
                loadingCommittees= {loadingCommittees}
                 setLoadingCommittees = {setLoadingCommittees}
            />

            <Modal
                title="Гадны үнэлгээч нэмэх"
                open={addOutsiderModalVisible}
                onCancel={() => {
                    setAddOutsiderModalVisible(false);
                    outsiderForm.resetFields();
                    setIsCreatingNew(true);
                }}
                onOk={() => outsiderForm.submit()}
            >
                <Form
                    form={outsiderForm}
                    layout="vertical"
                    onFinish={handleSubmitOutsider}
                >
                    <Form.Item label="Сонголт">
                        <Radio.Group
                            onChange={(e) =>
                                setIsCreatingNew(e.target.value === "new")
                            }
                            defaultValue="new"
                        >
                            <Radio value="existing">Бүртгэлтэй үнэлгээч</Radio>
                            <Radio value="new">Шинээр бүртгэх</Radio>
                        </Radio.Group>
                    </Form.Item>

                    {isCreatingNew ? (
                        <>
                            <Form.Item
                                name="firstname"
                                label="Нэр"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="lastname"
                                label="Нэр"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item name="email" label="Имэйл">
                                <Input />
                            </Form.Item>
                            <Form.Item name="phone" label="Утас">
                                <Input />
                            </Form.Item>
                            <Form.Item name="organization" label="Байгууллага">
                                <Input />
                            </Form.Item>
                            <Form.Item name="position" label="Албан тушаал">
                                <Input />
                            </Form.Item>
                        </>
                    ) : (
                        <Form.Item
                            name="existing_id"
                            label="Бүртгэлтэй үнэлгээч сонгох"
                            rules={[{ required: true }]}
                        >
                            <Select placeholder="Сонгоно уу">
                                {existingReviewers.map((r) => (
                                    <Select.Option key={r.id} value={r.id}>
                                        {r.firstname} {r.lastname} —{" "}
                                        {r.organization}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default CommitteeManagement;
