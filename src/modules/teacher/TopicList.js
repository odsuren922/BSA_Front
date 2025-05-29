import {
    Layout,
    Tabs,
    Typography,
    Spin,
    notification,
    Button,
    Table,
    Tag,
    Select,
  } from "antd";
  import { useEffect, useState } from "react";
  import "../Main.css";
  import api from "../../context/api_helper";
  import { useUser } from "../../context/UserContext";
  import ApproveDetail from "../ApproveDetail";
  
  const { Content } = Layout;
  const { Title } = Typography;
  
  const STATUS_LABELS = {
    draft: "Ноорог",
    submitted: "Илгээсэн",
    rejected: "Татгалзсан",
    approved: "Зөвшөөрөгдсөн",
  };
  
  function TopicList() {
    const { user } = useUser();

    const [activeKey, setActiveKey] = useState(user?.role === "student" ? "1" : "2");

    const [teacherTopics, setTeacherTopics] = useState([]);
    const [studentTopics, setStudentTopics] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);
    const [requestFilter, setRequestFilter] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const handleTabChange = (key) => {
      setActiveKey(key);
      setStatusFilter(null);
    };
  
    const fetchAllTopics = async () => {
      setLoading(true);
      try {
        const [teacherRes, studentRes] = await Promise.all([
          api.get("/proposed-topics/by-teachers/approved"),
          api.get("/proposed-topics/by-students/approved"),
        ]);
        console.log("Teacher Topics:", teacherRes.data.data);
        console.log("Student Topics:", studentRes.data.data);
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
  
    // useEffect(() => {
    //   const source = activeKey === "1" ? teacherTopics : studentTopics;
    //   if (statusFilter) {
    //     setFilteredTopics(source.filter((t) => t.status === statusFilter));
    //   } else {
    //     setFilteredTopics(source);
    //   }
    // }, [teacherTopics, studentTopics, activeKey, statusFilter]);
  
    useEffect(() => {
        const source =
        user.role === "student" ? teacherTopics : studentTopics;
            
        const roleMap = {
          student: "App\\Models\\Student",
          teacher: "App\\Models\\Teacher",
        };
      
        let filtered = [...source];
      
        if (requestFilter === "requested") {
          filtered = filtered.filter((t) =>
            t.topic_requests?.some(
              (req) =>
                req.requested_by_id === user.id &&
                req.requested_by_type === roleMap[user.role]
            )
          );
        } else if (requestFilter === "not_requested") {
          filtered = filtered.filter(
            (t) =>
              !t.topic_requests?.some(
                (req) =>
                  req.requested_by_id === user.id &&
                  req.requested_by_type === roleMap[user.role]
              )
          );
        }
      
        setFilteredTopics(filtered);
      }, [teacherTopics, studentTopics, activeKey, requestFilter]);
      
    const showDetail = (record) => {
      setSelectedTopic(record);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedTopic(null);
    };
  
    const columns = [
      { title: "Гарчиг (MN)", dataIndex: "title_mn" },
      { title: "Гарчиг (EN)", dataIndex: "title_en" },
      { title: "Тайлбар", dataIndex: "description" },
      {
        title: "Дэвшүүлсэн",
        key: "creator",
        render: (_, record) => (
          <span>
            {record.creator?.lastname} {record.creator?.firstname}
          </span>
        ),
      },
      {
        title: "Талбарууд",
        key: "field_values",
        render: (_, record) => (
          <div>
            {record.field_values?.map((fv, index) => (
              <div key={index}>
                <strong>{fv.field?.name}:</strong> {fv.value}
              </div>
            ))}
          </div>
        ),
      },
    //   {
    //     title: "Төлөв",
    //     key: "status",
    //     render: (_, record) => (
    //       <Tag
    //         color={
    //           record.status === "approved"
    //             ? "blue"
    //             : record.status === "submitted"
    //             ? "green"
    //             : record.status === "rejected"
    //             ? "red"
    //             : "orange"
    //         }
    //       >
    //         {record.statusMn || STATUS_LABELS[record.status]}
    //       </Tag>
    //     ),
    //   },
      {
        title: "Хүсэлт илгээх",
        key: "actions",
        render: (_, record) => {
          const roleMap = {
            student: "App\\Models\\Student",
            teacher: "App\\Models\\Teacher",
          };
      
          const matchingRequest = record.topic_requests?.find(
            (req) =>
              req.requested_by_id === user.id &&
              req.requested_by_type === roleMap[user.role]
          );
      
          if (matchingRequest) {
            return <span style={{ color: "#faad14", fontWeight: 500 }}>Хүсэлт илгээсэн</span>;
          }
      
          return (
            <Button type="primary" onClick={() => showDetail(record)}>
              Илгээх
            </Button>
          );
        },
      }
      
    ];
  
    const statusOptions = [
      { value: null, label: "Бүгд" },
      { value: "draft", label: "Ноорог" },
      { value: "submitted", label: "Илгээсэн" },
      { value: "rejected", label: "Татгалзсан" },
      { value: "approved", label: "Зөвшөөрөгдсөн" },
    ];
  
    const rowClassName = (record) => {
        const roleMap = {
          student: "App\\Models\\Student",
          teacher: "App\\Models\\Teacher",
        };
      
        const matchingRequest = record.topic_requests?.find(
          (req) =>
            req.requested_by_id === user.id &&
            req.requested_by_type === roleMap[user.role]
        );
      
        if (matchingRequest) {
          return "row-blue";
        }
      
        return "";
      };
      
  
    return (
      <div className="p-4 bg-transparent">
        <header className="text-left mb-4">
          <Title level={3}>Сэдвийн жагсаалт</Title>
        </header>
  
        <Layout className="bg-white rounded-lg p-4">
          <Content className="p-4">
            <div
              style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}
            >
              <Tabs
  activeKey={activeKey}
  onChange={handleTabChange}
  items={
    user.role === "student"
      ? [{ key: "1", label: "Багшийн дэвшүүлсэн сэдвүүд" }]
      : [{ key: "2", label: "Оюутны дэвшүүлсэн сэдвүүд" }]
  }
/>

              {/* <Select
                placeholder="Төлөв шүүх"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                allowClear
                style={{ width: 180 }}
                options={statusOptions}
              /> */}
              <Select
  placeholder="Хүсэлтийн төлөв"
  value={requestFilter}
  onChange={(val) => setRequestFilter(val)}
  allowClear
  style={{ width: 220 }}
  options={[
    { value: null, label: "Бүгд" },
    { value: "requested", label: "Хүсэлт илгээсэн" },
    { value: "not_requested", label: "Хүсэлт илгээгээгүй" },
  ]}
/>

            </div>
  
            <Spin spinning={loading}>
              <Table
                rowKey="id"
                dataSource={filteredTopics}
                columns={columns}
                pagination={{ pageSize: 10 }}
                bordered
                rowClassName={rowClassName}
              />
            </Spin>
          </Content>
        </Layout>
  
        <ApproveDetail
          isModalOpen={isModalOpen}
          data={selectedTopic}
          onClose={closeModal}
          onActionComplete={fetchAllTopics}
        />
      </div>
    );
  }
  
  export default TopicList;
  