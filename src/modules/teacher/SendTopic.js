import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Spin,
  Row,
  Col,
  Select,
  notification,
} from "antd";
import { fetchData, postData } from "../../utils";
import TextArea from "antd/es/input/TextArea";

function SendTopic() {
  const [formData, setFormData] = useState([]);
  const [defData, setDefData] = useState([]);
  const [formId, setFormId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [form] = Form.useForm();

  const openNotification = (type, message, description) => {
    notification[type]({ message, description });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [formRes, deptRes] = await Promise.all([
          fetchData("api/proposalform"),
          fetchData("api/department"),
        ]);

        if (formRes?.[0]) {
          setFormId(formRes[0].id);
          setFormData(formRes[0].fields || []);
          setDefData(formRes[0].default_fields || []);
        }

        if (deptRes?.[0]) {
          const programs = JSON.parse(deptRes[0].programs || "[]");
          const formatted = programs.map((p) => ({
            value: p.program_id,
            label: p.program_name,
          }));
          setOptions(formatted);
        }
      } catch (error) {
        console.error("Error fetching init data:", error);
        openNotification("error", "Алдаа", "Өгөгдөл татахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const transformFields = (values) => {
    const transformed = [];

    const process = (arr) => {
      arr.forEach((obj) => {
        const key = Object.keys(obj)[0];
        const label = Object.values(obj)[0];
        const target = obj.targetUser;

        if ((target === "All" || target === "Teacher") && values[key] && key !== "target_program") {
          transformed.push({
            field: key,
            field2: label,
            value: values[key],
            targetUser: target,
          });
        }
      });
    };

    process(defData);
    process(formData);

    return transformed;
  };

  const handleSaveOrSubmit = async (type) => {
    try {
      const values = form.getFieldsValue();
      const fieldData = transformFields(values);
      const programField = values["target_program"] || [];

      await postData("topic/storeteacher", {
        form_id: formId,
        status: type,
        fields: fieldData,
        program: programField,
      });

      openNotification(
        "success",
        type === "submitted" ? "Амжилттай илгээгдлээ" : "Ноорог хадгаллаа",
        "Сэдэв амжилттай хадгалагдлаа."
      );
      form.resetFields();
    } catch (err) {
      console.error("Submit error:", err);
      openNotification("error", "Алдаа", "Сэдэв илгээхэд алдаа гарлаа.");
    }
  };

  const handleSelectChange = (value) => {
    if (value.includes("all")) {
      const allValues = options.map((opt) => opt.value);
      form.setFieldsValue({ target_program: allValues });
    } else {
      form.setFieldsValue({ target_program: value });
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Spin spinning={loading} tip="Loading...">
        <Form form={form} layout="vertical" onFinish={() => handleSaveOrSubmit("submitted")}>
          <Row justify="end" gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              <Button onClick={() => handleSaveOrSubmit("draft")}>Ноорогт хадгалах</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">Илгээх</Button>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {[...defData, ...formData]
              .filter(({ targetUser }) => targetUser === "All" || targetUser === "Teacher")
              .map((fieldObj, i) => {
                const key = Object.keys(fieldObj)[0];
                const label = Object.values(fieldObj)[0];

                return (
                  <Col xs={24} sm={12} md={8} key={`field-${key}-${i}`}>
                    {key === "target_program" ? (
                      <Form.Item label={label} name={key}>
                        <Select
                          mode="multiple"
                          placeholder="Зорилтот хөтөлбөрүүд"
                          onChange={handleSelectChange}
                          options={[{ value: "all", label: "Бүгд" }, ...options]}
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        label={label}
                        name={key}
                        rules={[{ required: true, message: `${label} бөглөнө үү!` }]}
                      >
                        {label.length > 40 ? (
                          <TextArea rows={4} placeholder={`${label} бичнэ үү`} />
                        ) : (
                          <Input placeholder={`${label} бичнэ үү`} />
                        )}
                      </Form.Item>
                    )}
                  </Col>
                );
              })}
          </Row>
        </Form>
      </Spin>
    </div>
  );
}

export default SendTopic;
