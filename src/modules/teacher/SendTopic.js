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
<<<<<<< HEAD
  const [options, setOptions] = useState([]);
  const [form] = Form.useForm();
=======
  const [form] = Form.useForm();
  const [options, setOptions] = useState([]);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

  const openNotification = (type, message, description) => {
    notification[type]({ message, description });
  };

<<<<<<< HEAD
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
=======
  const fetchProgramData = async () => {
    try {
      const data = await fetchData("api/department");
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
        if (data && data[0]) {
          setFormId(data[0].id);
          setFormData(data[0].fields);
          setDefData(data[0].default_fields);
        }
      } catch (error) {
        console.error("Error fetching proposal data:", error);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
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
=======
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
<<<<<<< HEAD
        <Form form={form} layout="vertical" onFinish={() => handleSaveOrSubmit("submitted")}>
          <Row justify="end" gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              <Button onClick={() => handleSaveOrSubmit("draft")}>Ноорогт хадгалах</Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">Илгээх</Button>
=======
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
<<<<<<< HEAD
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
=======
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
                          onChange={handleSelectChange}
                          options={[{ value: "all", label: "Бүгд" }, ...options]}
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item
<<<<<<< HEAD
                        label={label}
                        name={key}
                        rules={[{ required: true, message: `${label} бөглөнө үү!` }]}
                      >
                        {label.length > 40 ? (
                          <TextArea rows={4} placeholder={`${label} бичнэ үү`} />
                        ) : (
                          <Input placeholder={`${label} бичнэ үү`} />
                        )}
=======
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
                      </Form.Item>
                    )}
                  </Col>
                );
              })}
<<<<<<< HEAD
=======

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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
          </Row>
        </Form>
      </Spin>
    </div>
  );
}

export default SendTopic;
