import React, { useState, useEffect } from "react";
import {
  Modal,
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
} from "antd";

import { ConfigProvider } from "antd";
import mnMN from "antd/es/locale/mn_MN";
import "dayjs/locale/mn";
import dayjs from "dayjs";


import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.locale("mn");
dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

const CycleFormModal = ({ show, onHide, onSubmit, cycle, user, gradingSchemas }) => {
  const [form] = Form.useForm();
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [deadlinesCom, setDeadlineCom] = useState(null);
  const [statusWarning, setStatusWarning] = useState("");
  const [componentDeadlines, setComponentDeadlines] = useState([]);

 

  useEffect(() => {
    if (cycle) {
      form.setFieldsValue({
        ...cycle,
        start_date: dayjs(cycle.start_date),
        end_date: dayjs(cycle.end_date),
      });
      const schema = gradingSchemas.find(s => s.id === parseInt(cycle.grading_schema_id));
      setSelectedSchema(schema);

      
    } else {
      form.resetFields();
    }
  }, [cycle, form, gradingSchemas]);
  useEffect(() => {

    const formStartDate = form.getFieldValue("start_date");
    if (selectedSchema && formStartDate) {
      const calculatedDeadlines = selectedSchema.grading_components.map((comp) => {
        const week = parseInt(comp.scheduled_week);
        const start = dayjs(formStartDate).add(week - 1, "week");
        const end = start.add(4, "day");
        return {
          grading_component_id: comp.id,
          start_date: start,
          end_date: end,
        };
      });
      console.log('calculatedDeadlines',calculatedDeadlines)

      setComponentDeadlines(calculatedDeadlines);
    }

  }, [selectedSchema, form.getFieldValue("start_date")]);
  

  const handleFinish = (values) => {
    const formattedValues = {
      ...values,
      start_date: values.start_date.format("YYYY-MM-DD"),
      end_date: values.end_date.format("YYYY-MM-DD"),
      dep_id: user.dep_id,

    deadlines: componentDeadlines.map((d) => ({
        grading_component_id: d.grading_component_id,
        start_date: d.start_date?.hour(9).minute(0).second(0).utc().toISOString(),   
        end_date: d.end_date?.hour(23).minute(59).second(0).utc().toISOString(),  
      }))
      
      
    };
    console.log("formattedValues",componentDeadlines)
    onSubmit(formattedValues);
  };

  const handleStatusChange = (value) => {
    if (value === "Хаагдсан") {
      setStatusWarning("Энэ циклийг 'Хаагдсан' төлөвт шилжүүлснээр бүх холбоотой дипломын ажлууд автоматаар хаагдах болно.");
    } else {
      setStatusWarning("");
    }
  };

  const handleSchemaChange = (value) => {
    const schema = gradingSchemas.find((s) => s.id === parseInt(value));
    setSelectedSchema(schema);
  };


  const handleDeadlineChange = (idx, field, value) => {
    const updated = [...componentDeadlines];
    updated[idx][field] = value;
    setComponentDeadlines(updated);
  };
  


  return (
    <ConfigProvider locale={mnMN}>
    <Modal
      visible={show}
      onCancel={onHide}
      title={cycle ? "Циклийг засах" : "Шинэ судалгааны ажлын цикл үүсгэх"}
      footer={null}
      width={800}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{
          year: new Date().getFullYear(),
          end_year: new Date().getFullYear() + 1,
          semester: "Намар",
          status: "Идэвхитэй",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="БСА нэр" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="year" label="Хичээлийн жил" rules={[{ required: true }]}>
              <InputNumber min={2000} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="end_year" label="Дуусах жил" rules={[{ required: true }]}>
              <InputNumber min={2000} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="semester" label="Улирал" rules={[{ required: true }]}>
              <Select>
                <Option value="Намар">Намар</Option>
                <Option value="Хавар">Хавар</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="start_date" label="Эхлэх өдөр" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }}     format="YYYY-MM-DD dddd" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="end_date" label="Дуусах өдөр" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }}     format="YYYY-MM-DD dddd" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="grading_schema_id"
              label="Дүгнэх аргачлал"
              rules={[{ required: true }]}
            >
              <Select onChange={handleSchemaChange}>
                {gradingSchemas.map((schema) => (
                  <Option key={schema.id} value={schema.id}>
                    {schema.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Төлөв" rules={[{ required: true }]}>
              <Select onChange={handleStatusChange}>
                <Option value="Идэвхитэй">Идэвхитэй</Option>
                <Option value="Хүлээгдэж буй">Хүлээгдэж буй</Option>
                <Option value="Хаагдсан">Хаагдсан</Option>
                <Option value="Цуцлагдсан">Цуцлагдсан</Option>
              </Select>
            </Form.Item>
            {statusWarning && <Alert message={statusWarning} type="warning" showIcon />}
          </Col>
        </Row>

        {selectedSchema  && (
          <>
            <h5>{selectedSchema.name} ({selectedSchema.year})</h5>
            <Badge count={selectedSchema.grading_components?.length || 0} color="blue" />
            <div style={{ marginTop: 10 }}>
              {selectedSchema.grading_components?.map((comp, idx) => (
                <Card
                  key={idx}
                  title={`${comp.name} (${comp.score}%)`}
                  size="small"
                  style={{ marginBottom: 10 }}
                >
                     <p><strong>7 хоног</strong> {comp.scheduled_week}</p>


     

                     <Row gutter={12}>
  <Col span={12}>
    <Form.Item label="Эхлэх өдөр">
      <DatePicker
        style={{ width: "100%" }}
            format="YYYY-MM-DD dddd"
        value={componentDeadlines[idx]?.start_date}
        onChange={(value) => handleDeadlineChange(idx, "start_date", value)}
      />
    </Form.Item>
  </Col>
  <Col span={12}>
    <Form.Item label="Дуусах өдөр">
      <DatePicker
        style={{ width: "100%" }}
            format="YYYY-MM-DD dddd"
        value={componentDeadlines[idx]?.end_date}
        onChange={(value) => handleDeadlineChange(idx, "end_date", value)}
      />
    </Form.Item>
  </Col>
</Row>


        
                  <p><strong>Дүгнэгч:</strong> {{
                    supervisor: "Удирдагч багш",
                    committee: "Комисс",
                    examiner: "Шүүмж багш"
                  }[comp.by_who]}</p>
                  {comp.grading_criteria?.length > 0 && (
                    <>
                      <p><strong>Шалгуур үзүүлэлтүүд:</strong></p>
                      <ul>
                        {comp.grading_criteria.map((c, i) => (
                          <li key={i}>{c.name} - {c.score} оноо</li>
                        ))}
                      </ul>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}




        <div style={{ textAlign: "right", marginTop: 20 }}>
          <Button onClick={onHide} style={{ marginRight: 8 }}>
            Цуцлах
          </Button>
          <Button type="primary" htmlType="submit">
            {cycle ? "Хадгалах" : "Үүсгэх"}
          </Button>
        </div>
      </Form>
    </Modal>
    </ConfigProvider>
  );
};

export default CycleFormModal;
