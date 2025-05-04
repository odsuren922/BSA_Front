import React, { useEffect, useState } from "react";
import { Form, Input, Button, Spin, Row, Col, notification } from "antd";
import { fetchData, postData } from "../../utils";
import TextArea from "antd/es/input/TextArea";

function SendPropTopic() {
  const [formData, setFormData] = useState([]);
  const [defData, setDefData] = useState([]);
  const [formId, setFormId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

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
          setFormData(data[0].fields);
          setDefData(data[0].default_fields);
        }
      } catch (error) {
        console.error("Error fetching proposal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposalData();
  }, []);

  const transformToDraftFormat = (values) => {
    const transformedData = [];

    const processDataArray = (dataArray) => {
      dataArray
        .filter((fieldObject) => {
          const targetUser = fieldObject.targetUser;
          return targetUser === "All" || targetUser === "Student";
        })
        .forEach((fieldObject, index) => {
          const displayField = Object.entries(fieldObject).find(
            ([key]) => key !== "targetUser"
          );
          const fieldKey = displayField?.[0] || `field_${index}`;
          const fieldLabel = displayField?.[1] || "";

          const targetUser = fieldObject.targetUser;

          if (values[fieldKey]) {
            transformedData.push({
              field: fieldKey,
              field2: fieldLabel,
              value: values[fieldKey],
              targetUser,
            });
          }
        });
    };

    processDataArray(defData);
    processDataArray(formData);

    return transformedData;
  };

  const saveToDraft = async () => {
    try {
      const values = form.getFieldsValue();
      const draftData = transformToDraftFormat(values);
      await postData("topic/storestudent", {
        form_id: formId,
        status: "draft",
        fields: draftData,
      });
      openNotification(
        "success",
        "Ноорог хадгалагдлаа",
        "Ноорогт амжилттай хадгаллаа."
      );
      form.resetFields();
    } catch (error) {
      console.error("Error saving draft:", error);
      openNotification(
        "error",
        "Хадгалах амжилтгүй",
        "Ноорог хадгалахад алдаа гарлаа."
      );
    }
  };

  const onFinish = async (values) => {
    try {
      const submitData = transformToDraftFormat(values);
      await postData("topic/storestudent", {
        form_id: formId,
        status: "submitted",
        fields: submitData,
      });
      openNotification(
        "success",
        "Илгээх амжилттай",
        "Сэдэв амжилттай илгээгдлээ."
      );
      form.resetFields();
    } catch (error) {
      console.error("Error submitting form:", error);
      openNotification(
        "error",
        "Илгээх амжилтгүй",
        "Сэдэв илгээхэд алдаа гарлаа."
      );
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      <Spin spinning={loading} tip="Loading...">
        <Form
          form={form}
          name="proposeTopicForm"
          onFinish={onFinish}
          layout="vertical"
        >
          <Row
            justify="end"
            gutter={16}
            style={{ marginBottom: "16px", marginTop: "16px" }}
          >
            <Col>
              <Button onClick={saveToDraft}>Ноорогт хадгалах</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                Илгээх
              </Button>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: "16px" }}>
            {/* Тогтмол талбарууд */}
            {defData
              .filter((fieldObject) => {
                const targetUser = fieldObject.targetUser;
                return targetUser === "All" || targetUser === "Student";
              })
              .map((fieldObject, index) => {
                const displayField = Object.entries(fieldObject).find(
                  ([key]) => key !== "targetUser"
                );
                const fieldKey = displayField?.[0] || `def_field_${index}`;
                const fieldLabel = displayField?.[1] || "Талбар";

                return (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8} key={`def-${index}`}>
                    <Form.Item
                      label={fieldLabel}
                      name={fieldKey}
                      rules={[
                        {
                          required: true,
                          message: `${fieldLabel} бөглөнө үү!`,
                        },
                      ]}
                    >
                      <Input placeholder={`${fieldLabel} бөглөнө үү!`} />
                    </Form.Item>
                  </Col>
                );
              })}

            {/* Хувийн талбарууд */}
            {formData
              .filter((fieldObject) => {
                const targetUser = fieldObject.targetUser;
                return targetUser === "All" || targetUser === "Student";
              })
              .map((fieldObject, index) => {
                const displayField = Object.entries(fieldObject).find(
                  ([key]) => key !== "targetUser"
                );
                const fieldKey = displayField?.[0] || `form_field_${index}`;
                const fieldLabel = displayField?.[1] || "Талбар";

                return (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={8}
                    xl={8}
                    key={`form-${index}`}
                  >
                    <Form.Item label={fieldLabel} name={fieldKey}>
                      <TextArea placeholder={`${fieldLabel} бөглөнө үү!`} />
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
