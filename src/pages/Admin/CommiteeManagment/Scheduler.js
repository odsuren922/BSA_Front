// CommitteeScheduler.js
import React, { useState, useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  Row,
  Col,
  List,
  Typography,
  Card,
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Popover,
  Collapse,
  message
} from "antd";
import api from "../../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

moment.locale("mn");
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const CommitteeScheduler = () => {
  const [committees, setCommittees] = useState([]);
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (selectedEvent) {
      setCalendarDate(new Date(selectedEvent.start));
    }
  }, [selectedEvent]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const committeesData = await api.get(`/committees/active-cycle`);
      setCommittees(committeesData.data.data);
      updateEvents(committeesData.data.data);
    } catch (error) {
      toast.error("Комиссийн мэдээлэл авахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const updateEvents = (committeesData) => {
    const allEvents = committeesData.flatMap((committee) =>
      committee.schedules.map((schedule) => ({
        id: schedule.id,
        title: `${committee.name}: ${schedule.notes || ""}`,
        start: new Date(schedule.start_datetime),
        end: new Date(schedule.end_datetime),
        committee: committee.id,
        location: schedule.location,
        room: schedule.room,
      }))
    );
    setEvents(allEvents);
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      await api.patch(`/schedules/${event.id}`, {
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
      });
      message.success("Хуваарь амжилттай шинэчлэгдлээ");
      fetchData();
    } catch (error) {
      toast.error("Хуваарь шинэчлэхэд алдаа гарлаа");
    }
  };

  const handleAddMeeting = (committee) => {
    setSelectedCommittee(committee);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDeleteMeeting = () => {
    if (!selectedEvent) return;
    Modal.confirm({
      title: "Та энэ уулзалтыг устгахдаа итгэлтэй байна уу?",
      content: `${selectedEvent.title}`,
      okText: "Тийм",
      cancelText: "Үгүй",
      onOk: async () => {
        try {
          await api.delete(
            `/committees/${selectedEvent.committee}/schedules/${selectedEvent.id}`
          );
          message.success("Уулзалт устгагдлаа");
          fetchData();
        } catch (err) {
          toast.error("Устгахад алдаа гарлаа");
        } finally {
          setModalVisible(false);
          setIsEditMode(false);
          form.resetFields();
          setSelectedEvent(null);
        }
      },
    });
  };

  const handleSaveMeeting = async () => {
    try {
      const values = await form.validateFields();

      const startDateTime = moment(values.start_date)
        .set({
          hour: values.start_time.hour(),
          minute: values.start_time.minute(),
        })
        .toISOString();

      const endDateTime = moment(values.end_date)
        .set({
          hour: values.end_time.hour(),
          minute: values.end_time.minute(),
        })
        .toISOString();

      const payload = {
        notes: values.notes,
        location: values.location,
        event_type: "Комисс",
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        room: values.room,
      };

      if (isEditMode && selectedEvent) {
        await api.patch(`/schedules/${selectedEvent.id}`, payload);
        message.success("Хуваарь амжилттай засагдлаа");
      } else {
        payload.committee_id = selectedCommittee.id;
        await api.post(
          `/committees/${selectedCommittee.id}/schedules`,
          payload
        );
        message.success("Шинэ уулзалт үүсгэлээ");
      }

      fetchData();
      setModalVisible(false);
      setIsEditMode(false);
      setSelectedEvent(null);
      form.resetFields();
    } catch (err) {
      toast.error("Хуваарь хадгалах үед алдаа гарлаа");
    }
  };

  const strongColors = ["#0050b3", "#389e0d", "#531dab", "#003a8c", "#08979c"];
  const committeeColorMap = useMemo(() => {
    const map = {};
    committees.forEach((c, index) => {
      map[c.id] = strongColors[index % strongColors.length];
    });
    return map;
  }, [committees]);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: committeeColorMap[event.committee] || "#3174ad",
      borderRadius: "5px",
      border: "none",
      color: "white",
      fontWeight: "bold",
    },
  });

  const CustomEvent = ({ event }) => {
    const committee = committees.find((c) => c.id === event.committee);
    const popoverContent = (
      <div style={{ padding: "8px" }}>
        {event.location && (
          <div>
            📍 <strong>Байршил:</strong> {event.location}
          </div>
        )}
        {event.room && (
          <div>
            🏢 <strong>Өрөө:</strong> {event.room}
          </div>
        )}
        {event.notes && (
          <div>
            📝 <strong>Тэмдэглэл:</strong> {event.notes}
          </div>
        )}
        {committee && (
          <div>
            🏛 <strong>Комисс:</strong> {committee.name}
          </div>
        )}
        <div>
          ⏱ <strong>Цаг:</strong>{" "}
          {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
        </div>
      </div>
    );

    return (
      <Popover content={popoverContent} title={event.title} trigger="hover">
        <div style={{ padding: "2px", cursor: "pointer" }}>
          <div style={{ fontSize: "12px" }}>
            {committee && <div>{committee.name}</div>}
            {event.location && <div>{event.location} - {event.room} тоот</div>}
            {event.notes && <div>📝 {event.notes}</div>}
          </div>
        </div>
      </Popover>
    );
  };

  const handleEditMeeting = (event) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    form.setFieldsValue({
      notes: event.notes,
      location: event.location,
      room: event.room,
      start_date: moment(event.start),
      start_time: moment(event.start),
      end_date: moment(event.end),
      end_time: moment(event.end),
    });
    setModalVisible(true);
  };

  const groupedCommittees = committees.reduce((acc, committee) => {
    const key = committee.grading_component.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(committee);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <DndProvider backend={HTML5Backend}>
        <Row gutter={24}>
          <Col xs={24} md={6}>
            <Card>
              <Typography.Title level={4}>Комиссийн жагсаалт</Typography.Title>
              <Collapse accordion>
                {Object.entries(groupedCommittees).map(([componentName, group]) => (
                  <Collapse.Panel header={componentName} key={componentName}>
                    <List
                      bordered
                      dataSource={group}
                      renderItem={(committee) => {
                        const latestSchedule = committee.schedules?.[committee.schedules.length - 1];
                        return (
                          <List.Item
                            style={{
                              borderLeft: `5px solid ${committeeColorMap[committee.id]}`,
                              padding: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <Typography.Text strong>{committee.name}</Typography.Text>
                              <br />
                              <Typography.Text>{committee.schedules.length} хуваарь</Typography.Text>
                              {latestSchedule && (
                                <>
                                  <br />
                                  <Typography.Text
                                    type="secondary"
                                    style={{ cursor: "pointer", color: "#1890ff" }}
                                    onClick={() => {
                                      const calendarEvent = events.find(e => e.id === latestSchedule.id);
                                      if (calendarEvent) {
                                        setCalendarDate(new Date(calendarEvent.start));
                                        setSelectedEvent(calendarEvent);
                                      }
                                    }}
                                  >
                                    🗓 {moment(latestSchedule.start_datetime).format("YYYY-MM-DD HH:mm")}
                                  </Typography.Text>
                                  <br />
                                  <Typography.Text italic>{latestSchedule.notes}</Typography.Text>
                                </>
                              )}
                            </div>
                            <Button size="small" onClick={() => handleAddMeeting(committee)}>
                              Нэмэх
                            </Button>
                          </List.Item>
                        );
                      }}
                    />
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Card>
          </Col>

          <Col xs={24} md={18}>
            <Card>
              <Space style={{ marginBottom: 8, justifyContent: "space-between" }}>
                <DatePicker
                  onChange={(date) => date && setCalendarDate(date.toDate())}
                  format="YYYY-MM-DD"
                />
                {selectedEvent && (
                  <Button danger onClick={handleDeleteMeeting}>
                    Устгах
                  </Button>
                )}
              </Space>
              <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                eventPropGetter={eventStyleGetter}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventDrop}
                draggableAccessor={() => true}
                date={calendarDate}
                onNavigate={setCalendarDate}
                components={{ event: CustomEvent }}
                min={new Date(1970, 1, 1, 6, 0)}
                onSelectEvent={handleEditMeeting}
              />
            </Card>
          </Col>
        </Row>

        <Modal
          title={isEditMode ? "Хуваарь засах" : "Шинэ уулзалт үүсгэх"}
          open={modalVisible}
          onOk={handleSaveMeeting}
          onCancel={() => {
            setModalVisible(false);
            setIsEditMode(false);
            form.resetFields();
            setSelectedEvent(null);
          }}
        >
          <Form layout="vertical" form={form}>
            <Form.Item name="notes" label="Хэлэлцэх асуудал">
              <Input />
            </Form.Item>
            <Form.Item name="location" label="Байршил" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="room" label="Өрөө" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="start_date"
                  label="Эхлэх огноо"
                  rules={[{ required: true, message: "Эхлэх огноо сонгоно уу" }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="start_time"
                  label="Эхлэх цаг"
                  rules={[{ required: true, message: "Эхлэх цаг оруулна уу" }]}
                >
                  <DatePicker
                    picker="time"
                    format="HH:mm"
                    showTime={{ format: "HH:mm" }}
                    showNow={false}
                    showOk
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="end_date"
                  label="Дуусах огноо"
                  rules={[{ required: true, message: "Дуусах огноо сонгоно уу" }]}
                >
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="end_time"
                  label="Дуусах цаг"
                  rules={[{ required: true, message: "Дуусах цаг оруулна уу" }]}
                >
                  <DatePicker
                    picker="time"
                    format="HH:mm"
                    showTime={{ format: "HH:mm" }}
                    showNow={false}
                    showOk
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </DndProvider>
    </div>
  );
};

export default CommitteeScheduler;
