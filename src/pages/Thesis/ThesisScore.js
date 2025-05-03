import React, { useState, useEffect } from "react";
import { Table, Card, Spin, Form, Button,Tag } from "antd";
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

const ThesisScores = ({ thesisId, thesisCycle, supervisor,thesis,gradingSchema }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useUser();
  const [form] = Form.useForm();

  useEffect(() => {
    if (thesisId) fetchScores();
  }, [thesisId]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/scores/getScoreByThesis/${thesisId}/`);

      console.log(res.data);
      setScores(res.data.data);
    } catch (err) {
      toast.error("Оноо дуудахад алдаа гарлаа");
    } finally {
      setLoading(false);
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

  const canGiveScore = (record) => {
    //TODO
    if ( (record.by_who !== "supervisor"))  return false;
    if(record.by_who === "supervisor" && user.id !== thesis.supervisor.id) return false;

    if(user.role ==="student" ) return false;
    const week = parseInt(record.scheduled_week);
    if (isNaN(week)) return false;
     
    const { start, end } = calScheduleWeek(week);
    const now = dayjs().tz("Asia/Ulaanbaatar");
    const startDate = dayjs(start).tz("Asia/Ulaanbaatar").startOf("day");
    const endDate = dayjs(end).tz("Asia/Ulaanbaatar").endOf("day");

    return now.isAfter(startDate) && now.isBefore(endDate);
  };

  const handleSave = async (values) => {
    setSaving(true);
    const payload = Object.entries(values).map(([key, value]) => ({
      component_id: key.split("_")[1],
      score: value,
    }));

    try {
      if (user?.id === supervisor.id) {
        await api.post(`/supervisor/thesis-scores`, {
          thesis_id: thesisId,
          score: payload[0].score,
          grading_component_id: payload[0].component_id,
          teacher_id: user.id,
          given_by: user.role,
          comment: "",
          committee_id: "",
        });
      }

      toast.success("Амжилттай хадгаллаа");
      fetchScores();
    } catch (err) {
      toast.error("Хадгалах үед алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };
  const columns = [
    {
      title: "Үнэлгээний хэсэг",
      dataIndex: ["component", "name"],
    },
    {
      title: "Нийт боломжит оноо",
      dataIndex: ["component", "score"],
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
      title: "7 хоногийн хугацаа өдрөөр",
      render: (_, record) => {
        const week = parseInt(record.component?.scheduled_week);
        if (!isNaN(week)) {
          const { start, end } = calScheduleWeek(week);
          return `${start.toISOString().split("T")[0].replace(/-/g, ".")} – ${end
            .toISOString()
            .split("T")[0]
            .replace(/-/g, ".")}`;
        }
        return "-";
      },
    },
    {
      title: "7 хоног",
      dataIndex: ["component", "scheduled_week"],
      render: (week) => {
        if (!week) return "-";
        return (
          <Tag color="blue" style={{ fontSize: "14px", padding: "2px 8px" }}>
            {week}-р 7 хоног
          </Tag>
        );
      },
    },
  ];
  
  const computedData = gradingSchema?.grading_components?.map((component) => {
    const matchedScore = scores.find((s) => s.component?.id === component.id);
  
    return {
      id: component.id,
      component: component, // бүх мэдээллийг дамжуулах
      score: matchedScore?.score ?? null, // оноо байгаа бол оноо, байхгүй бол null
    };
  }) || [];
  
  const editable = scores.some((record) => canGiveScore(record));

  return (
    <Card
      title="Үнэлгээ"
      extra={
      
        editable &&  ( <Button type="primary" loading={saving} onClick={() => form.submit()}>
            Хадгалах
          </Button>)
        
      }
    >
      {loading ? (
        <Spin />
      ) : (
        <Form form={form} onFinish={handleSave}>
          <Table
            columns={columns}
            dataSource={computedData}
            rowKey={(record) => record.id}
            pagination={false}
          />
        </Form>
      )}
    </Card>
  );
};

export default ThesisScores;
