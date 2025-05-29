import {
    Layout,
    Tabs,
    Typography,
    Spin,
    notification,
    Table,
    Tag,
    Select,
    Modal,
    Descriptions,
    Button,
    Input
  } from "antd";
  import { useEffect, useState } from "react";
  import "../Main.css";
  import api from "../../context/api_helper";
  
  const { Content } = Layout;
  const { Title } = Typography;

  const STATUS_LABELS = {
    draft: "Ноорог",
    submitted: "Илгээсэн",
    rejected: "Татгалзсан",
    approved: "Зөвшөөрөгдсөн",
  };
  
  function ApproveTopicList() {
    const [activeKey, setActiveKey] = useState("1");
    const [teacherTopics, setTeacherTopics] = useState([]);
    const [studentTopics, setStudentTopics] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [approveComment, setApproveComment] = useState("");
const [rejectComment, setRejectComment] = useState("");
    const handleTabChange = (key) => {
      setActiveKey(key);
      setStatusFilter(null);
    };
  
    const fetchAllTopics = async () => {
      setLoading(true);
      try {
        const [teacherRes, studentRes] = await Promise.all([
          api.get("/proposed-topics/by-teachers/submitted"),
          api.get("/proposed-topics/by-students/submitted"),
        ]);
        setTeacherTopics(teacherRes.data.data);
        setStudentTopics(studentRes.data.data);
      } catch (error) {
        console.error("Failed to fetch topic data", error);
        notification.error({
          message: "Алдаа",
          description: "Сэдвүүдийг татаж чадсангүй. Сүлжээг шалгана уу.",
        });
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchAllTopics();
    }, []);
  
    useEffect(() => {
      const source = activeKey === "1" ? teacherTopics : studentTopics;
      if (statusFilter) {
        setFilteredTopics(source.filter((t) => t.status === statusFilter));
      } else {
        setFilteredTopics(source);
      }
    }, [teacherTopics, studentTopics, activeKey, statusFilter]);
  
    const openModal = (record) => {
      setSelectedTopic(record);
      setIsModalVisible(true);
    };
  
    const closeModal = () => {
      setIsModalVisible(false);
      setSelectedTopic(null);
    };
    const handleReview = async (action, comment = null) => {
        if (!selectedTopic) return;
        setLoading(true);
      
        try {
          await api.post(`/proposed-topics/${selectedTopic.id}/review`, {
            action,
            comment,
          });
      
          notification.success({
            message: "Амжилттай",
            description:
              action === "approved"
                ? "Сэдвийг зөвшөөрлөө."
                : "Сэдвийг татгалзсан.",
          });
      
          closeModal();
          fetchAllTopics(); // дахин ачааллах
        } catch (err) {
          notification.error({
            message: "Алдаа",
            description:
              action === "approved"
                ? "Сэдвийг зөвшөөрөх үед алдаа гарлаа."
                : "Сэдвийг татгалзах үед алдаа гарлаа.",
          });
        } finally {
          setLoading(false);
        }
      };
      
      
  
    const columns = [
      { title: "Гарчиг (MN)", dataIndex: "title_mn" },
      { title: "Гарчиг (EN)", dataIndex: "title_en" },
      { title: "Тайлбар", dataIndex: "description" },
      {
        title: "Дэвшүүлсэн",
        key: "creator",
        render: (_, record) => (
          <span>{record.creator?.lastname} {record.creator?.firstname}</span>
        ),
      },
      {
        title: "Төлөв",
        key: "status",
        render: (_, record) => (
          <Tag
            color={
              record.status === "approved"
                ? "blue"
                : record.status === "submitted"
                ? "green"
                : record.status === "rejected"
                ? "red"
                : "orange"
            }
          >
            {record.statusMn || STATUS_LABELS[record.status]}
          </Tag>
        ),
      },
      {
        title: "Үйлдэл",
        key: "actions",
        render: (_, record) => (
          <Button type="link" onClick={() => openModal(record)}>
            Дэлгэрэнгүй
          </Button>
        ),
      },
    ];
  
    const statusOptions = [
      { value: null, label: "Бүгд" },
      { value: "draft", label: "Ноорог" },
      { value: "submitted", label: "Илгээсэн" },
      { value: "rejected", label: "Татгалзсан" },
      { value: "approved", label: "Зөвшөөрөгдсөн" },
    ];
  
    return (
      <div className="p-4 bg-transparent">
        <header className="text-left mb-4">
          <Title level={3}>Сэдвийн жагсаалт</Title>
        </header>
  
        <Layout className="bg-white rounded-lg p-4">
          <Content className="p-4">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <Tabs
                activeKey={activeKey}
                onChange={handleTabChange}
                items={[
                  { key: "1", label: "Багшийн дэвшүүлсэн сэдвүүд" },
                  { key: "2", label: "Оюутны дэвшүүлсэн сэдвүүд" },
                ]}
              />
              <Select
                placeholder="Төлөв шүүх"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                allowClear
                style={{ width: 180 }}
                options={statusOptions}
              />
            </div>
  
            <Spin spinning={loading}>
              <Table
                rowKey="id"
                dataSource={filteredTopics}
                columns={columns}
                pagination={{ pageSize: 10 }}
                bordered
              />
            </Spin>
            <Modal
  title="Сэдвийн дэлгэрэнгүй"
  open={isModalVisible}
  onCancel={closeModal}
  footer={[
    <Button key="cancel" onClick={closeModal}>
      Хаах
    </Button>,
    <Button
      key="reject"
      danger
      onClick={() => {
        Modal.confirm({
          title: "Татгалзах уу?",
          content: (
            <Input.TextArea
              placeholder="Татгалзах шалтгаан бичнэ үү"
              onChange={(e) => (window.rejectReason = e.target.value)}
            />
          ),
          onOk: () => {
            if (!window.rejectReason || window.rejectReason.trim() === "") {
              notification.warning({
                message: "Анхааруулга",
                description: "Шалтгааныг заавал бичнэ үү.",
              });
              return Promise.reject();
            }
            return handleReview("rejected", window.rejectReason);
          },
          okText: "Татгалзах",
          cancelText: "Болих",
          okButtonProps: { danger: true },
        });
      }}
    >
      Татгалзах
    </Button>,
    <Button
      key="approve"
      type="primary"
      loading={loading}
      onClick={() => handleReview("approved")}
    >
      Зөвшөөрөх
    </Button>,
  ]}
  width={800}
>
  {selectedTopic && (
    <Descriptions bordered column={1}>
      <Descriptions.Item label="Гарчиг (Монгол)">
        {selectedTopic.title_mn}
      </Descriptions.Item>
      <Descriptions.Item label="Гарчиг (Англи)">
        {selectedTopic.title_en}
      </Descriptions.Item>
      <Descriptions.Item label="Товч агуулга">
        {selectedTopic.description}
      </Descriptions.Item>
      <Descriptions.Item label="Дэвшүүлэгч">
        {selectedTopic.creator?.lastname} {selectedTopic.creator?.firstname}
      </Descriptions.Item>
      <Descriptions.Item label="Төлөв">
        {selectedTopic.statusMn || STATUS_LABELS[selectedTopic.status]}
      </Descriptions.Item>
      <Descriptions.Item label="Талбарууд">
        {selectedTopic.field_values.map((fv, i) => (
          <div key={i}>
            <strong>{fv.field?.name}:</strong> {fv.value}
          </div>
        ))}
      </Descriptions.Item>
    </Descriptions>
  )}
</Modal>


          </Content>
        </Layout>
      </div>
    );
  }
  
  export default ApproveTopicList;
  