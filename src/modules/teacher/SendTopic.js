import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Spin,
  Row,
  Col,
  Modal,
  Select,
  notification,
} from "antd";
import { fetchData, postData } from "../../utils";
import ProposedTopicsTable from "../../components/proposal/ProposedTopicsTable";
import { useUser } from "../../context/UserContext";

function SendTopic() {
  const [fieldLists, setFieldLists] = useState([]);
  const [proposedTopics, setProposedTopics] = useState([]);
  const [originalTopics, setOriginalTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingField, setLoadingField] = useState(true);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useUser();
  const [editingTopic, setEditingTopic] = useState(null);

  const openNotification = (type, message, description) => {
    notification[type]({ message, description });
  };

  const fetchTopicData = async () => {
    setLoading(true);
    try {
      const data = await fetchData("proposed-topics/byUser");
      setProposedTopics(data);
      setOriginalTopics(data);
    } catch (error) {
      console.error("Error fetching proposal data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProposalData = async () => {
      setLoadingField(true);
      try {
        const data = await fetchData("proposal-fields/active");
        setFieldLists(data);
      } catch (error) {
        console.error("Error fetching proposal data:", error);
      } finally {
        setLoadingField(false);
      }
    };

    fetchProposalData();
    fetchTopicData();
  }, []);

  const showModal = () => {
    setEditingTopic(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleEdit = (topic) => {
    if (topic.status === "submitted") {
      openNotification("warning", "Анхааруулга", "Илгээсэн сэдвийг засварлах боломжгүй.");
      return;
    }
    setEditingTopic(topic);
    setIsModalVisible(true);

    const customFields = {};
    topic.field_values?.forEach((fv) => {
      customFields[`field_${fv.field.id}`] = fv.value;
    });

    form.setFieldsValue({
      title_mn: topic.title_mn,
      title_en: topic.title_en,
      description: topic.description,
      status: topic.status,
      ...customFields,
    });
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        title_mn: values.title_mn,
        title_en: values.title_en,
        description: values.description,
        status: values.status || "draft",
        fields: [],
      };

      fieldLists.forEach((field) => {
        const key = `field_${field.id}`;
        const value = values[key];
        if (value !== undefined && value !== "") {
          payload.fields.push({
            field_id: field.id,
            value: value,
          });
        }
      });

      if (editingTopic) {
        await postData(`proposed-topics/${editingTopic.id}/update`, payload);
        openNotification("success", "Амжилттай", "Сэдэв шинэчлэгдлээ.");
      } else {
        await postData("proposed-topics", payload);
        openNotification("success", "Амжилттай", "Шинэ сэдэв нэмэгдлээ.");
      }

      form.resetFields();
      setIsModalVisible(false);
      fetchTopicData();
    } catch (error) {
      console.error("Error submitting form:", error);
      openNotification("error", "Алдаа", "Мэдээлэл илгээхэд алдаа гарлаа.");
    }
  };

  return (
    <div className="p-4">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button type="primary" onClick={showModal} loading={loadingField}>
          + Сэдэв нэмэх
        </Button>
        <Select
          placeholder="Төлөв шүүх"
          style={{ width: 180 }}
          allowClear
          onChange={(value) => {
            if (!value || value === "all") {
              setProposedTopics(originalTopics);
            } else {
              const filtered = originalTopics.filter((topic) => topic.status === value);
              setProposedTopics(filtered);
            }
          }}
          options={[
            { value: "all", label: "Бүгд" },
            { value: "draft", label: "Ноорог" },
            { value: "submitted", label: "Илгээсэн" },
          ]}
        />
      </div>

      <Spin spinning={loading}>
        <ProposedTopicsTable
          data={proposedTopics}
          setData={setProposedTopics}
          type="owner"
          onEdit={handleEdit}
        />
      </Spin>

      <Modal
        title={editingTopic ? "Сэдэв засах" : "Шинэ сэдэв нэмэх"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            name="proposeTopicForm"
            onFinish={onFinish}
            layout="vertical"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Form.Item
                  label="Сэдвийн нэр (Монгол)"
                  name="title_mn"
                  rules={[{ required: true, message: "Сэдвийн нэр (Монгол) бөглөнө үү!" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Сэдвийн нэр (Англи)"
                  name="title_en"
                  rules={[{ required: true, message: "Сэдвийн нэр (Англи) бөглөнө үү!" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Товч агуулга"
                  name="description"
                  rules={[{ required: true, message: "Товч агуулга бөглөнө үү!" }]}
                >
                  <Input.TextArea rows={4} maxLength={1000} showCount />
                </Form.Item>
              </Col>
              {fieldLists
                .filter((f) => f.targeted_to === user.role || f.targeted_to === "both")
                .map((field) => (
                  <Col xs={24} sm={12} key={field.id}>
                    <Form.Item
                      label={field.name}
                      name={`field_${field.id}`}
                      rules={field.is_required ? [{ required: true, message: `${field.name} бөглөнө үү!` }] : []}
                    >
                      {field.type === "textarea" ? (
                        <Input.TextArea placeholder={`${field.name} бичнэ үү`} />
                      ) : (
                        <Input placeholder={`${field.name} бичнэ үү`} />
                      )}
                    </Form.Item>
                  </Col>
                ))}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Төлөв"
                  name="status"
                  rules={[{ required: true, message: "Төлөв сонгоно уу!" }]}
                  initialValue="draft"
                >
                  <Select
                    options={[
                      { value: "draft", label: "Ноорог" },
                      { value: "submitted", label: "Илгээх" },
                    ]}
                    placeholder="Төлөв сонгоно уу"
                  />
                </Form.Item>
              </Col>
              <Col span={24} style={{ textAlign: "right" }}>
                <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                  Болих
                </Button>
                <Button type="primary" htmlType="submit">
                  Хадгалах
                </Button>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}

export default SendTopic;