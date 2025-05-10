import React, { useState } from "react";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    TimePicker,
    Typography,
    Modal,
} from "antd";
import {
    EditOutlined,
    SaveOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { Option } = Select;

const ReminderCard = ({
    comp = null,
    idx = null,
    i,
    rem,
    isEditing,
    reminderKey,
    reminderGroupKey, // could be comp.id or "global"
    componentReminders,
    setComponentReminders,
    editReminderMode,
    setEditReminderMode,
    deadlines = [],
    handleDeleteReminder,
    handleSaveReminder,
    isCycleReminder = false,
}) => {
    const deadline = isCycleReminder ? null : deadlines[idx]?.start_date;
    const [dayType, setDaytype] = useState(false);

    const calculateDaysBefore = (scheduleDate, deadlineDate) => {
        if (!scheduleDate || !deadlineDate) return null;
        return deadlineDate.diff(scheduleDate, "day");
    };
    const handleScheduleChange = (val, field, k) => {
        const existingGroup = componentReminders[reminderGroupKey] || [];
        const updated = [...existingGroup];
      
        // reminder[i] байхгүй бол шинэ үүсгэнэ
        if (!updated[i]) {
          updated[i] = {
            title: "",
            description: "",
            send_schedules: [],
            target: "all",
          };
        }
      
        if (!updated[i].send_schedules[k]) {
          updated[i].send_schedules[k] = { date: null, time: null };
        }
      
        if (field === "daysBefore") {
          const date = deadline ? deadline.clone().subtract(val, "day") : null;
          updated[i].send_schedules[k].date = date;
          updated[i].send_schedules[k].daysBefore = val;
        } else {
          updated[i].send_schedules[k][field] = val;
        }
      
        setComponentReminders((prev) => ({
          ...prev,
          [reminderGroupKey]: updated,
        }));
      };
      
      
      const handleChange = (field, value) => {
        const existingGroup = componentReminders[reminderGroupKey] || [];
        const updated = [...existingGroup];
      
        // Хэрвээ updated[i] байхгүй бол шинэ объект үүсгэнэ
        if (!updated[i]) {
          updated[i] = {
            title: "",
            description: "",
            send_schedules: [],
            target: "all",
          };
        }
      
        updated[i][field] = value;
      
        setComponentReminders((prev) => ({
          ...prev,
          [reminderGroupKey]: updated,
        }));
      };
      
      

    const renderEditFields = () => (
        <>
            <Col span={24}>
                <Form.Item label="Гарчиг" required>
                    <Input value={rem.title} onChange={(e) => handleChange("title", e.target.value)} />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item label="Тайлбар">
                    <Input.TextArea rows={2} value={rem.description} onChange={(e) => handleChange("description", e.target.value)} />
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item label="Илгээх цагийн хуваарь" required>
                    <Button
                        style={{ marginBottom: 10 }}
                        onClick={() => setDaytype(!dayType)}
                    >
                        {dayType ? `өдрөөр` : `тоогоор`}
                    </Button>

                    {(rem.send_schedules || []).map((schedule, k) => (
                        <Space key={k} style={{ marginBottom: 8 }}>
                            {dayType ? (
                                <DatePicker
                                    value={schedule.date}
                                    onChange={(date) => handleScheduleChange(date, "date", k)}
                                />
                            ) : (
                                <Space direction="vertical" size="small">
                                    <InputNumber
                                        min={0}
                                        max={30}
                                        addonAfter="хоногийн өмнө"
                                        value={calculateDaysBefore(schedule.date, deadline)}
                                        onChange={(val) => handleScheduleChange(val, "daysBefore", k)}
                                    />
                                    <Text type="secondary">
                                        Илгээх огноо: {schedule.date?.format("YYYY-MM-DD (dddd)")}
                                    </Text>
                                </Space>
                            )}
                            <TimePicker
                                value={schedule.time}
                                format="HH:mm"
                                minuteStep={5}
                                onChange={(time) => handleScheduleChange(time, "time", k)}
                            />
                            <Button
                                danger
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    const updated = [...(componentReminders[reminderGroupKey] || [])];
                                    updated[i].send_schedules.splice(k, 1);
                                    setComponentReminders((prev) => ({
                                        ...prev,
                                        [reminderGroupKey]: updated,
                                    }));
                                }}
                            />
                        </Space>
                    ))}

                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            const updated = [...(componentReminders[reminderGroupKey] || [])];
                            updated[i].send_schedules.push({ date: null, time: null });
                            setComponentReminders((prev) => ({
                                ...prev,
                                [reminderGroupKey]: updated,
                            }));
                        }}
                    >
                        Цаг нэмэх
                    </Button>
                </Form.Item>
            </Col>

            <Col span={24}>
                <Form.Item label="Хэнд илгээх" required>
                    <Select value={rem.target || "all"} onChange={(val) => handleChange("target", val)}>
                        <Option value="all">Бүгдэд</Option>
                        <Option value="student">Оюутанд</Option>
                        <Option value="teacher">Багшид</Option>
                    </Select>
                </Form.Item>
            </Col>
        </>
    );

    const renderReadOnlyFields = () => (
        <>
            <Col span={24}><Text strong>{rem.title || "-"}</Text></Col>
            <Col span={24}><Text type="secondary">{rem.description || "Тайлбар байхгүй"}</Text></Col>
            <Col span={24}>
                <Text strong>Илгээх цагийн хуваарь:</Text>
                <ul>
                    {(rem.send_schedules || []).map((s, k) => (
                        <li key={k}>{s.date?.format("YYYY-MM-DD")} {s.time?.format("HH:mm")}</li>
                    ))}
                    {(!rem.send_schedules || rem.send_schedules.length === 0) && <Text type="secondary">Хуваарь байхгүй</Text>}
                </ul>
            </Col>
            <Col span={24}>
                <Text strong>Хэнд илгээх: </Text>
                <Text style={{ marginLeft: 8 }}>{{ all: "Бүгдэд", student: "Оюутанд", teacher: "Багшид" }[rem.target || "all"]}</Text>
            </Col>
        </>
    );

    return (
        <Card
            title={`Мэдэгдэл ${i + 1}`}
            size="small"
            style={{ marginBottom: 16 }}
            extra={
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                        Modal.confirm({
                            title: "Та энэ мэдэгдлийг устгахдаа итгэлтэй байна уу?",
                            content: "Устгасан мэдэгдлийг сэргээх боломжгүй.",
                            okText: "Тийм",
                            cancelText: "Үгүй",
                            okType: "danger",
                            onOk: () => handleDeleteReminder(reminderGroupKey, i),
                        })
                    }
                />
            }
        >
            <Form layout="vertical">
                <Row gutter={16}>
                    {isEditing ? renderEditFields() : renderReadOnlyFields()}
                    <Col span={24} style={{ textAlign: "right", marginTop: 16 }}>
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
                                    onClick={() => handleSaveReminder(reminderGroupKey, i)}
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
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ReminderCard;
