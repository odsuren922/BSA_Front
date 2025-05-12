import React, { useState, useEffect } from "react";
import {
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Button,
    Alert,
    Card,
    Badge,
    Row,
    Col,
    message,
    Spin,
    Table,
    Space,
    Collapse,
    PickerPanel,
    ConfigProvider
} from "antd";

import { Steps } from "antd";
import CycleStep1_InfoForm from "../../../components/remiendercreate/CycleStep1_InfoForm";
import CycleStep2_ComponentsAndReminders from "../../../components/remiendercreate/CycleStep2_ComponentsAndReminders";
import CycleStep3_GlobalReminders from "../../../components/remiendercreate/CycleStep3_GlobalReminders";

import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import mnMN from "antd/es/locale/mn_MN";
import dayjs from "dayjs";
import "dayjs/locale/mn";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';



import { useNavigate } from "react-router-dom";
import api from "../../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isEditable } from "@testing-library/user-event/dist/utils";
const { Option } = Select;
dayjs.extend(utc);
dayjs.extend(timezone);
const CycleFormPage = ({ onSubmit, user, gradingSchemas }) => {
    const { Step } = Steps;

    const [form] = Form.useForm();
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cycle, setEditCycle] = useState(null);
    const [filterYear, setFilterYear] = useState("");
    const [filterSemester, setFilterSemester] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [editableCycle, setIsEditableCycle] = useState(false);
    const navigate = useNavigate();
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [statusWarning, setStatusWarning] = useState("");
    const [componentDeadlines, setComponentDeadlines] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [componentNotes, setComponentNotes] = useState({});
    const [editReminderMode, setEditReminderMode] = useState({});


    const [loadingCycle, setLoadingCycle] = useState(false);
    const [reminders, setReminders] = useState([
        { title: "", description: "", date_range: [] },
    ]);
    const [componentReminders, setComponentReminders] = useState({});
    useEffect(() => {
        fetchThesisCycle();
    }, []);

    const fetchThesisCycle = async () => {
        setLoading(true);
        console.log(user.dep_id);
        try {
            const response = await api.get(`/thesis-cycles`, {
                params: { dep_id: user.dep_id },
            });
//TODO::WITH REMINDERS

            setCycles(response.data);
            
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching thesis cycles:", error);
            toast.error("Мэдээлэл авахад алдаа гарлаа!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (cycle && cycle.id) {
          fetchReminder();
        }
      }, [cycle]);
      

      const fetchReminder = async () => {
        setLoading(true);
      
        try {
          const response = await api.get(`/thesiscycle/${cycle.id}/reminders`);
          const allReminders = response.data.data;
      
          const grouped = {}; // componentReminders
          const global = [];  // reminders (without component_id)
      
          allReminders.forEach((reminder) => {
            const formatted = {
              id: reminder.id,
              title: reminder.title,
              description: reminder.description,
              target: reminder.target_type,
              send_schedules: (reminder.schedules || []).map((s) => {
                const localTime = dayjs.utc(s.scheduled_at).tz('Asia/Ulaanbaatar');
                return {
                  date: localTime,
                  time: localTime,
                };
              }),
            };
      
            if (!reminder.component_id) {
              // ✅ It's a global reminder
              global.push(formatted);
            } else {
              // ✅ It's a component reminder
              if (!grouped[reminder.component_id]) {
                grouped[reminder.component_id] = [];
              }
              grouped[reminder.component_id].push(formatted);
            }
          });
      
          setReminders(global);                // for CycleStep3_GlobalReminders
          setComponentReminders(grouped);      // for CycleStep2_ComponentsAndReminders (etc.)
          console.log("Global reminders:", global);
          console.log("Component-based reminders:", grouped);
        } catch (error) {
          console.error("Error fetching reminders:", error);
          toast.error("Мэдээлэл авахад алдаа гарлаа!");
        } finally {
          setLoading(false);
        }
      };
      
      



    useEffect(() => {
        if (cycle) {
            form.setFieldsValue({
                ...cycle,
                start_date: dayjs(cycle.start_date),
                end_date: dayjs(cycle.end_date),
            });

            const schema = gradingSchemas.find(
                (s) => s.id === parseInt(cycle.grading_schema_id)
            );
            setSelectedSchema(schema);
            setStartDate(dayjs(cycle.start_date));

            if (cycle.deadlines) {
                console.log("he")
                const deadlines = cycle.deadlines.map((d) => ({
                    ...d,
                    start_date: d.start_date ? dayjs(d.start_date) : null,
                    end_date: d.end_date ? dayjs(d.end_date) : null,
                }));
    console.log(deadlines)
                setComponentDeadlines(deadlines);
            } else {
                const calculated =
                    schema?.grading_components?.map((comp) => {
                        const week = parseInt(comp.scheduled_week);
                        const start = dayjs(cycle.start_date).add(
                            week - 1,
                            "week"
                        );
                        const end =
                            start.day() === 1
                                ? start.add(4, "day")
                                : start.add(6, "day");
                        return {
                            grading_component_id: comp.id,
                            start_date: start,
                            end_date: end,
                        };
                    }) || [];
                setComponentDeadlines(calculated);
            }
        } else {
            form.resetFields();
            setComponentDeadlines([]);
            setStartDate(null);
        }
    }, [cycle, form, gradingSchemas]);

    
    const handleSaveCycleInfo = async (values) => {

        setLoadingCycle(true);
    
        try {
          const payload = {
            ...values,
            start_date: values.start_date.format("YYYY-MM-DD"),
            end_date: values.end_date.format("YYYY-MM-DD"),
            dep_id: user.dep_id,
          };
      
          let res;
          if (cycle) {
            res = await api.put(`/only-thesis-cycles/${cycle.id}`, payload);
            setCycles(cycles.map(c => (c.id === cycle.id ? res.data : c)));
            message.success("Циклийг амжилттай шинэчлэв!");
          } else {
            res = await api.post(`/only-thesis-cycles`, payload);
            setCycles([...cycles, res.data]);
            toast.success("Циклийг амжилттай нэмлээ!");
          }
      
          setEditCycle(res.data); // optionally update selected cycle after save
      
        } catch (err) {
          console.error("Cycle save error", err);
          toast.error("Циклийг хадгалах явцад алдаа гарлаа!");
        } finally {
            setIsEditableCycle(false);
          setLoadingCycle(false);
        }
      };
      
      const handleSaveReminder = async (index) => {
        const reminder = reminders[index];
      
        // 1. ✅ Basic validation
        if (!reminder.title ) {
          message.warning("Гарчиг болон хугацааг заавал бөглөнө үү.");
          return;
        }
      
        try {
          // 2. ✅ Prepare payload for saving
          const payload = {
            thesis_cycle_id: cycle.id,
            component_id: null, // keep empty if global reminder
            title: reminder.title,
            description: reminder.description,
            target_type: reminder.target || "all",
            send_schedules: (reminder.send_schedules || [])
              .filter((s) => s.date && s.time)
              .map((s) => {
                const fullDatetime = s.date
                  .hour(s.time.hour())
                  .minute(s.time.minute())
                  .second(0);
                return { datetime: fullDatetime.toISOString() };
              }),
          };
      console.log("hshs", payload)
          // 3. ✅ Save or update based on existence of reminder.id
          if (reminder.id) {
            console.log("kkkkk")
            await api.patch(`/thesiscycle/reminders/${reminder.id}`, payload);
          } else {
            const res = await api.post("/thesiscycle/reminder/save", payload);
            const newReminder = res.data;
      
            const updated = [...reminders];
            updated[index] = { ...newReminder }; 
            setReminders(updated);
          }
      

          setEditReminderMode((prev) => ({
            ...prev,
            [`global_${index}`]: false,
          }));
      
          message.success("Мэдэгдэл амжилттай хадгалагдлаа.");
        } catch (err) {
          console.error("Reminder save failed", err);
          message.error("Мэдэгдлийг хадгалах үед алдаа гарлаа.");
        }
      };
      


    const columns = [
        {
            title: "#",
            dataIndex: "index",
            render: (_, __, i) => i + 1,
        },
        {
            title: "БСА нэр",
            dataIndex: "name",
        },
        {
            title: "Жил",
            dataIndex: "year",
            render: (_, record) => `${record.year} - ${record.end_year}`,
        },

        {
            title: "Улирал",
            dataIndex: "semester",
        },
        {
            title: "Эхлэх",
            dataIndex: "start_date",
        },
        {
            title: "Дуусах",
            dataIndex: "end_date",
        },

        {
            title: "Үе шат",
            dataIndex: "steps",
            render: (_, record) =>
                record.grading_schema
                    ? `${record.grading_schema.name} (${record.grading_schema.year})`
                    : "—",
        },

        {
            title: "Төлөв",
            dataIndex: "status",
            render: (status) => (
                <Badge
                    status={
                        {
                            Идэвхитэй: "success",
                            Хаагдсан: "default",
                            "Хүлээгдэж буй": "warning",
                            Цуцлагдсан: "error",
                        }[status] || "processing"
                    }
                    text={status}
                />
            ),
        },
    
    ];

    const filteredCycles = cycles.filter(
        (cycle) =>
            (!filterYear || cycle.year.toString() === filterYear) &&
            (!filterSemester || cycle.semester === filterSemester) &&
            (!filterStatus || cycle.status === filterStatus)
    );

    const handleDeadlineChange = (idx, field, value) => {
        const updated = [...componentDeadlines];
        updated[idx][field] = value;
        setComponentDeadlines(updated);
    };

    return (
        <div className="p-6 " style={{ padding: "15px", paddingRight: "48px" }}>
                    <ConfigProvider locale={mnMN}>
           


                <Card>
                   <Steps current={currentStep} style={{ marginBottom: 32 }}>
  <Step title="Улирал сонгох" />
  <Step title="Улирлын мэдээлэл" />
  <Step title="Компонентууд ба заавар" />
  <Step title="Мэдэгдэлүүд" />
</Steps>

{currentStep === 0 && (
  <Spin spinning={loading}>
     <Space size="middle" style={{ marginTop: 20, marginBottom: 20 }}>
                <Input
                    type="number"
                    placeholder="Жилээр шүүх"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    style={{ width: 120 }}
                />
                <Select
                    placeholder="Улирал"
                    value={filterSemester || undefined}
                    onChange={(value) => setFilterSemester(value || "")}
                    style={{ width: 120 }}
                    allowClear
                >
                    <Option value="Хавар">Хавар</Option>
                    <Option value="Намар">Намар</Option>
                </Select>
                <Select
                    placeholder="Төлөв"
                    value={filterStatus || undefined}
                    onChange={(value) => setFilterStatus(value || "")}
                    style={{ width: 150 }}
                    allowClear
                >
                    <Option value="Идэвхитэй">Идэвхитэй</Option>
                    <Option value="Хаагдсан">Хаагдсан</Option>
                    <Option value="Хүлээгдэж буй">Хүлээгдэж буй</Option>
                    <Option value="Цуцлагдсан">Цуцлагдсан</Option>
                </Select>
            </Space>
    <Table
      columns={[
        ...columns,
        {
          title: "Сонгох",
          render: (_, record) => (
            <Button
              type="primary"
              onClick={() => {
                setEditCycle(record);
                setCurrentStep(1); // proceed to next step
              }}
            >
              Сонгох
            </Button>
          ),
        },
      ]}
      dataSource={filteredCycles}
      rowKey="id"
      bordered
      pagination={{ pageSize: 8 }}
    />
  </Spin>
)}


                    <Form
                        layout="vertical"
                        form={form}
              
                        onValuesChange={(changed) => {
                            if (changed.start_date)
                                setStartDate(changed.start_date);
                        }}
                        initialValues={{
                            year: new Date().getFullYear(),
                            end_year: new Date().getFullYear() + 1,
                            semester: "Намар",
                            status: "Идэвхитэй",
                        }}
                    >
                       {currentStep === 1 && cycle && (
                            <CycleStep1_InfoForm
                                form={form}
                                gradingSchemas={gradingSchemas}
                                setSelectedSchema={setSelectedSchema}
                                statusWarning={statusWarning}
                                setStatusWarning={setStatusWarning}
                                editable={editableCycle}
                                onEditClick={() => setIsEditableCycle(!editableCycle)}
                                onSaveClick={handleSaveCycleInfo}
                                loadingCycle={loadingCycle}
                            />
                            
                        )}

                        {currentStep === 2 &&  cycle && (
                            <CycleStep2_ComponentsAndReminders
                                selectedSchema={selectedSchema}
                                cycle={cycle}
                                componentDeadlines={componentDeadlines}
                                setComponentDeadlines={setComponentDeadlines}
                                componentReminders={componentReminders}
                                setComponentReminders={setComponentReminders}
                                setComponentNotes={setComponentNotes}
                            />
                        )}

                        {currentStep === 3 &&   cycle && (
                            <CycleStep3_GlobalReminders
                                reminders={reminders}
                                setReminders={setReminders}
                                editReminderMode={editReminderMode}
                                setEditReminderMode={setEditReminderMode}
                                handleSaveReminder={handleSaveReminder}
                            />
                        )}

                        <div style={{ textAlign: "right", marginTop: 24 }}>
                            {currentStep > 0 && (
                                <Button
                                    style={{ marginRight: 8 }}
                                    onClick={() =>
                                        setCurrentStep(currentStep - 1)
                                    }
                                >
                                    Өмнөх
                                </Button>
                            )}
                            {currentStep < 3 && currentStep > 0 && (
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        setCurrentStep(currentStep + 1)
                                    }
                                >
                                    Дараах
                                </Button>
                            )}
                            {/* {currentStep === 2 && (
                                <Button type="primary" htmlType="submit">
                                    {cycle ? "Хадгалах" : "Үүсгэх"}
                                </Button>
                            )} */}
                        </div>
                    </Form>
                </Card>
        
            </ConfigProvider>
        </div>
    );
};

export default CycleFormPage;
