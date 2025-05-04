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
  const [form] = Form.useForm();
  const [options, setOptions] = useState([]);

  const openNotification = (type, message, description) => {
    notification[type]({ message, description });
  };

  const fetchProgramData = async () => {
    try {
      const data = await fetchData("department");
      console.log('data', data);
      
      if (data && data.length > 0) {
        const departmentPrograms = JSON.parse(data[0].programs || "[]");
        const formattedOptions = departmentPrograms.map((program) => ({
          value: program.program_id,
          label: program.program_name,
        }));
        setOptions(formattedOptions);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };
  
  useEffect(() => {
    const fetchProposalData = async () => {
      try {

        const data = await fetchData("proposalform");
        console.log("form", data)
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
    fetchProgramData();
  }, []);

  const getFieldKeyAndLabel = (fieldObject, index, prefix) => {
    const displayField = Object.entries(fieldObject).find(
      ([key]) => key !== "targetUser"
    );
    const fieldKey = displayField?.[0] || `${prefix}_field_${index}`;
    const fieldLabel = displayField?.[1] || "Талбар";
    return { fieldKey, fieldLabel };
  };

  const transformToDraftFormat = (values) => {
    const transformedData = [];

    const processDataArray = (dataArray) => {
      dataArray
        .filter(
          (fieldObject) =>
            fieldObject.targetUser === "All" ||
            fieldObject.targetUser === "Teacher"
        )
        .forEach((fieldObject, index) => {
          const { fieldKey, fieldLabel } = getFieldKeyAndLabel(
            fieldObject,
            index,
            "draft"
          );
          if (values[fieldKey] && fieldKey !== "target_program") {
            transformedData.push({
              field: fieldKey,
              field2: fieldLabel,
              value: values[fieldKey],
              targetUser: fieldObject.targetUser,
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
      const targetProgram = values["target_program"] || [];
      await postData("topic/storeteacher", {
        form_id: formId,
        status: "draft",
        fields: draftData,
        program: targetProgram,
      });
      openNotification(
        "success",
        "Ноорог хадгалсан",
        "Ноорог амжилттай хадгалагдлаа."
      );
      form.resetFields();
    } catch (error) {
      console.error("Error saving draft:", error);
      openNotification("error", "Алдаа", "Ноорог хадгалах явцад алдаа гарлаа.");
    }
  };

  const onFinish = async (values) => {
    try {
      const submitData = transformToDraftFormat(values);
      const targetProgram = values["target_program"] || [];
      await postData("topic/storeteacher", {
        form_id: formId,
        status: "submitted",
        fields: submitData,
        program: targetProgram,
      });
      openNotification(
        "success",
        "Амжилттай",
        "Сэдэв амжилттай илгээгдлээ."
      );
      form.resetFields();
    } catch (error) {
      console.error("Error submitting form:", error);
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
        <Form
          form={form}
          name="proposeTopicForm"
          onFinish={onFinish}
          layout="vertical"
        >
          <Row justify="end" gutter={16} style={{ margin: "16px 0" }}>
            <Col>
              <Button onClick={saveToDraft}>Ноорогт хадгалах</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                Илгээх
              </Button>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* Тогтмол талбарууд */}
            {defData
              .filter(
                (field) =>
                  field.targetUser === "All" || field.targetUser === "Teacher"
              )
              .map((fieldObject, index) => {
                const { fieldKey, fieldLabel } = getFieldKeyAndLabel(
                  fieldObject,
                  index,
                  "def"
                );

                return (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={8}
                    xl={8}
                    key={`def-${index}`}
                  >
                    {fieldKey === "target_program" ? (
                      <Form.Item label={fieldLabel} name={fieldKey}>
                        <Select
                          mode="multiple"
                          placeholder="Зорилтот хөтөлбөр сонгоно уу"
                          onChange={handleSelectChange}
                          options={[{ value: "all", label: "Бүгд" }, ...options]}
                        />
                      </Form.Item>
                    ) : (
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
                    )}
                  </Col>
                );
              })}

            {/* Захиалгат талбарууд */}
            {formData
              .filter(
                (field) =>
                  field.targetUser === "All" || field.targetUser === "Teacher"
              )
              .map((fieldObject, index) => {
                const { fieldKey, fieldLabel } = getFieldKeyAndLabel(
                  fieldObject,
                  index,
                  "form"
                );

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

export default SendTopic;
