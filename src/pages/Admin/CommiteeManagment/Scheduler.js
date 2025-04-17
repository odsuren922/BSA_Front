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
} from "antd";
import api from "../../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmModal from "../../../components/Common/DeleteConfirmModal";
moment.locale("en");
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

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
      const committeesData = await api.get(`/committees/active-cycle`);
      setCommittees(committeesData.data.data);
      updateEvents(committeesData.data.data);
    } catch (error) {
      console.error("Error fetching committees:", error);
    }
  };

  const updateEvents = (committeesData) => {
    const allEvents = committeesData.flatMap((committee) =>
      committee.schedules.map((schedule) => ({
        id: schedule.id,
        title: `${committee.name}: ${schedule.notes}`,

        start: new Date(schedule.start_datetime),
        end: new Date(schedule.end_datetime),
        committee: committee.id,
        location: schedule.location,
        room: schedule.room,

        // agenda: schedule.agenda,
      }))
    );
    // console.log("allEvents", allEvents);
    setEvents(allEvents);
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const res = await api.patch(`/schedules/${event.id}`, {
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
      });
      toast.success("Schedule updated");

      const updatedCommittees = committees.map((committee) => {
        if (committee.id === event.committee) {
          return {
            ...committee,
            schedules: committee.schedules.map((schedule) =>
              schedule.id === event.id
                ? {
                    ...schedule,
                    start_datetime: start.toISOString(),
                    end_datetime: end.toISOString(),
                  }
                : schedule
            ),
          };
        }
        return committee;
      });

      setCommittees(updatedCommittees);
      updateEvents(updatedCommittees);
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleAddMeeting = (committee) => {
    setSelectedCommittee(committee);
    form.resetFields();
    setModalVisible(true);
  };

  const handleDeleteMeeting = () => {
    if (!selectedEvent) return;
    setShowDeleteModal(true);
  };

  const handleSaveMeeting = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        notes: values.notes,
        location: values.location,
        event_type: "Комисс",
        start_datetime: values.time[0].toISOString(),
        end_datetime: values.time[1].toISOString(),
        room: values.room,
      };

      if (isEditMode && selectedEvent) {
        // Update
        await api.patch(`/schedules/${selectedEvent.id}`, payload);
        toast.success("Meeting updated");
      } else {
        // Create
        payload.committee_id = selectedCommittee.id;
        await api.post(
          `/committees/${selectedCommittee.id}/schedules`,
          payload
        );
        toast.success("Meeting created");
      }

      fetchData();
      setModalVisible(false);
      setSelectedEvent(null);
      setIsEditMode(false);
      form.resetFields();
    } catch (err) {
      toast.error("Failed to save schedule");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(
        `/committees/${selectedEvent.committee}/schedules/${selectedEvent.id}`
      );
      toast.success("Meeting deleted");
      fetchData();
      setSelectedEvent(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete schedule");
    } finally {
      setShowDeleteModal(false);
    }
  };

  //   const eventStyleGetter = (event) => {
  //     const committee = committees.find((c) => c.id === event.committee);
  //     return {
  //       style: {
  //         backgroundColor:"#3174ad",
  //         borderRadius: "5px",
  //         border: "none",
  //       },
  //     };
  //   };
  const strongColors = [
    "#0050b3", // strong blue
    "#389e0d", // green

    "#531dab", // purple
    "#003a8c", // navy
    "#08979c", // teal
  ];
  const committeeColorMap = useMemo(() => {
    const map = {};
    committees.forEach((c, index) => {
      map[c.id] = strongColors[index % strongColors.length];
    });
    return map;
  }, [committees]);

  const eventStyleGetter = (event) => {
    const backgroundColor = committeeColorMap[event.committee] || "#3174ad";
    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        border: "none",
        color: "white",
        fontWeight: "bold",
      },
    };
  };

  //   const CustomEvent = ({ event }) => {
  //     const committee = committees.find((c) => c.id === event.committee);
  //     return (
        // <div>
        //   <div style={{ fontWeight: "bold" }}>{event.title}</div>
        //   <div style={{ fontSize: "12px" }}>
        //     {event.location && <div>📍 {event.location}</div>}
        //     {event.notes && <div>📝 {event.notes}</div>}
        //     {committee && <div>Комисс: {committee.name}</div>}
        //     {committee?.grading_component?.name && (
        //       <div>Шалгуур: {committee.grading_component.name}</div>
        //     )}
        //   </div>
        // </div>
  //     );
  //   };
  const CustomEvent = ({ event }) => {
    const committee = committees.find((c) => c.id === event.committee);
    const popoverContent = (
      <div style={{ padding: "8px" }}>
        {event.location && (
          <div>
            📍 <strong>Location:</strong> {event.location}
          </div>
        )}
        {event.notes && (
          <div>
            📝 <strong>Notes:</strong> {event.notes}
          </div>
        )}
        {event.room && (
          <div>
            📝 <strong>Room:</strong> {event.room}
          </div>
        )}
        {committee && (
          <div>
            🏛 <strong>Committee:</strong> {committee.name}
          </div>
        )}
        {committee?.grading_component?.name && (
          <div>
            📊 <strong>Grading Component:</strong>{" "}
            {committee.grading_component.name}
          </div>
        )}
        <div>
          ⏱ <strong>Time:</strong> {moment(event.start).format("HH:mm")} -{" "}
          {moment(event.end).format("HH:mm")}

   
       
          
        </div>
      </div>
    );

    return (
      <Popover
        content={popoverContent}
        title={event.title}
        trigger="hover"
        placement="rightTop"
      >
        <div style={{ padding: "2px", cursor: "pointer" }}>
       

          <div style={{ fontSize: "12px" }}>
          {committee && <div> {committee.name}</div>}
            {committee?.grading_component?.name && (
              <div> {committee.grading_component.name}</div>
            )}
            {event.location && <div> {event.location} байр {event.room} тоот </div>}
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
      time: [moment(event.start), moment(event.end)],
    });
    setModalVisible(true);
  };
  const groupedCommittees = committees.reduce((acc, committee) => {
    const key = committee.grading_component.name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(committee);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <DndProvider backend={HTML5Backend}>
        <Row gutter={24}>
          <Col xs={24} md={6}>
            <Card>
              <Typography.Title level={4}>Комисс</Typography.Title>
              <Collapse accordion>
                {Object.entries(groupedCommittees).map(
                  ([componentName, group]) => (
                    <Collapse.Panel header={componentName} key={componentName}>
                      <List
                        bordered
                        dataSource={group}
                        renderItem={(committee) => {
                          const latestSchedule =
                            committee.schedules?.[
                              committee.schedules.length - 1
                            ];

                          return (
                            <List.Item
                              style={{
                                borderLeft: `5px solid ${
                                  committee.color || "#1677ff"
                                }`,
                                padding: "12px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <Typography.Text strong>
                                  {committee.name}
                                </Typography.Text>
                                <br />
                                <Typography.Text>
                                  {committee.schedules.length} meetings
                                </Typography.Text>
                                {latestSchedule && (
                                  <>
                                    <br />
                                    <Typography.Text
                                      type="secondary"
                                      style={{
                                        cursor: "pointer",
                                        color: "#1890ff",
                                      }}
                                      onClick={() => {
                                        const calendarEvent = events.find(
                                          (e) => e.id === latestSchedule.id
                                        );
                                        if (calendarEvent) {
                                          setCalendarDate(
                                            new Date(calendarEvent.start)
                                          );
                                          setSelectedEvent(calendarEvent);
                                        }
                                      }}
                                    >
                                      🗓{" "}
                                      {moment(
                                        latestSchedule.start_datetime
                                      ).format("YYYY-MM-DD HH:mm")}
                                    </Typography.Text>
                                    <br />
                                    <Typography.Text italic>
                                      {latestSchedule.notes}
                                    </Typography.Text>
                                  </>
                                )}
                              </div>
                              <Button
                                size="small"
                                onClick={() => handleAddMeeting(committee)}
                              >
                                Add
                              </Button>
                            </List.Item>
                          );
                        }}
                      />
                    </Collapse.Panel>
                  )
                )}
              </Collapse>
            </Card>
          </Col>
          <Col xs={24} md={18}>
            <Card style={{ padding: "16px" }}>
              <Space
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <DatePicker
                  onChange={(date) => {
                    if (date) {
                      setCalendarDate(date.toDate()); // 👈 updates the calendar view
                    }
                  }}
                  format="YYYY-MM-DD"
                />

                {selectedEvent && (
                  <Button danger onClick={handleDeleteMeeting}>
                    Delete Meeting
                  </Button>
                )}
              </Space>

              <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                // onSelectEvent={setSelectedEvent}
                eventPropGetter={eventStyleGetter}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventDrop}
                resizable
                draggableAccessor={() => true}
                date={calendarDate}
                onNavigate={(date) => setCalendarDate(date)}
                components={{
                  event: CustomEvent,
                }}
                min={new Date(1970, 1, 1, 6, 0)} // 👈 calendar will start from 6 AM
                onSelectEvent={handleEditMeeting}
              />
            </Card>
          </Col>
        </Row>

        {/* <Modal
          title="Шинэ уулзалт үүсгэх"
          open={modalVisible}
          onOk={handleCreateMeeting}
          onCancel={() => setModalVisible(false)}
        > */}
        <Modal
          title={isEditMode ? "Хуваарь засах" : "Шинэ уулзалт үүсгэх"}
          open={modalVisible}
          onOk={handleSaveMeeting}
          onCancel={() => {
            setModalVisible(false);
            setSelectedEvent(null);
            setIsEditMode(false);
            form.resetFields();
          }}
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              name="notes"
              label="Хэлэлцэх асуудал"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="location"
              label="Байршил"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="room" label="Өрөө" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              name="time"
              label="Цагийн хүрээ"
              rules={[{ required: true }]}
            >
              <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" />
            </Form.Item>
          </Form>
        </Modal>

        <DeleteConfirmModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Хуваарь устгах уу?"
          message="Та энэ хуваарийг устгахдаа итгэлтэй байна уу?"
          confirmText="Тийм, устгах"
          cancelText="Үгүй"
        />
      </DndProvider>
    </div>
  );
};

export default CommitteeScheduler;
