import {
    Layout,
    Typography,
    Spin,
    notification,
    Tag,
    Select,
    Button,
    Collapse,
    Card,
    Table,
    Modal,

    Badge,
    Col,
    Row
} from "antd";
import { useEffect, useState } from "react";
import "../Main.css";
import dayjs from "dayjs";

import { fetchData, postData } from "../../utils";
const { Content } = Layout;
const { Title } = Typography;
const { Panel } = Collapse;

const STATUS_LABELS = {
    draft: "Ноорог",
    submitted: "Илгээсэн",
    rejected: "Татгалзсан",
    approved: "Зөвшөөрөгдсөн",
    chosen :'Сонгогдсон',
};

function ApprovedTopic() {
    const [teacherTopics, setTeacherTopics] = useState([]);
    const [filteredTopics, setFilteredTopics] = useState([]);
    const [statusFilter, setStatusFilter] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTeacherTopics = async () => {
        setLoading(true);
        try {
            const res  = await fetchData("proposed-topics/byUser");
            setTeacherTopics(res);
        } catch (error) {
            notification.error({
                message: "Алдаа",
                description: "Сэдвүүдийг татаж чадсангүй.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeacherTopics();
    }, []);

    useEffect(() => {
        setFilteredTopics(
            statusFilter
                ? teacherTopics.filter((t) => t.status === statusFilter)
                : teacherTopics
        );
    }, [teacherTopics, statusFilter]);
    const handleConfirm = (request) => {
        Modal.confirm({
          title: "Та итгэлтэй байна уу?",
          content: "Энэ хүсэлтийг зөвшөөрвөл бусад хүсэлтүүд татгалзагдана.",
          okText: "Тийм, зөвшөөрөх",
          cancelText: "Болих",
          onOk: async () => {
            try {
                await postData(`proposal-topic-requests/${request.id}/approve`, {}, "put");
                notification.success({
                message: "Амжилттай",
                description: "Сэдвийг амжилттай зөвшөөрлөө.",
              });
              fetchTeacherTopics(); // Refresh list
            } catch (error) {
              notification.error({
                message: "Алдаа",
                description: "Зөвшөөрөх үед алдаа гарлаа.",
              });
            }
          },
        });
      };
      
      
    const statusOptions = [
        { value: null, label: "Бүгд" },
        { value: "draft", label: "Ноорог" },
        { value: "submitted", label: "Илгээсэн" },
        { value: "rejected", label: "Татгалзсан" },
        { value: "approved", label: "Зөвшөөрөгдсөн" },
        { value: "chosen", label: "Сонгогдсон" },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
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
  <Collapse accordion>
    {filteredTopics.map((topic) => {
      const latestLog = topic.approval_logs?.[0]; // хамгийн сүүлийн log

      return (
        <Panel
          key={topic.id}
          header={
            <Badge count={topic.topic_requests?.length || 0} offset={[10, 0]}  color="#faad14">
              <span>{`${topic.title_mn} `}</span>
            </Badge>
          }
          
          extra={
            <Tag
              color={
                topic.status === "approved"
                  ? "blue"
                  : topic.status === "submitted"
                  ? "orange"
                  : topic.status === "rejected"
                  ? "red"
                  :topic.status === "chosen"
                  ? "green"
                  : "default"
              }
            >
              {STATUS_LABELS[topic.status]}
            </Tag>
          }
        >
          <Card bordered size="small" >
        
      <Row gutter={[16, 16]} style={{ marginBottom: "16px", marginTop: "16px"}}>
      
          <Col span={16}>
            <div>
              <strong>Гарчиг(монгол)</strong>
              <div style={{ color: "#595959", fontWeight: 500 }}>{topic.title_mn}</div>
            </div>
          </Col>
          <Col span={16}>
            <div>
              <strong>Гарчиг (англи)</strong>
              <div style={{ color: "#595959", fontWeight: 500 }}>{topic.title_en}</div>
            </div>
          </Col>
          <Col span={16}>
            <div>
              <strong>Тайлбар</strong>
              <div style={{ color: "#595959", fontWeight: 500 }}>{topic.description}</div>
            </div>
          </Col>
      </Row>


{topic.approval_logs?.length > 0 && (
  <>
    <h5 style={{ marginTop: 10 }}>Баталгаажуулалтын түүх</h5>
    {topic.approval_logs.map((log, index) => (
      <div key={index} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: "3px solid #91d5ff" }}>
       <p>
  <strong>Үйлдэл:</strong> {log.action === "approved" ? "Зөвшөөрсөн" : "Татгалзсан"} —{" "}
 {dayjs(log.acted_at).format("YYYY-MM-DD HH:mm")}
</p>
{log.comment && (
          <p>
            <strong>Тайлбар:</strong> {log.comment}
          </p>
        )}
        <p>
          <strong>Шийдвэр гаргасан:</strong> {log.reviewer?.lastname} овогтой {log.reviewer?.firstname}
        </p>
        
      </div>
    ))}
  </>
)}


{topic.topic_requests.length > 0 && (
  <>
    <h5 style={{ marginTop: 10 }}>Хүсэлт илгээсэн мэдээлэл</h5>

    <Table
      size="small"
      bordered
      rowKey={(record) => record.id}
      dataSource={topic.topic_requests}
      pagination={false}
      columns={[
        {
          title: "№",
          render: (_, __, index) => index + 1,
        },
        {
          title: "Овог",
          dataIndex: ["requested_by", "lastname"],
        },
        {
          title: "Нэр",
          dataIndex: ["requested_by", "firstname"],
        },
        {
          title: "Тайлбар",
          dataIndex: "req_note",
          render: (text) => text || "-",
        },
        {
            title: "Үйлдэл",
            key: "action",
            render: (_, record) => (
              <Button
                type="primary"
                size="small"
                onClick={() => handleConfirm(record)}
              >
                Зөвшөөрөх
              </Button>
            ),
          }
          
      ]}
    />
  </>
)}

          </Card>
        </Panel>
      );
    })}
  </Collapse>
</Spin>

        </div>
    );
}

export default ApprovedTopic;
