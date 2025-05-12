// CommitteeScheduler.js
import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import "moment/locale/mn";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Calendar, momentLocalizer } from "react-big-calendar";

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
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
  message,
  ConfigProvider,
  Spin,
  TimePicker
} from "antd";

import api from "../../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import mnMN from "antd/es/locale/mn_MN";
import "dayjs/locale/mn";
import dayjs from "dayjs";

import 'dayjs/locale/mn';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('mn');
dayjs.extend(utc);
dayjs.extend(timezone);



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
      console.log("committeesData.data.data", committeesData.data.data)
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
        start: dayjs.utc(schedule.start_datetime).tz("Asia/Ulaanbaatar").toDate(), // Convert to local
        end: dayjs.utc(schedule.end_datetime).tz("Asia/Ulaanbaatar").toDate(),
        committee: committee.id,
        location: schedule.location,
        room: schedule.room || null,
      }))
    );
    setEvents(allEvents);
  };
  

  const handleEventDrop = async ({ event, start, end }) => {
    // 1. Optimistically update the calendar UI
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id
          ? { ...e, start: new Date(start), end: new Date(end) }
          : e
      )
    );
  
    // 2. Save to backend in background
    try {
      await api.patch(`/schedules/${event.id}`, {
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
      });
      message.success("Хуваарь амжилттай шинэчлэгдлээ");
      // Optional: refetch data to stay 100% synced
      // await fetchData();
    } catch (error) {
      toast.error("Хуваарь шинэчлэхэд алдаа гарлаа");
  
      // 3. Optional: revert UI if saving fails
      fetchData(); // revert to server state
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

      console.log("hello", values.start_date?.format(), values.start_time?.format());
      const startDateTime = dayjs
      .tz(`${values.start_date.format("YYYY-MM-DD")} ${values.start_time.format("HH:mm")}`, "Asia/Ulaanbaatar")
      .utc()
      .format() // ISO string in UTC
      
      const endDateTime = dayjs
      .tz(`${values.end_date.format("YYYY-MM-DD")} ${values.end_time.format("HH:mm")}`, "Asia/Ulaanbaatar")
      .utc()
      .format()
      
console.log(startDateTime ,endDateTime);


      const payload = {
        notes: values.notes,
        location: values.location,
        event_type: "Комисс",
        start_datetime: startDateTime,
        end_datetime:endDateTime,
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
    const start = moment(event.start);
    const end = moment(event.end);
    
    form.setFieldsValue({
        start_date: dayjs.utc(event.start).tz("Asia/Ulaanbaatar"),
        end_date: dayjs.utc(event.end).tz("Asia/Ulaanbaatar"),
        start_time: dayjs.utc(event.start).tz("Asia/Ulaanbaatar"),
        end_time: dayjs.utc(event.end).tz("Asia/Ulaanbaatar"),
        notes: event.notes,
      location: event.location,
      room: event.room,
    });
    
    setModalVisible(true);
  };

  const groupedCommittees = committees.reduce((acc, committee) => {
    const key = committee.grading_component.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(committee);
    return acc;
  }, {});

  const calendarMessages = {
    today: "Өнөөдөр",
    previous: "Өмнөх",
    next: "Дараах",
    month: "Сар",
    week: "7 хоног",
    day: "Өдөр",
    agenda: "Тов",
    date: "Огноо",
    time: "Цаг",
    event: "Уулзалт",
    showMore: (total) => `+ ${total} илүү`,
  };
  

  return (
    <div className="container mt-4">
          <ConfigProvider locale={mnMN}> 
          <Spin spinning={loading} tip="Ачааллаж байна...">

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
                   const schedules = committee.schedules || [];
                   return (
                     <List.Item
                       style={{
                         borderLeft: `5px solid ${committeeColorMap[committee.id]}`,
                         padding: "12px",
                         display: "block",
                       }}
                     >
                       <div>
                         <Typography.Text strong>{committee.name}</Typography.Text>
                         <br />
                         <Typography.Text>{schedules.length} хуваарь</Typography.Text>
             
                         {schedules.map((schedule) => (
                           <div key={schedule.id} style={{ marginTop: "8px", padding: "8px", border: "1px dashed #ccc", borderRadius: "4px" }}>
                             <Typography.Text
                               type="secondary"
                               style={{ cursor: "pointer", color: "#1890ff" }}
                               onClick={() => {
                                 const calendarEvent = events.find(e => e.id === schedule.id);
                                 if (calendarEvent) {
                                   setCalendarDate(new Date(calendarEvent.start));
                                   setSelectedEvent(calendarEvent);
                                 }
                               }}
                             >
                             {dayjs.utc(schedule.start_datetime).tz("Asia/Ulaanbaatar").format("YYYY-MM-DD HH:mm")}
                             </Typography.Text>
                             <br />
                             <Typography.Text italic>{schedule.notes}</Typography.Text>   <Button
                               size="small"
                               onClick={() => handleEditMeeting({
                                 ...schedule,
                                 start: dayjs.utc(schedule.start_datetime).tz("Asia/Ulaanbaatar").toDate(),
                                 end: dayjs.utc(schedule.end_datetime).tz("Asia/Ulaanbaatar").toDate(),
                                 committee: committee.id,
                                 location: schedule.location,
                                 notes: schedule.notes,
                                 room: schedule.room,
                               })}
                             >
                               Засах
                             </Button>
                             <br />
                           
                           </div>
                         ))}
                       </div>
                       <div style={{ marginTop: "12px" }}>
                         <Button size="small" onClick={() => handleAddMeeting(committee)}>
                           Нэмэх
                         </Button>
                       </div>
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
                 format="YYYY-MM-DD dddd"
                />
                {selectedEvent && (
                  <Button danger onClick={handleDeleteMeeting}>
                    Устгах
                  </Button>
                )}
              </Space>
              <div style={{ padding: "2px", cursor: "pointer", fontSize: "12px" }}>
              <DragAndDropCalendar
                           messages={calendarMessages} 
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
              </div>
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
            <Form.Item name="notes" label="Хэлэлцэх асуудал" >
              <Input />
            </Form.Item>
            <Form.Item name="location" label="Байршил" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="room" label="Өрөө" >
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="start_date"
                  label="Эхлэх огноо"
                  rules={[{ required: true, message: "Эхлэх огноо сонгоно уу" }]}
                >
                  <DatePicker     format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
  name="start_time"
  label="Эхлэх цаг"
  rules={[{ required: true, message: "Эхлэх цаг оруулна уу" }]}
>
  <TimePicker format="HH:mm" style={{ width: "100%" }} />
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
  <TimePicker format="HH:mm" style={{ width: "100%" }} />
</Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </DndProvider>
      </Spin>
      </ConfigProvider>
    </div>
  );
};

export default CommitteeScheduler;
