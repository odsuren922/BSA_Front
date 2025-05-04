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
  Tag,
  Table,
  Tabs,
  Spin,
  Empty,
} from "antd";
import api from "../../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

moment.locale("en");
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const CommitteeScheduler = () => {
  const [committees, setCommittees] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeCommitteeTab, setActiveCommitteeTab] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("1"); // Default to first tab
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState(null);

  // Color schemes
  const strongColors = [
    "#0050b3", // strong blue
    "#389e0d", // green
    "#531dab", // purple
    "#003a8c", // navy
    "#08979c", // teal
  ];

  const roleColorMap = {
    member: "blue",
    secretary: "orange",
    leader: "red",
  };

  const programColors = {
    CS: "geekblue",
    IT: "green",
    SE: "volcano",
    Тодорхойгүй: "default",
  };

  const roleLabels = {
    member: "Гишүүн",
    secretary: "Нарийн бичиг",
    leader: "Ахлах багш",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/committees/by-teacher/1`);
        console.log(response.data.data);
        setCommittees(response.data.data);
        updateEvents(response.data.data);

        // Set the first committee as active by default
        if (response.data.data.length > 0) {
          setActiveCommitteeTab(response.data.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching committees:", error);
        toast.error("Failed to load committee data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      setCalendarDate(new Date(selectedEvent.start));
    }
  }, [selectedEvent]);

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
        notes: schedule.notes,
        committeeName: committee.name,
        gradingComponent: committee.grading_component?.name,
      }))
    );
    setEvents(allEvents);
  };

  const committeeColorMap = useMemo(() => {
    const map = {};
    committees.forEach((c, index) => {
      map[c.id] = strongColors[index % strongColors.length];
    });
    return map;
  }, [committees]);

  const groupedCommittees = useMemo(() => {
    return committees.reduce((acc, committee) => {
      const key = committee.grading_component?.name || "Other";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(committee);
      return acc;
    }, {});
  }, [committees]);

  const eventStyleGetter = (event) => {
    const backgroundColor = "#3174ad";
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

  const CustomEvent = ({ event }) => {
    return (
      <div className="event-container">
        <div style={{ fontSize: "12px" }}>
          <div>
            <strong>{event.committeeName}</strong>
          </div>
          {event.gradingComponent && <div>{event.gradingComponent}</div>}
          {event.location && (
            <div>
              📍 {event.location} байр {event.room} тоот
            </div>
          )}
          {event.notes && <div>📝 {event.notes}</div>}
        </div>
      </div>
    );
  };

  const renderCommitteeMemberItem = (member) => {
    const firstName = member.teacher?.firstname || "";
    const lastNameInitial = member.teacher?.lastname?.charAt(0) || "";

    return (
      <List.Item
        key={member.id}
        actions={[
          <Tag color={roleColorMap[member.role]} key={member.role}>
            {roleLabels[member.role]}
          </Tag>,
        ]}
      >
        <List.Item.Meta title={`${lastNameInitial}. ${firstName}`} />
      </List.Item>
    );
  };

  const renderCommitteeStudentPrograms = (committee) => {
    const programCounts = {};

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

  const getStudentTableColumns = () => {
    return [
      {
        title: "№",
        dataIndex: "index",
        key: "index",
        render: (_, __, index) => index + 1,
        width: 50,
        align: "center",
      },
      {
        title: "Ангилал",
        dataIndex: ["student", "program"],
        key: "program",
        width: 100,
        render: (program) => (
          <Tag color={programColors[program]}>{program || "Тодорхойгүй"}</Tag>
        ),
      },
      {
        title: "ID",
        dataIndex: ["student", "sisi_id"],
        key: "sisi_id",
        width: 80,
      },
      {
        title: "Нэр.Овог",
        dataIndex: "student",
        key: "fullname",
        render: (student) => (
          <Text strong>{`${student?.lastname || ""} ${
            student?.firstname || ""
          }`}</Text>
        ),
        width: 150,
      },
      {
        title: "Удирдагч",
        dataIndex: "student",
        key: "supervisor",
        render: (student) => {
          const supervisor = student.thesis?.supervisor;
          return supervisor
            ? `${supervisor.lastname || ""} ${supervisor.firstname || ""}`
            : "-";
        },
        width: 120,
      },
    ];
  };

  const handleCommitteeTabChange = (key) => {
    setActiveCommitteeTab(key);
  };

  const handleDetailTabChange = (key) => {
    setActiveDetailTab(key);
  };

  const renderCalendarTab = () => {
    return (
      <div className="calendar-tab">
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <DatePicker
            onChange={(date) => date && setCalendarDate(date.toDate())}
            format="YYYY-MM-DD"
            style={{ width: 150 }}
          />
        </div>
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          eventPropGetter={eventStyleGetter}
          resizable
          draggableAccessor={() => true}
          date={calendarDate}
          onNavigate={setCalendarDate}
          components={{ event: CustomEvent }}
          min={new Date(1970, 1, 1, 6, 0)}
          onSelectEvent={setSelectedEvent}
          selected={selectedEvent}
        />
      </div>
    );
  };

  const renderCommitteeDetails = (committee) => {
    if (!committee) return <Empty description="No committee selected" />;

    return (
      <div className="committee-details">
        <Tabs activeKey={activeDetailTab} onChange={handleDetailTabChange}>
          <TabPane tab="Багш нар" key="1">
            <Card>
              <List
                dataSource={committee.members}
                renderItem={renderCommitteeMemberItem}
                locale={{ emptyText: "Багш нэмэгдээгүй байна" }}
              />
              <div style={{ marginTop: 16 }}>
                <Text strong>Хөтөлбөрүүд:</Text>
                <div style={{ marginTop: 8 }}>
                  {renderCommitteeStudentPrograms(committee)}
                </div>
              </div>
            </Card>
          </TabPane>
          <TabPane tab="Оюутнууд" key="2">
            <Card>
              <Table
                dataSource={committee.students || []}
                columns={getStudentTableColumns()}
                rowKey={(record) => record.id}
                pagination={{ pageSize: 20 }}
                bordered
                size="small"
                scroll={{ x: true }}
              />
            </Card>
          </TabPane>

          <TabPane tab="Календар" key="3">
            {renderCalendarTab()}
          </TabPane>
        </Tabs>
      </div>
    );
  };

  const renderCommitteeList = () => {
    return (
      <Card title="Комиссууд" className="committee-list-card">
        <Collapse
          accordion
          defaultActiveKey={Object.keys(groupedCommittees)[0]}
          onChange={(componentName) => {
            const firstCommittee = groupedCommittees[componentName]?.[0];
            if (firstCommittee) {
              setActiveCommitteeTab(firstCommittee.id);
              setActiveDetailTab("1"); // optionally reset tab to teacher info
            }
          }}
        >
          {Object.entries(groupedCommittees).map(([componentName, group]) => (
            <Collapse.Panel header={componentName} key={componentName}>
              <List
                bordered
                dataSource={group}
                renderItem={(committee) => {
                  const latestSchedule =
                    committee.schedules?.[committee.schedules.length - 1];
                  const eventCount = committee.schedules?.length || 0;

                  return (
                    <List.Item
                      style={{
                        borderLeft: `5px solid ${
                          committeeColorMap[committee.id] || "#1677ff"
                        }`,
                        padding: "12px",
                        cursor: "pointer",
                        backgroundColor:
                          activeCommitteeTab === committee.id
                            ? "#f0f9ff"
                            : "inherit",
                      }}
                      onClick={() => {
                        setActiveCommitteeTab(committee.id);
                        setActiveDetailTab("1"); // Reset to first tab when changing committee
                      }}
                    >
                      <div>
                        <Typography.Text strong>
                          {committee.name}
                        </Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag color="blue">{eventCount} хурал</Tag>
                        </div>
                        {latestSchedule && (
                          <div style={{ marginTop: 8 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ cursor: "pointer", color: "#1890ff" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const calendarEvent = events.find(
                                  (e) => e.id === latestSchedule.id
                                );
                                if (calendarEvent) {
                                  setCalendarDate(
                                    new Date(calendarEvent.start)
                                  );
                                  setSelectedEvent(calendarEvent);
                                  setActiveDetailTab("4"); // Switch to calendar tab
                                }
                              }}
                            >
                              🗓{" "}
                              {moment(latestSchedule.start_datetime).format(
                                "YYYY-MM-DD HH:mm"
                              )}
                            </Typography.Text>
                            {latestSchedule.notes && (
                              <div style={{ marginTop: 4 }}>
                                <Typography.Text italic>
                                  {latestSchedule.notes}
                                </Typography.Text>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  );
                }}
              />
            </Collapse.Panel>
          ))}
        </Collapse>
      </Card>
    );
  };

  const renderCommitteeCards = () => {
    const data = committees.map((committee) => {
      const lastSchedule =
        committee.schedules?.[committee.schedules.length - 1];

      const programCounts = {};
      committee.students?.forEach((s) => {
        const program = s.student?.program || "Тодорхойгүй";
        programCounts[program] = (programCounts[program] || 0) + 1;
      });

      return {
        key: committee.id,
        time: lastSchedule
          ? (() => {
              const start = moment(lastSchedule.start_datetime);
              const end = moment(lastSchedule.end_datetime);
              return start.isSame(end, "day")
                ? `${start.format("YYYY/MM/DD HH:mm")} - ${end.format("HH:mm")}`
                : `${start.format("YYYY/MM/DD HH:mm")} - ${end.format(
                    "YYYY/MM/DD HH:mm"
                  )}`;
            })()
          : "–",

        location: lastSchedule
          ? `${lastSchedule.location}, ${lastSchedule.room} тоот`
          : "–",
        component: committee.grading_component?.name || "–",
        name: committee.name,
        status: committee.status,
        programs: Object.entries(programCounts).map(([program, count]) => ({
          program,
          count,
        })),
        fullCommittee: committee,
      };
    });

    const columns = [
      {
        title: "Компонент",
        dataIndex: "component",
        key: "component",
      },

      {
        title: "Комисс",
        dataIndex: "name",
        key: "name",
        render: (text) => <Text strong>{text}</Text>,
      },
      {
        title: "Цаг",
        dataIndex: "time",
        key: "time",
      },
      {
        title: "Байршил",
        dataIndex: "location",
        key: "location",
        render: (text) => <Text type="secondary">{text}</Text>,
      },

      {
        title: "Оюутнууд (хөтөлбөрөөр)",
        dataIndex: "programs",
        key: "programs",
        render: (programs) =>
          programs.map(({ program, count }) => (
            <Tag key={program} color={programColors[program]}>
              {count} {program}
            </Tag>
          )),
      },
      {
        title: "Төлөв",
        dataIndex: "status",
        key: "status",
      },
    ];

    return (
      <div style={{ padding: 24 }}>
        <Typography.Title level={3}>Комиссын жагсаалт</Typography.Title>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          onRow={(record) => ({
            onClick: () => {
              setSelectedCommittee(record.fullCommittee);
              setActiveCommitteeTab(record.fullCommittee.id);
              setShowScheduler(true);
            },
          })}
          rowClassName="hoverable-row"
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading committees..." />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {!showScheduler ? (
        renderCommitteeCards()
      ) : (
        <div className="committee-scheduler-container">
          <Button type="text" onClick={() => setShowScheduler(false)}>
            ← Буцах
          </Button>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} md={16} lg={18}>
              {renderCommitteeDetails(
                committees.find((c) => c.id === activeCommitteeTab)
              )}
            </Col>
          </Row>
        </div>
      )}
    </DndProvider>
  );
};

export default CommitteeScheduler;
