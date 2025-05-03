import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  List,
  Tag,
  Typography,
  Table,
  DatePicker,
  Empty,
} from "antd";
import { useParams } from "react-router-dom";
import moment from "moment";
import api from "../../../context/api_helper";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const { TabPane } = Tabs;
const { Text } = Typography;
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const roleColorMap = {
  member: "blue",
  secretary: "orange",
  leader: "red",
};

const roleLabels = {
  member: "Гишүүн",
  secretary: "Нарийн бичиг",
  leader: "Ахлах багш",
};

const programColors = {
  CS: "geekblue",
  IT: "green",
  SE: "volcano",
  Тодорхойгүй: "default",
};

const CommitteeDetailsPage = () => {
  const { id } = useParams();
  const [committee, setCommittee] = useState(null);
  const [activeTab, setActiveTab] = useState("1");


  useEffect(() => {
    const fetchCommittee = async () => {
      const response = await api.get(`/committees/${id}`);
      const data = response.data.data;
      setCommittee(data);
  
    };
  
    fetchCommittee();
  }, [id]);
  

  const getStudentTableColumns = () => [
    {
      title: "№",
      render: (_, __, index) => index + 1,
      width: 50,
      align: "center",
    },
    {
      title: "Mэргэжил",
      dataIndex: ["student", "program"],
      render: (program) => (
        <Tag color={programColors[program]}>{program || "Тодорхойгүй"}</Tag>
      ),
    },
    {
      title: "ID",
      dataIndex: ["student", "sisi_id"],
    },
    {
      title: "Нэр.Овог",
      dataIndex: "student",
      render: (student) => (
        <Text strong>{`${student?.lastname || ""} ${student?.firstname || ""}`}</Text>
      ),
    },
    {
      title: "Удирдагч",
      dataIndex: "student",
      render: (student) => {
        const supervisor = student?.thesis?.supervisor;
        return supervisor
          ? `${supervisor.lastname} ${supervisor.firstname}`
          : "-";
      },
    },
    {
        title: "Судалгааны сэдэв",
        render: (record) => (
          < Text>{`${record.student.thesis.name_mongolian}`}</Text>
        ),
      
      },

    {
        title: "Дэлгэрэнгүй",
        render: (text, record) => (
          <a href={`/aboutthesis/${record.student.thesis.id}`}>Дэлгэрэнгүй</a>
        ),
      
      },
  ];





  if (!committee) return <Empty description="Committee not found" />;

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>{committee.name}</Typography.Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
      <TabPane tab="Оюутнууд" key="1">
          <Card>
            <Table
              dataSource={committee.students}
              columns={getStudentTableColumns()}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </TabPane>
        <TabPane tab="Багш нар" key="2">
          <Card>
            <List
              dataSource={committee.members}
              renderItem={(member) => (
                <List.Item
                  actions={[
                    <Tag color={roleColorMap[member.role]} key={member.role}>
                      {roleLabels[member.role]}
                    </Tag>,
                  ]}
                >
                  <List.Item.Meta
                    title={`${member.teacher?.lastname} ${member.teacher?.firstname}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
     
       
      </Tabs>
    </div>
  );
};

export default CommitteeDetailsPage;
