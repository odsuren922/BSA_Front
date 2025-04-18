import React, { useEffect, useState } from "react";
import { Form, Input, Button, Spin, Row, Col, notification } from "antd";
import { fetchData, postData } from "../../utils";
import TextArea from "antd/es/input/TextArea";
import { useUser } from "../../context/UserContext";

function SendPropTopic() {
  const [formData, setFormData] = useState([]);
  const [defData, setDefData] = useState([]);
  const [formId, setFormId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { user } = useUser(); // Оюутны мэдээлэл авах

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  useEffect(() => {
    const fetchProposalData = async () => {
      try {
        setLoading(true);
        const data = await fetchData("proposalform");
        if (data && data[0]) {
          setFormId(data[0].id);
          setFormData(data[0].fields || []);
          setDefData(data[0].default_fields || []);
        }
      } catch (error) {
        console.error("Error fetching proposal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposalData();
  }, []);

  const transformToFieldArray = (values) => {
    const transformed = [];

    const processFieldList = (list) => {
      list
        .filter((fieldObj) => {
          const target = fieldObj.targetUser;
          return target === "All" || target === "Student";
        })
        .forEach((fieldObj) => {
          const field = Object.keys(fieldObj)[0];
          const field2 = Object.values(fieldObj)[0];
          const targetUser = fieldObj.targetUser;

          if (values[field]) {
            transformed.push({
              field,
              field2,
              value: values[field],
              targetUser,
            });
          }
        });
    };

    processFieldList(defData);
    processFieldList(formData);

    return transformed;
  };

  const handleSave = async (status) => {
    try {
      const values = await form.validateFields();

      const payload = {
        form_id: formId,
        status: status,
        fields: transformToFieldArray(values),
        created_by_id: user?.id,
        created_by_type: "student",
      };

      await postData("topic/store", payload);

      openNotification(
        "success",
        status === "submitted" ? "Амжилттай илгээгдлээ" : "Ноорог хадгалагдлаа",
        status === "submitted"
          ? "Таны сэдэв илгээгдлээ. Хянагч багш хянаж батлах болно."
          : "Ноорогт хадгаллаа. Дараа үргэлжлүүлэн илгээж болно."
      );

      form.resetFields();
    } catch (error) {
      console.error("Error saving:", error);
      openNotification("error", "Алдаа", "Хадгалах явцад алдаа гарлаа.");
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Spin spinning={loading} tip="Ачааллаж байна...">
        <Form form={form} name="studentProposalForm" layout="vertical">
          <Row justify="end" gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              <Button onClick={() => handleSave("draft")}>Ноорогт хадгалах</Button>
            </Col>
            <Col>
              <Button type="primary" onClick={() => handleSave("submitted")}>
                Илгээх
              </Button>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {[...defData, ...formData]
              .filter((fieldObj) => {
                const target = fieldObj.targetUser;
                return target === "All" || target === "Student";
              })
              .map((fieldObj, index) => {
                const field = Object.keys(fieldObj)[0];
                const label = Object.values(fieldObj)[0];
                const isTextarea = label.toLowerCase().includes("агуулга") || label.length > 20;

                return (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <Form.Item
                      label={label}
                      name={field}
                      rules={[
                        {
                          required: true,
                          message: `${label} талбарыг бөглөнө үү.`,
                        },
                      ]}
                    >
                      {isTextarea ? (
                        <TextArea placeholder={`${label} бичнэ үү`} />
                      ) : (
                        <Input placeholder={`${label} бичнэ үү`} />
                      )}
                    </Form.Item>
                  </Col>
                );
              })}
          </Row>
        </Form>
      </Spin>
    </div>
  );
}

export default SendPropTopic;
