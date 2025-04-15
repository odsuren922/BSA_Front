import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, DatePicker, Button, message, Space } from "antd";
import axios from "axios";
import dayjs from "dayjs";
//TODO
const SupervisorGradingPage = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const cycleId = query.get("cycleId");
  const schemaId = query.get("schemaId");
  const componentId = query.get("component");

  const [scores, setScores] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchGradingData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/supervisor/component-grading-details", {
        params: {
          cycleId,
          schemaId,
          componentId,
        },
      });

      const { grading_window, scores } = res.data;

      if (grading_window) {
        setStartDate(dayjs(grading_window.start_date));
        setEndDate(dayjs(grading_window.end_date));
      }

      setScores(scores || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load grading data.");
    }
    setLoading(false);
  };

  const saveDeadline = async () => {
    if (!startDate || !endDate) {
      message.warning("Please select both start and end dates.");
      return;
    }

    setSaving(true);
    try {
      await axios.post("/api/supervisor/set-grading-deadline", {
        cycle_id: cycleId,
        schema_id: schemaId,
        component_id: componentId,
        start_date: startDate.format("YYYY-MM-DD"),
        end_date: endDate.format("YYYY-MM-DD"),
      });

      message.success("Scoring window saved.");
    } catch (err) {
      console.error(err);
      message.error("Failed to save scoring window.");
    }
    setSaving(false);
  };

  useEffect(() => {
    fetchGradingData();
  }, [cycleId, schemaId, componentId]);

  const columns = [
    {
      title: "Teacher",
      dataIndex: "teacher_name",
      key: "teacher_name",
    },
    {
      title: "Student",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Scored At",
      dataIndex: "scored_at",
      key: "scored_at",
    },
  ];

  return (
    <div>
      <h2>Grading Overview for Component</h2>

      <div style={{ marginBottom: 24 }}>
        <Space>
          <label>Start Date:</label>
          <DatePicker value={startDate} onChange={setStartDate} />
          <label>End Date:</label>
          <DatePicker value={endDate} onChange={setEndDate} />
          <Button type="primary" onClick={saveDeadline} loading={saving}>
            Save Scoring Window
          </Button>
        </Space>
      </div>

      <Table
        bordered
        columns={columns}
        dataSource={scores}
        loading={loading}
        rowKey={(row) => `${row.teacher_id}-${row.student_id}`}
        pagination={false}
      />
    </div>
  );
};

export default SupervisorGradingPage;
