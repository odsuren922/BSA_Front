import React, { useState } from "react";
import {
    Card,
    Collapse,
    Row,
    Col,
    DatePicker,
    Form,
    Input,
    Select,
    Button,
    TimePicker,
    message,
    ConfigProvider,
    Space,
    Typography,
    Modal,
    InputNumber
} from "antd";
import {
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    DeleteOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import mnMN from "antd/es/locale/mn_MN";
import dayjs from "dayjs";
import "dayjs/locale/mn";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import api from "../../context/api_helper";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale("mn");

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const CycleStep2_ComponentsAndReminders = ({
    selectedSchema,
    cycle,
    componentDeadlines,
    setComponentDeadlines,
    componentReminders,
    setComponentReminders,
}) => {
    const [editMode, setEditMode] = useState(false);
    const [editReminderMode, setEditReminderMode] = useState({});
    const[chooseDay, setChooseDay] =useState(false)

    const handleDeadlineChange = (idx, field, value) => {
        const updated = [...componentDeadlines];
        updated[idx][field] = value;
        setComponentDeadlines(updated);
    };
  

    const saveDeadlineComponent = async (comp, idx) => {
        try {
         
            // if (!comp) {
            //     message.error("Холбогдох огноо олдсонгүй");
            //     return;
            // }

            setEditMode(false);
            console.log('related_id',comp)

            const startDateTime = componentDeadlines[idx].start_date
            .hour(componentDeadlines[idx].start_time?.hour() || 0)
            .minute(componentDeadlines[idx].start_time?.minute() || 0)
            .second(0);
          
          const endDateTime = componentDeadlines[idx].end_date
            .hour(componentDeadlines[idx].end_time?.hour() || 0)
            .minute(componentDeadlines[idx].end_time?.minute() || 0)
            .second(0);
            console.log('startDateTime', startDateTime.toISOString())

          
          await api.post("/thesiscycle/component/deadline", {
            thesis_cycle_id: cycle.id,
            related_id: comp.id,
            start_date: startDateTime.toISOString(),
            end_date: endDateTime.toISOString(),
            type: "grading_component",
          });
          

            message.success("Огноо амжилттай хадгалагдлаа");
        } catch (error) {
            message.error("Хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
            console.error(error);
        }
    };
    const handleSaveReminder = async (compId, index) => {
        const reminderKey = `${compId}_${index}`;
        const reminder = componentReminders[compId][index];
        const hasId = !!reminder.id;
      
        const payload = {
          thesis_cycle_id: cycle.id,
          component_id: compId,
          title: reminder.title,
          description: reminder.description,
          target_type: reminder.target || "all",
          send_schedules: (reminder.send_schedules || [])
            .filter(s => s.date && s.time)
            .map(s => {
              const fullDatetime = s.date
                .hour(s.time.hour())
                .minute(s.time.minute())
                .second(0);
              return { datetime: fullDatetime.toISOString() };
            }),
        };
      console.log("reminder", payload);
        try {
          if (hasId) {
            await api.patch(`/thesiscycle/reminder/${reminder.id}`, payload);
          } else {
            await api.post(`/thesiscycle/reminder/save`, payload);
          }
      
          message.success("Мэдэгдэл амжилттай хадгалагдлаа");
      
          setEditReminderMode(prev => ({
            ...prev,
            [reminderKey]: false,
          }));
        } catch (error) {
          console.error("Reminder save error:", error.response?.data || error);
          message.error("Хадгалахад алдаа гарлаа");
        }
      };
      
    const handleDeleteReminder = async (compId, index) => {
        const reminderKey = `${compId}_${index}`;
        const reminder = componentReminders[compId][index];
      console.log(reminder)
        if (reminder?.id) {
          try {
            await api.delete(`/thesiscycle/reminder/${reminder.id}`);
            message.success("Мэдэгдэл устгагдлаа");
          } catch (error) {
            console.error("Delete error:", error.response?.data || error);
            message.error("Устгах үед алдаа гарлаа");
            return;
          }
        }
      
        // Remove from local state
        const updated = (componentReminders[compId] || []).filter((_, j) => j !== index);
        setComponentReminders((prev) => ({
          ...prev,
          [compId]: updated,
        }));
      
        // Clear edit mode for this reminder
        setEditReminderMode((prev) => {
          const copy = { ...prev };
          delete copy[reminderKey];
          return copy;
        });
      };

      const calculateDaysBefore = (scheduleDate, deadlineDate) => {
        if (!scheduleDate || !deadlineDate) return null;
        return dayjs(deadlineDate).diff(dayjs(scheduleDate), "day");
      };

    return (
        <ConfigProvider locale={mnMN}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Title level={4} style={{ marginBottom: 24 }}>
                    {selectedSchema.name} ({selectedSchema.year})
                </Title>

                <Collapse accordion bordered={false} expandIconPosition="end">
                    {selectedSchema.grading_components.map((comp, idx) => (
                        <Panel
                            key={comp.id}
                            header={
                                <Text strong>
                                    {comp.name} ({comp.score} оноо{" "}
                                    {comp.scheduled_week}-р долоо хоног)
                                </Text>
                            }
                            style={{
                                marginBottom: 16,
                                border: "1px solid #f0f0f0",
                            }}
                        >
                            {/* Deadline Section */}
                            <Card
                                title="Эцсийн хугацаа"
                                size="small"
                                bordered={false}
                                headStyle={{ backgroundColor: "#fafafa" }}
                            >
                                <Row gutter={16} align="middle">
                                <Row gutter={16} align="middle">
  <Col xs={12}>
    <Form.Item label="Эхлэх өдөр">
      {editMode ? (
        <DatePicker
          style={{ width: "100%" }}
          format="YYYY-MM-DD dddd"
          value={
            componentDeadlines.find((d) => d.related_id === comp.id)?.start_date || null
          }
          onChange={(v) =>
            handleDeadlineChange(idx, "start_date", v)
          }
        />
      ) : (
        <div className="ant-input-disabled">
          {componentDeadlines[idx]?.start_date?.format("YYYY-MM-DD (dddd)") || "-"}
        </div>
      )}
    </Form.Item>
  </Col>
  <Col xs={12}>
    <Form.Item label="Эхлэх цаг">
      {editMode ? (
        <TimePicker
          style={{ width: "100%" }}
          format="HH:mm"

          value={
            componentDeadlines.find((d) => d.related_id === comp.id)?.start_time || null
          }
          onChange={(v) =>
            handleDeadlineChange(idx, "start_time", v)
          }
        />
      ) : (
        <div className="ant-input-disabled">
          {componentDeadlines[idx]?.start_time?.format("HH:mm") || "-"}
        </div>
      )}
    </Form.Item>
  </Col>
</Row>

<Row gutter={16}>
  <Col xs={12}>
    <Form.Item label="Дуусах өдөр">
      {editMode ? (
        <DatePicker
          style={{ width: "100%" }}
          format="YYYY-MM-DD dddd"

          value={
            componentDeadlines.find((d) => d.related_id === comp.id)?.end_date || null
          }
          onChange={(v) =>
            handleDeadlineChange(idx, "end_date", v)
          }
        />
      ) : (
        <div className="ant-input-disabled">
          {componentDeadlines[idx]?.end_date?.format("YYYY-MM-DD (dddd)") || "-"}
        </div>
      )}
    </Form.Item>
  </Col>
  <Col xs={12}>
    <Form.Item label="Дуусах цаг">
      {editMode ? (
        <TimePicker
          style={{ width: "100%" }}
          format="HH:mm"

          value={
            componentDeadlines.find((d) => d.related_id === comp.id)?.end_time || null
          }
          onChange={(v) =>
            handleDeadlineChange(idx, "end_time", v)
          }
        />
      ) : (
        <div className="ant-input-disabled">
          {componentDeadlines[idx]?.end_time?.format("HH:mm") || "-"}
        </div>
      )}
    </Form.Item>
  </Col>
</Row>

                                    <Col
                                        xs={24}
                                        md={8}
                                        style={{ textAlign: "right" }}
                                    >
                                        {editMode ? (
                                            <Space>
                                                <Button
                                                    icon={<CloseOutlined />}
                                                    onClick={() =>
                                                        setEditMode(false)
                                                    }
                                                >
                                                    Цуцлах
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    icon={<SaveOutlined />}
                                                    onClick={() =>
                                                        saveDeadlineComponent(
                                                            comp,
                                                            idx
                                                        )
                                                    }
                                                >
                                                    Хадгалах
                                                </Button>
                                            </Space>
                                        ) : (
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                onClick={() =>
                                                    setEditMode(true)
                                                }
                                            >
                                                Засах
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            </Card>

                            {/* Reminders Section */}
                            <Card
                                title="Мэдэгдэлүүд"
                                size="small"
                                bordered={false}
                                headStyle={{ backgroundColor: "#fafafa" }}
                                style={{ marginTop: 16 }}
                            >
                                {(componentReminders[comp.id] || []).map(
                                    (rem, i) => {
                                        const reminderKey = `${comp.id}_${i}`;
                                        const isEditing =
                                            editReminderMode[reminderKey];

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
                                                        icon={
                                                            <DeleteOutlined />
                                                        }
                                                        onClick={() =>
                                                            Modal.confirm({
                                                                title: "Та энэ мэдэгдлийг устгахдаа итгэлтэй байна уу?",
                                                                content:
                                                                    "Устгасан мэдэгдлийг сэргээх боломжгүй.",
                                                                okText: "Тийм",
                                                                cancelText:
                                                                    "Үгүй",
                                                                okType: "danger",
                                                                onOk: () =>
                                                                    handleDeleteReminder(
                                                                        comp.id,
                                                                        i
                                                                    ),
                                                            })
                                                        }
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
              const updated = [...(componentReminders[comp.id] || [])];
              updated[i].title = e.target.value;
              setComponentReminders((prev) => ({
                ...prev,
                [comp.id]: updated,
              }));
            }}
          />
                </Form.Item>
        ) : (
          <Text strong style={{ fontSize: 16 }}>{rem.title || "-"}</Text>
        )}

    </Col>

    <Col span={24}>

        {isEditing ? (
              <Form.Item label="Тайлбар">
          <Input.TextArea
            rows={2}
            value={rem.description}
            onChange={(e) => {
              const updated = [...(componentReminders[comp.id] || [])];
              updated[i].description = e.target.value;
              setComponentReminders((prev) => ({
                ...prev,
                [comp.id]: updated,
              }));
            }}
          />
                </Form.Item>
        ) : (
          <Text type="secondary" style={{ fontSize: 15, fontWeight: 500, whiteSpace: "pre-line" }}>
            {rem.description || "Тайлбар байхгүй"}
          </Text>
        )}

    </Col>

    {isEditing ? (
  <>
    <Col span={24}>
      <Form.Item label="Илгээх цагийн хуваарь" required>
        {(rem.send_schedules || []).map((schedule, k) => (
          <Space key={k} style={{ marginBottom: 8 }}>
            <DatePicker
              value={schedule.date}
              onChange={(date) => {
                const updated = [...(componentReminders[comp.id] || [])];
                updated[i].send_schedules[k].date = date;
                setComponentReminders((prev) => ({
                  ...prev,
                  [comp.id]: updated,
                }));
              }}
            />


{/* <Space direction="vertical" size="small">
  <InputNumber
    min={0}
    max={30}
    addonAfter="хоногийн өмнө"
    // value ={schedule.date}
    value={calculateDaysBefore(schedule.date, componentDeadlines[idx]?.start_date)}

    onChange={(val) => {
      const updated = [...(componentReminders[comp.id] || [])];
      const deadline = componentDeadlines[idx]?.start_date; // or start_date
      const calculatedDate = deadline
        ? deadline.clone().subtract(val, "day")
        : null;

      updated[i].send_schedules[k].daysBefore = val;
      updated[i].send_schedules[k].date = calculatedDate;

      setComponentReminders((prev) => ({
        ...prev,
        [comp.id]: updated,
      }));
    }}
  />
  {schedule.date && (
    <Text type="secondary">
      Илгээх огноо: {schedule.date.format("YYYY-MM-DD (dddd)")}
    </Text>
  )}
</Space> */}


            <TimePicker
              value={schedule.time}
              format="HH:mm"
              minuteStep={5}
              onChange={(time) => {
                const updated = [...(componentReminders[comp.id] || [])];
                updated[i].send_schedules[k].time = time;
                setComponentReminders((prev) => ({
                  ...prev,
                  [comp.id]: updated,
                }));
              }}
            />
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => {
                const updated = [...(componentReminders[comp.id] || [])];
                updated[i].send_schedules.splice(k, 1);
                setComponentReminders((prev) => ({
                  ...prev,
                  [comp.id]: updated,
                }));
              }}
            />
          </Space>
        ))}
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => {
            const updated = [...(componentReminders[comp.id] || [])];
            updated[i].send_schedules = [
              ...(updated[i].send_schedules || []),
              { date: null, time: null },
            ];
            setComponentReminders((prev) => ({
              ...prev,
              [comp.id]: updated,
            }));
          }}
        >
          Цаг нэмэх
        </Button>
      </Form.Item>
    </Col>

    <Col span={24}>
      <Form.Item label="Хэнд илгээх" required>
        <Select
          value={rem.target || "all"}
          onChange={(val) => {
            const updated = [...(componentReminders[comp.id] || [])];
            updated[i].target = val;
            setComponentReminders((prev) => ({
              ...prev,
              [comp.id]: updated,
            }));
          }}
        >
          <Option value="all">Бүгдэд</Option>
          <Option value="student">Оюутанд</Option>
          <Option value="teacher">Багшид</Option>
        </Select>
      </Form.Item>
    </Col>
  </>
) : (
  <>
    <Col span={24}>
      <Text strong>Илгээх цагийн хуваарь:</Text>
      <ul style={{ marginTop: 8, marginBottom: 16, paddingLeft: 20 }}>
        {(rem.send_schedules || []).map((s, k) => (
          <li key={k}>
        {s.date?.format("YYYY-MM-DD")} {s.time?.format("HH:mm")}
          </li>
        ))}
        {(!rem.send_schedules || rem.send_schedules.length === 0) && (
          <Text type="secondary">Хуваарь байхгүй</Text>
        )}
      </ul>
    </Col>
    <Col span={24}>
      <Text strong>Хэнд илгээх:</Text>{" "}
      <Text style={{ marginLeft: 8 }}>
        {{
          all: "Бүгдэд",
          student: "Оюутанд",
          teacher: "Багшид",
        }[rem.target || "all"]}
      </Text>
    </Col>
  </>
)}

                                                    </Row>

                                                    <div
                                                        style={{
                                                            textAlign: "right",
                                                            marginTop: 16,
                                                        }}
                                                    >
                                                        {isEditing ? (
                                                            <Space>
                                                                <Button
                                                                    onClick={() =>
                                                                        setEditReminderMode(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                [reminderKey]: false,
                                                                            })
                                                                        )
                                                                    }
                                                                >
                                                                    Цуцлах
                                                                </Button>
                                                                <Button
                                                                    type="primary"
                                                                    icon={
                                                                        <SaveOutlined />
                                                                    }
                                                                    onClick={() =>
                                                                        handleSaveReminder(
                                                                            comp.id,
                                                                            i
                                                                        )
                                                                    }
                                                                >
                                                                    Хадгалах
                                                                </Button>
                                                            </Space>
                                                        ) : (
                                                            <Button
                                                                icon={
                                                                    <EditOutlined />
                                                                }
                                                                onClick={() =>
                                                                    setEditReminderMode(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            [reminderKey]: true,
                                                                        })
                                                                    )
                                                                }
                                                            >
                                                                Засах
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Form>
                                            </Card>
                                        );
                                    }
                                )}

                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    block
                                    onClick={() => {
                                        const updated = [
                                            ...(componentReminders[comp.id] ||
                                                []),
                                            {
                                                title: "",
                                                description: "",
                                                send_schedules: [],
                                                target: "all",
                                            },
                                        ];
                                        setComponentReminders((prev) => ({
                                            ...prev,
                                            [comp.id]: updated,
                                        }));
                                    }}
                                    style={{ marginTop: 16 }}
                                >
                                    Шинэ мэдэгдэл нэмэх
                                </Button>
                            </Card>
                        </Panel>
                    ))}
                </Collapse>
            </div>
        </ConfigProvider>
    );
};

export default CycleStep2_ComponentsAndReminders;
