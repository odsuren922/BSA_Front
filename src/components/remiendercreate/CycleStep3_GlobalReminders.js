import React from "react";
import {
    Card,
    Row,
    Col,
    Form,
    Input,
    DatePicker,
    Select,
    Button,
    Typography,
    Modal,
    Space,
    TimePicker,
    message,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../context/api_helper";

const { Option } = Select;
const { Text } = Typography;

const CycleStep3_GlobalReminders = ({
    reminders,
    setReminders,
    editReminderMode,
    setEditReminderMode,
    handleSaveReminder,
}) => {
    const handleDeleteReminder = async (index) => {
        const reminder = reminders[index];
        Modal.confirm({
            title: "Та энэ мэдэгдлийг устгахдаа итгэлтэй байна уу?",
            content: "Устгасан мэдэгдлийг сэргээх боломжгүй.",
            okText: "Тийм",
            cancelText: "Үгүй",
            okType: "danger",
            onOk: async () => {
                if (reminder?.id) {
                    try {
                        await api.delete(
                            `/thesiscycle/reminder/${reminder.id}`
                        );

                        message.success("Мэдэгдэл устгагдлаа");
                    } catch (error) {
                        console.error(
                            "Delete error:",
                            error.response?.data || error
                        );
                        message.error("Устгах үед алдаа гарлаа");
                        return;
                    }
                }
                const updated = reminders.filter((_, i) => i !== index);
                setReminders(updated);
            },
        });
    };

    const calculateDaysBefore = (scheduleDate, deadlineDate) => {
        if (!scheduleDate || !deadlineDate) return null;
        return dayjs(deadlineDate).diff(dayjs(scheduleDate), "day");
    };

    return (
        <Card
            title="Нэмэлт мэдэгдэл"
            size="small"
            bordered={false}
            headStyle={{ backgroundColor: "#fafafa" }}
            style={{ marginTop: 16 }}
        >
            {reminders.map((rem, i) => {
                const reminderKey = `global_${i}`;
                const isEditing = editReminderMode[reminderKey];

                return (
                    <Card
                        key={i}
                        title={`Мэдэгдэл ${i + 1}`}
                        size="small"
                        style={{ marginBottom: 16 }}
                        extra={
                            <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteReminder(i)}
                            />
                        }
                    >
                        <Form layout="vertical">
                            <Row gutter={16}>
                                <Col span={24}>
                                    {isEditing ? (
                                        <Form.Item label="Гарчиг" required>
                                            <Input
                                                value={rem.title}
                                                onChange={(e) => {
                                                    const updated = [
                                                        ...reminders,
                                                    ];
                                                    updated[i].title =
                                                        e.target.value;
                                                    setReminders(updated);
                                                }}
                                            />
                                        </Form.Item>
                                    ) : (
                                        <Text strong style={{ fontSize: 16 }}>
                                            {rem.title || "-"}
                                        </Text>
                                    )}
                                </Col>

                                <Col span={24}>
                                    {isEditing ? (
                                        <Form.Item label="Тайлбар">
                                            <Input.TextArea
                                                rows={2}
                                                value={rem.description}
                                                onChange={(e) => {
                                                    const updated = [
                                                        ...reminders,
                                                    ];
                                                    updated[i].description =
                                                        e.target.value;
                                                    setReminders(updated);
                                                }}
                                            />
                                        </Form.Item>
                                    ) : (
                                        <Text
                                            type="secondary"
                                            style={{ whiteSpace: "pre-line" }}
                                        >
                                            {rem.description ||
                                                "Тайлбар байхгүй"}
                                        </Text>
                                    )}
                                </Col>

                                <Col span={24}>
                                    <Form.Item
                                        label="Илгээх цагийн хуваарь"
                                        required
                                    >
                                        {(rem.send_schedules || []).map(
                                            (schedule, k) => (
                                                <Space
                                                    key={k}
                                                    style={{ marginBottom: 8 }}
                                                >
                                                    <DatePicker
                                                        value={
                                                            schedule.date
                                                                ? dayjs(
                                                                      schedule.date
                                                                  )
                                                                : null
                                                        }
                                                        onChange={(date) => {
                                                            const updated = [
                                                                ...reminders,
                                                            ];
                                                            updated[
                                                                i
                                                            ].send_schedules[
                                                                k
                                                            ].date = date;
                                                            setReminders(
                                                                updated
                                                            );
                                                        }}
                                                    />

                                                    <TimePicker
                                                        value={schedule.time}
                                                        format="HH:mm"
                                                        minuteStep={5}
                                                        onChange={(time) => {
                                                            const updated = [
                                                                ...reminders,
                                                            ];
                                                            updated[
                                                                i
                                                            ].send_schedules[
                                                                k
                                                            ].time = time;
                                                            setReminders(
                                                                updated
                                                            );
                                                        }}
                                                    />

                                                    <Button
                                                        danger
                                                        type="text"
                                                        icon={
                                                            <DeleteOutlined />
                                                        }
                                                        onClick={() => {
                                                            const updated = [
                                                                ...reminders,
                                                            ];
                                                            updated[
                                                                i
                                                            ].send_schedules.splice(
                                                                k,
                                                                1
                                                            );
                                                            setReminders(
                                                                updated
                                                            );
                                                        }}
                                                    />
                                                </Space>
                                            )
                                        )}

                                        <Button
                                            type="dashed"
                                            icon={<PlusOutlined />}
                                            onClick={() => {
                                                const updated = [...reminders];
                                                updated[i].send_schedules = [
                                                    ...(updated[i]
                                                        .send_schedules || []),
                                                    { date: null, time: null },
                                                ];
                                                setReminders(updated);
                                            }}
                                        >
                                            Цаг нэмэх
                                        </Button>
                                    </Form.Item>
                                </Col>

                                <Col span={24}>
                                    {isEditing ? (
                                        <Form.Item label="Хэнд илгээх" required>
                                            <Select
                                                value={rem.target || "all"}
                                                onChange={(val) => {
                                                    const updated = [
                                                        ...reminders,
                                                    ];
                                                    updated[i].target = val;
                                                    setReminders(updated);
                                                }}
                                            >
                                                <Option value="all">
                                                    Бүгдэд
                                                </Option>
                                                <Option value="student">
                                                    Оюутанд
                                                </Option>
                                                <Option value="teacher">
                                                    Багшид
                                                </Option>
                                            </Select>
                                        </Form.Item>
                                    ) : (
                                        <Text>
                                            Хэнд:{" "}
                                            {
                                                {
                                                    all: "Бүгдэд",
                                                    student: "Оюутанд",
                                                    teacher: "Багшид",
                                                }[rem.target || "all"]
                                            }
                                        </Text>
                                    )}
                                </Col>
                            </Row>

                            <div style={{ textAlign: "right", marginTop: 16 }}>
                                {isEditing ? (
                                    <Space>
                                        <Button
                                            onClick={() =>
                                                setEditReminderMode((prev) => ({
                                                    ...prev,
                                                    [reminderKey]: false,
                                                }))
                                            }
                                        >
                                            Цуцлах
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            onClick={() =>
                                                handleSaveReminder(i)
                                            }
                                        >
                                            Хадгалах
                                        </Button>
                                    </Space>
                                ) : (
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() =>
                                            setEditReminderMode((prev) => ({
                                                ...prev,
                                                [reminderKey]: true,
                                            }))
                                        }
                                    >
                                        Засах
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </Card>
                );
            })}

            <Button
                type="dashed"
                icon={<PlusOutlined />}
                block
                onClick={() => {
                    setReminders([
                        ...reminders,
                        {
                            title: "",
                            description: "",
                            date_range: [],
                            target: "all",
                        },
                    ]);
                }}
                style={{ marginTop: 16 }}
            >
                Шинэ мэдэгдэл нэмэх
            </Button>
        </Card>
    );
};

export default CycleStep3_GlobalReminders;
