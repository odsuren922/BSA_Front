import {
    Layout,
    Tabs,
    Typography,
    Spin,
    notification,
    Button,
    Table,
    Select,
  } from "antd";
  import { useEffect, useState } from "react";
  import "../Main.css";
  import { useUser } from "../../context/UserContext";
  import ApproveDetail from "../ApproveDetail";
  import { fetchData, postData } from "../../utils";

  const { Content } = Layout;
  const { Title } = Typography;
  
  const TopicList = () => {
    const { user } = useUser();
    const isStudent = user?.role === "student";
    const isTeacher = user?.role === "teacher";
  
    const [activeKey, setActiveKey] = useState("1");
  
    const [teacherTopics, setTeacherTopics] = useState([]);
    const [studentTopics, setStudentTopics] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState([]);
  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const roleMap = {
      student: "App\\Models\\Student",
      teacher: "App\\Models\\Teacher",
    };
  
    const fetchTopics = async () => {
      setLoading(true);
      try {  
        const teacherRes = await fetchData("proposed-topics/by-teachers/approved");
        console.log("teacherRes", teacherRes);
        setTeacherTopics(teacherRes);
  
        if (isTeacher) {
          const studentRes = await fetchData("proposed-topics/by-students/approved");
          setStudentTopics(studentRes);
        }
      } catch (error) {
        notification.error({
          message: "Алдаа",
          description: "Сэдвүүдийг татаж чадсангүй. Сүлжээг шалгана уу.",
        });
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchTopics();
    }, []);
  
    useEffect(() => {
      let source = [];
  
      if (isStudent) {
        if (activeKey === "1") {
          source = teacherTopics;
        } else if (activeKey === "2") {
          source = teacherTopics.filter((t) =>
            t.topic_requests?.some(
              (req) =>
                req.requested_by_id === user.id &&
                req.requested_by_type === roleMap[user.role]
            )
          );
        }
      } else if (isTeacher) {
        if (activeKey === "1") {
          source = teacherTopics;
        } else if (activeKey === "2") {
          source = studentTopics;
        } else if (activeKey === "3") {
          source = [...teacherTopics, ...studentTopics].filter((t) =>
            t.topic_requests?.some(
              (req) =>
                req.requested_by_id === user.id &&
                req.requested_by_type === roleMap[user.role]
            )
          );
        }
      }
  
      setFilteredTopics(source);
    }, [teacherTopics, studentTopics, activeKey]);
  
    const showDetail = (record) => {
      setSelectedTopic(record);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedTopic(null);
    };
    const handleCancelRequest = async (requestId) => {
        try {
          await postData(`topic-requests/cancel/${requestId}`, {}, "put");
          notification.success({
            message: "Амжилттай",
            description: "Хүсэлт амжилттай цуцлагдлаа.",
          });
          fetchTopics(); // refresh list
        } catch (err) {
          notification.error({
            message: "Алдаа",
            description: "Хүсэлтийг цуцалж чадсангүй.",
          });
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
      {
        title: "Хүсэлт илгээх",
        key: "actions",
        render: (_, record) => {
          const matchingRequest = record.topic_requests?.find(
            (req) =>
              req.requested_by_id === user.id &&
              req.requested_by_type === roleMap[user.role]
          );
      console.log("matchingRequest", matchingRequest);
          if (matchingRequest) {
            if (matchingRequest.status === "approved") {
              return <span style={{ color: "#52c41a", fontWeight: 500 }}>Зөвшөөрөгдсөн</span>;
            }else if (matchingRequest.status === "rejected") {
                return <span style={{ color: "#52c41a", fontWeight: 500 }}>Түтгэлцүүлсэн</span>;
            }
            // else if (matchingRequest.status === "canceled") {
            //     return <span style={{ color: "#52c41a", fontWeight: 500 }}>Цуцалсан</span>;
            // }
            else if (matchingRequest.status === "pending"){
            // Not yet approved → show cancel option
            return (
              <div>
                <span style={{ color: "#faad14", fontWeight: 500 }}>Хүлээгдэж буй</span>
                <Button
                  danger
                  size="small"
                  style={{ marginLeft: 8 }}
                  onClick={() => handleCancelRequest(matchingRequest.id)}
                >
                  Цуцлах
                </Button>
              </div>
            )}
          }
      
          // No request yet → show send button
        // If teacher is viewing another teacher's topic, block sending
if (
    user.role === 'teacher' &&
    record.creator?.id !== user.id &&
    record.creator?.user_type === "teacher"
  ) {
    return <span style={{ color: "#888" }}>Илгээх боломжгүй</span>;
  }
  
  // Otherwise allow sending
  return (
    <Button type="primary" onClick={() => showDetail(record)}>
      Илгээх
    </Button>
  );
  
        },
      }
      
    ];
 const rowClassName = (record) => {
  const matchingRequest = record.topic_requests?.find(
    (req) =>
      req.requested_by_id === user.id &&
      req.requested_by_type === roleMap[user.role]
  );

  if (matchingRequest?.status === "approved") {
    return "row-green"; // Green background for approved
  }

  if (matchingRequest) {
    return "row-blue"; // Blue background for sent requests
  }

  return "";
};

  
    // Tab items based on role
    const tabItems = [];
  
    if (isStudent) {
      tabItems.push(
        { key: "1", label: "Багшийн дэвшүүлсэн сэдвүүд" },
        { key: "2", label: "Миний хүсэлтүүд" }
      );
    }
  
    if (isTeacher) {
      tabItems.push(
        { key: "1", label: "Багшийн дэвшүүлсэн сэдвүүд" },
        { key: "2", label: "Оюутны дэвшүүлсэн сэдвүүд" },
        { key: "3", label: "Миний хүсэлтүүд" }
      );
    }
  
    return (
      <div className="p-4 bg-transparent">
        <header className="text-left mb-4">
          <Title level={3}>Сэдвийн жагсаалт</Title>
        </header>
  
        <Layout className="bg-white rounded-lg p-4">
          <Content className="p-4">
            <Tabs
              activeKey={activeKey}
              onChange={setActiveKey}
              items={tabItems}
              style={{ marginBottom: 16 }}
            />
  
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
          onActionComplete={fetchTopics}
        />
      </div>
    );
  };
  
  export default TopicList;
  