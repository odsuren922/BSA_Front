import React from "react";
import {
  Table,
  Card,
  Checkbox,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
const { Title, Text } = Typography;

const initialTeachers = [
  { id: 1, name: "Б. Эрдэнэтуяа", color: "#FFD700" },
  { id: 2, name: "Ц. Бат-Эрдэнэ", color: "#87CEEB" },
  { id: 3, name: "Д. Сүхбаатар", color: "#98FB98" },
  { id: 4, name: "Л. Ганцэцэг", color: "#FFB6C1" },
  { id: 5, name: "Н. Төгсжаргал", color: "#DDA0DD" },
];

const daysOfWeek = ["Дав", "Мяг", "Лха", "Пүр", "Баа", "Бям", "Ням"];

const timeSlots = [
  "07:40 - 08:25", "08:25 - 09:10", "09:20 - 10:05", "10:05 - 10:50",
  "11:00 - 11:45", "11:45 - 12:30", "12:40 - 13:25", "13:25 - 14:10",
  "14:20 - 15:05", "15:05 - 15:50", "16:00 - 16:45", "16:45 - 17:30",
  "17:40 - 18:25", "18:25 - 19:10", "19:20 - 20:05", "20:05 - 20:50"
];

const sampleSchedules = {
  1: {
    Дав: {
      0: { subject: "Математик", room: "201", grade: "10А" },
      3: { subject: "Физик", room: "Лаб 3", grade: "11Б" },
    },
    Мяг: {
      2: { subject: "Англи хэл", room: "203", grade: "10Б" },
    },
  },
  2: {
    Дав: {
      0: { subject: "Монгол хэл", room: "105", grade: "9А" },
      3: { subject: "Уран зохиол", room: "105", grade: "11В" },
    },
    Мяг: {
      2: { subject: "Англи хэл", room: "203", grade: "10Б" },
    },
  },
  3: {
    Дав: {
      0: { subject: "Түүх", room: "106", grade: "11А" },
    },
    Пүр: {
      0: { subject: "Математик", room: "201", grade: "10А" },
      3: { subject: "Физик", room: "Лаб 3", grade: "11Б" },
    },
  },
};

const ScheduleGrid = () => {
  const [selectedTeacherIds, setSelectedTeacherIds] = React.useState([1, 2, 3]);

  const handleCheckboxChange = (checkedValues) => {
    setSelectedTeacherIds(checkedValues);
  };

  const getTeachersAtTimeSlot = (day, timeIndex) => {
    return initialTeachers
      .filter((teacher) => selectedTeacherIds.includes(teacher.id))
      .filter((teacher) => sampleSchedules[teacher.id]?.[day]?.[timeIndex])
      .map((teacher) => ({
        ...teacher,
        classInfo: sampleSchedules[teacher.id][day][timeIndex],
      }));
  };

  const columns = [
    {
      title: "Цаг",
      dataIndex: "time",
      fixed: "left",
      width: 130,
    },
    ...daysOfWeek.map((day) => ({
      title: day,
      dataIndex: day,
      render: (teachers) => {
        if (!teachers || teachers.length === 0) {
          return <Text type="secondary">-</Text>;
        }
        return (
          <Space direction="vertical" style={{ width: "100%" }}>
            {teachers.map((teacher) => (
              <Card
                key={teacher.id}
                size="small"
                bordered
                style={{
                  backgroundColor: `${teacher.color}30`,
                  borderColor: teacher.color,
                }}
              >
                <Text strong style={{ color: teacher.color }}>
                  {teacher.name}
                </Text>
                <div>{teacher.classInfo.subject}</div>
                <div>Өрөө: {teacher.classInfo.room}</div>
                <div>Анги: {teacher.classInfo.grade}</div>
              </Card>
            ))}
          </Space>
        );
      },
    })),
  ];

  const dataSource = timeSlots.map((time, timeIndex) => {
    const row = { key: timeIndex, time };
    daysOfWeek.forEach((day) => {
      row[day] = getTeachersAtTimeSlot(day, timeIndex);
    });
    return row;
  });

  return (
    <div className="mt-4">
      <Title level={3}>Багш нарын цагийн хуваарь</Title>

      <Card className="mb-3">
        <Title level={5}>Багш сонгох:</Title>
        <Checkbox.Group
          options={initialTeachers.map((t) => ({
            label: (
              <span style={{ color: t.color, fontWeight: 500 }}>{t.name}</span>
            ),
            value: t.id,
          }))}
          value={selectedTeacherIds}
          onChange={handleCheckboxChange}
        />
      </Card>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 1500 }}
        bordered
        size="middle"
      />
    </div>
  );
};

export default ScheduleGrid;
