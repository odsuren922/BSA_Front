import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Select, Alert, Row, Col } from "antd";
import { CalculatorOutlined } from "@ant-design/icons";
import api from "../../context/api_helper";
import { toast } from "react-toastify";
import { Trash } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;
const { TextArea } = Input;

const SchemaEditorModal = ({ open, onCancel, onSuccess, schema ,user}) => {
  const [form] = Form.useForm();
  const [components, setComponents] = useState([]);

  useEffect(() => {
    if (schema) {
      form.setFieldsValue({
        name: schema.name,
        description: schema.description || "",
        year: schema.year,
      });
      setComponents(schema.grading_components || []);
    } else {
      form.resetFields();
      setComponents([]);
    }
  }, [schema, form]);

  const handleAddComponent = () => {
    setComponents([
      ...components,
      { name: "", score: "", by_who: "supervisor", scheduled_week: "" },
    ]);
  };

  const calculateTotal = () => {
    return components.reduce((sum, comp) => sum + Number(comp.score || 0), 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
  
      // Check if any component is incomplete
      for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        if (!comp.name || !comp.score || !comp.by_who || !comp.scheduled_week) {
          toast.error(`Үнэлгээний задаргаа #${i + 1} дутуу байна. Бүх талбарыг бөглөнө үү.`);
          return;
        }
      }
  
    //   const formData = {
    //     ...values,
    //     grading_components: components,
    //     dep_id: user.dep_id,
    //   };
    const formData = {
        ...values,
        grading_components: components.map((comp) => ({
          ...comp,
          description: comp.description?.trim() === "" ? null : comp.description,
        })),
        dep_id: user.dep_id,
      };
      
  
      if (schema) {
        await api.put(`/grading-schemas/${schema.id}`, formData);
      } else {
        await api.post("/grading-schemas", formData);
      }
  
      onSuccess();
      toast.success("Схемийг амжилттай хадгаллаа!");
    } catch (error) {
      toast.error("Схемийг хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
      console.error(error);
    }
  };
  
  

  return (
    <Modal
      title={
        <>
          <CalculatorOutlined className="me-2" />
          {schema ? "Үнэлгээний задаргаа аргачлалг засах" : "Шинээр үнэлгээний задаргаа үүсгэх"}
        </>
      }
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Цуцлах
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {schema ? "Өөрчлөлт хадгалах" : "Схем үүсгэх"}
        </Button>,
      ]}
      width={1000}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Схемийн нэр"
              rules={[{ required: true, message: "Схемийн нэрийг оруулна уу" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="year"
              label="Он"
              rules={[{ required: true, message: "Оныг оруулна уу" }]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="description" label="Тайлбар">
          <TextArea rows={3} />
        </Form.Item>

        <div className="ant-divider" />
        <h4>Үнэлгээний задаргаа</h4>
        
        {components.map((component, compIndex) => (
          <div key={compIndex} className="ant-card ant-card-bordered" style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Input
                  placeholder="Нэр"
                  value={component.name}
                  onChange={(e) => {
                    const updated = [...components];
                    updated[compIndex].name = e.target.value;
                    setComponents(updated);
                  }}
                />
              </Col>
              <Col span={4}>
                <Input
                  type="number"
                  placeholder="Оноо %"
                  value={component.score}
                  onChange={(e) => {
                    const updated = [...components];
                    updated[compIndex].score = e.target.value;
                    setComponents(updated);
                  }}
                />
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: '100%' }}
                  value={component.by_who}
                  onChange={(value) => {
                    const updated = [...components];
                    updated[compIndex].by_who = value;
                    setComponents(updated);
                  }}
                >
                  <Option value="supervisor">Удирдагч багш</Option>
                  <Option value="committee">Комисс</Option>
                  <Option value="examiner">Шүүмж багш</Option>
                </Select>
              </Col>
              <Col span={4}  style={{ marginTop: 16 }} >
                <Input
                  placeholder="Долоо хоног"
                  value={component.scheduled_week}
                  onChange={(e) => {
                    const updated = [...components];
                    updated[compIndex].scheduled_week = e.target.value;
                    setComponents(updated);
                  }}
                />
              </Col>
              <Col span={18}>
                <TextArea
                  placeholder="Тайлбар"
                  value={component.description}
                  onChange={(e) => {
                    const updated = [...components];
                    updated[compIndex].description = e.target.value;
                    setComponents(updated);
                  }}
                />

              </Col>
              <Col span={2}>
                <Button
                  danger
                  icon={<Trash size={16} />}
                  onClick={() => {
                    const updated = components.filter((_, index) => index !== compIndex);
                    setComponents(updated);
                  }}
                />
              </Col>
            </Row>
          </div>
        ))}

        <Button onClick={handleAddComponent} type="primary" style={{ width: '20%', marginBottom: 16 }}>
          Задаргаа нэмэх
        </Button>

        <Alert
          message={`Нийт жин: ${calculateTotal()}%`}
          type={calculateTotal() === 100 ? "success" : "error"}
          showIcon
        />
      </Form>
    </Modal>
  );
};

export default SchemaEditorModal;