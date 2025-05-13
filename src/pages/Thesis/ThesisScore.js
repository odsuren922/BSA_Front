import React, { useState, useEffect } from "react";
import { Table, Card, Spin, Form, Button, Tag } from "antd";
import api from "../../context/api_helper";
// import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

dayjs.extend(utc);
dayjs.extend(timezone);

const ThesisScores = ({
  thesisId,
  thesisCycle,
  supervisor,
  thesis,
  gradingSchema,
  scores,
  loading,
}) => {
  const { user } = useUser();
  const [form] = Form.useForm();
  const [assignments, setAssignments] = useState([]);
const[componentsDeadlines, setComponetsDeadlines]= useState([]);
useEffect(() => {
  const fetchAssignments = async () => {
    try {
      const response = await api.get('/grading-assignments', {
        params: {
          grading_schema_id: gradingSchema?.id,
          student_id: thesis?.student.id,
        },
      });
      console.log("jahha", response.data)
      setAssignments(response.data);
    } catch (error) {
      toast.error("Оноо өгсөн багшийн мэдээллийг авч чадсангүй");
    }
  };


  if (gradingSchema?.id && thesis?.student.id) {
    fetchAssignments();
  }
  console.log(thesis)
}, [gradingSchema?.id, thesis?.student_id]);

useEffect(() => {
    fetchComponentsDeadline()
    
  }, [gradingSchema?.id, thesisCycle?.id]);

const fetchComponentsDeadline = async () => {
    try {
      const response = await api.get(`/cycle-deadlines/by-schema?thesis_cycle_id=${thesisCycle.id}&grading_schema_id=${gradingSchema.id}`,);
      console.log("deadlines", response.data)
      setComponetsDeadlines(response.data.deadlines);
    } catch (error) {
      toast.error("Оноо өгсөн багшийн мэдээллийг авч чадсангүй");
    }
  };

  const calScheduleWeek = (week) => {

    const startDate = new Date(thesisCycle.start_date);
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { start: weekStart, end: weekEnd };
  };

  const columns = [
    {
        title: "Үнэлгээний хэсэг",
        dataIndex: ["component", "name"],
        fixed: "left", 
        width: 180,    
      }
,     
{
    title: "Үнэлгээ өгөх",
    dataIndex: ["component", "by_who_label"],
  }, 
    {
      title: "Нийт боломжит оноо",
      dataIndex: ["component", "score"],
    },
  
      {
        title: "Оноо өгөх",
        dataIndex: "scoreGiver",
        render: (text) => <span>{text || "-"}</span>,
      },
      
      
    {
      title: "Авсан оноо",
      render: (_, record) => {
        const scoreValue = parseFloat(record.score);
        return scoreValue ? (
          <span style={{ fontWeight: "bold", fontSize: 14 }}>{scoreValue}</span>
        ) : (
          "-"
        );
      },
    },
    {
        title: "7 хоногийн хугацаа",
        render: (_, record) => {
          const deadline = componentsDeadlines.find(
            (d) => d.related_id === record.component?.id && d.type === "grading_component"
          );
      
          if (deadline?.start_date && deadline?.end_date) {
            return (
              <div style={{ fontSize: 13 }}>
                {dayjs(deadline.start_date).format("YYYY-MM-DD ") + "-"}
                {dayjs(deadline.end_date).format("MM-DD")}
              </div>
            );
          }
      
          // If not found or incomplete
          return "-";
        },
      },
      
    {
      title: "7 хоног",
      dataIndex: ["component", "scheduled_week"],
      render: (week) => {
        if (!week) return "-";
        return (
          <Tag color="blue" style={{ fontSize: "12px", padding: "2px 8px" }}>
            {week}-р 7 хоног
          </Tag>
        );
      },
    },
  ];

  const computedData =
  gradingSchema?.grading_components?.map((component) => {
    const matchedScore = scores.find((s) => s.component?.id === component.id);
    const matchedAssignment = assignments.find((a) => a.component_id === component.id);

    let scoreGiver = "-";

    if (matchedAssignment?.by_who === "supervisor" && supervisor) {
      scoreGiver = `${supervisor.lastname} ${supervisor.firstname}`;
    }

    if (matchedAssignment?.by_who === "committee" && matchedAssignment?.committee?.name) {
      scoreGiver = matchedAssignment.committee.name;
    }

    if (matchedAssignment?.by_who === "examiner" && matchedAssignment?.assigned_teacher?.length > 0) {
        const examiners = matchedAssignment.assigned_teacher
          .map((t) => t.assigned_by)
          .filter(Boolean)
          .map((teacher) => `${teacher.lastname} ${teacher.firstname}`);
        
        scoreGiver = examiners.length > 0 ? examiners.join(", ") : "-";
      }
      

    return {
      id: component.id,
      component: component,
      score: matchedScore?.score ?? null,
      scoreGiver, // оноо өгсөн хүний нэр/committee
    };
  }) || [];



  return (
    <Card title="Үнэлгээ">
      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={computedData}
          rowKey={(record) => record.id}
          pagination={false}
          scroll={{ x: "max-content" }} 
        />
      )}
    </Card>
  );
};

export default ThesisScores;
