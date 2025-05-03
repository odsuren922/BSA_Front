import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../../context/api_helper";
import { Button, Table, DatePicker, Select, Input, message } from "antd";
import dayjs from "dayjs";

const ThesisDeadlinePage = () => {
  const [searchParams] = useSearchParams();
  const cycleId = searchParams.get("cycleId");

  const [deadlines, setDeadlines] = useState([]);
  const [form, setForm] = useState({
    role: "",
    task: "",
    deadline: null,
    grading_component_id: null,
  });

  const fetchDeadlines = async () => {
    const res = await api.get(`/thesis-deadlines?cycleId=${cycleId}`);
    setDeadlines(res.data);
  };

  const saveDeadline = async () => {
    try {
      await api.post("/thesis-deadlines", {
        ...form,
        thesis_cycle_id: cycleId,
        deadline: dayjs(form.deadline).format("YYYY-MM-DD"),
      });
      message.success("Амжилттай хадгаллаа");
      fetchDeadlines();
    } catch {
      message.error("Алдаа гарлаа");
    }
  };

  useEffect(() => {
    if (cycleId) fetchDeadlines();
  }, [cycleId]);

  return (
    <div className="p-4">
      <h3>Эцсийн хугацаа тохируулах</h3>
      <div className="mb-3 d-flex gap-3">
        <Select
          placeholder="Role"
          style={{ width: 120 }}
          onChange={(val) => setForm({ ...form, role: val })}
        >
          <Select.Option value="student">Оюутан</Select.Option>
          <Select.Option value="supervisor">Удирдагч</Select.Option>
          <Select.Option value="committee">Комисс</Select.Option>
        </Select>

        <Input
          placeholder="Task (e.g. submit_plan)"
          onChange={(e) => setForm({ ...form, task: e.target.value })}
        />

        <DatePicker
          onChange={(date) => setForm({ ...form, deadline: date })}
        />

        <Button type="primary" onClick={saveDeadline}>
          Хадгалах
        </Button>
      </div>

      <Table
        columns={[
          { title: "Role", dataIndex: "role" },
          { title: "Task", dataIndex: "task" },
          { title: "Deadline", dataIndex: "deadline" },
        ]}
        dataSource={deadlines}
        rowKey="id"
      />
    </div>
  );
};

export default ThesisDeadlinePage;
