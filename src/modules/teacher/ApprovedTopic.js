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
    rejected: "Татгалзсан",
    approved: "Зөвшөөрөгдсөн",
    chosen :'Сонгогдсон',
};

function ApprovedTopic({ originalTopics, fetchTopicData, loading }) {

    const [statusFilter, setStatusFilter] = useState(null);
    const [cycleFilter, setCycleFilter] = useState(null);
    const [requestCycleFilter, setRequestCycleFilter] = useState(null);

    const filteredTopics = originalTopics.filter((t) => {
        const matchStatus = statusFilter ? t.status === statusFilter : true;
        const matchCycle = cycleFilter ? t.thesis_cycle?.id === cycleFilter : true;
      
        // 🔍 topic_requests дотор thesis_cycle байгаа эсэхийг шалгах
        const matchRequestCycle = requestCycleFilter
          ? t.topic_requests?.some(
              (r) => r.thesis_cycle?.id === requestCycleFilter
            )
          : true;
      
        return matchStatus && matchCycle && matchRequestCycle;
      });
      
      
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
              fetchTopicData(); // Refresh list
            } catch (error) {
              notification.error({
                message: "Алдаа",
                description: "Зөвшөөрөх үед алдаа гарлаа.",
              });
            }
          },
        });
      };
      const handleDecline = (request) => {
        Modal.confirm({
          title: "Та итгэлтэй байна уу?",
          content: "Энэ сэдэвт сонгогдсон оюутныг татгалзуулах уу?",
          okText: "Тийм, татгалзуулах",
          cancelText: "Болих",
          onOk: async () => {
            try {
              await postData(`proposal-topic-requests/${request.id}/decline`, {}, "put");
              notification.success({
                message: "Амжилттай",
                description: "Сонгогдсон хүсэлтийг татгалзав.",
              });
              fetchTopicData();
            } catch (error) {
              notification.error({
                message: "Алдаа",
                description: "Татгалзуулах үед алдаа гарлаа.",
              });
            }
          },
        });
      };
      const handleArchive = (topic) => {
        Modal.confirm({
          title: "Та итгэлтэй байна уу?",
          content: "Энэ сэдвийг архивлах уу?",
          okText: "Архивлах",
          cancelText: "Болих",
          onOk: async () => {
            try {
              await postData(`proposed-topics/${topic.id}/archive`, {}, "put");
              notification.success({
                message: "Архивлагдлаа",
                description: "Сэдвийг амжилттай архивлав.",
              });
              fetchTopicData();
            } catch (error) {
              notification.error({
                message: "Алдаа",
                description: "Архивлах үед алдаа гарлаа.",
              });
            }
          },
        });
      };
      
      
      
      
    const statusOptions = [
        { value: null, label: "Бүгд" },
        { value: "rejected", label: "Татгалзсан" },
        { value: "approved", label: "Зөвшөөрөгдсөн" },
        { value: "chosen", label: "Сонгогдсон" },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
  <Select
    placeholder="Төлөв шүүх"
    value={statusFilter}
    onChange={(val) => setStatusFilter(val)}
    allowClear
    style={{ width: 180 }}
    options={statusOptions}
  />

  <Select
    placeholder="Сэдэв дэвшүүлсэн улиралаар шүүх"
    value={cycleFilter}
    onChange={(val) => setCycleFilter(val)}
    allowClear
    style={{ width: 500 }}
    options={Array.from(
      new Map(
        originalTopics
          .filter(t => t.thesis_cycle)
          .map((t) => [t.thesis_cycle.id, t.thesis_cycle])
      ).values()
    ).map((cycle) => ({
      label: `${cycle.semester} улирал, ${cycle.year}-${cycle.end_year}`,
      value: cycle.id,
    }))}
  />

<Select
  placeholder="Хүсэлт ирүүлсэн улиралаар шүүх"
  value={requestCycleFilter}
  onChange={(val) => setRequestCycleFilter(val)}
  allowClear
  style={{ width: 300 }}
  options={Array.from(
    new Map(
      originalTopics
        .flatMap((t) => t.topic_requests || [])
        .filter((r) => r.thesis_cycle)
        .map((r) => [r.thesis_cycle.id, r.thesis_cycle])
    ).values()
  ).map((cycle) => ({
    label: `${cycle.semester} улирал, ${cycle.year}-${cycle.end_year}`,
    value: cycle.id,
  }))}
  />

</div>


            <Spin spinning={loading}>
  <Collapse accordion>
    {filteredTopics.map((topic) => {

      return (
        <Panel
          key={topic.id}
          header={
            topic.status === "chosen" ? (
<span>
  {topic.title_mn}
  {topic.thesis_cycle && (
    <> {topic.thesis_cycle.year}-{topic.thesis_cycle.end_year} {topic.thesis_cycle.semester}</>
  )}
</span>
            ) : (
              <Badge count={topic.topic_requests?.length || 0} offset={[10, 0]} color="#faad14">
               <span>
  {topic.title_mn}
  (
     {topic.thesis_cycle && (
    <> {topic.thesis_cycle.year}-{topic.thesis_cycle.end_year} {topic.thesis_cycle.semester}</>
  )}
  )
 
</span>

              </Badge>
            )
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
          <Button
  type="default"
  danger
  size="small"
  style={{ marginTop: 12 }}
  onClick={() => handleArchive(topic)}
>
  Архивлах
</Button>

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
      <Row gutter={[16, 16]}>
  <Col span={16}>
    <strong>Улирал:</strong>{" "}
    <div style={{ color: "#595959", fontWeight: 500 }}>
      {topic.thesis_cycle?.name} ({topic.thesis_cycle?.semester} улирал, {topic.thesis_cycle?.year}-{topic.thesis_cycle?.end_year})
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
  dataSource={
    requestCycleFilter
      ? topic.topic_requests.filter(
          (r) => r.thesis_cycle?.id === requestCycleFilter
        )
      : topic.topic_requests
  }
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
        },{
            title: "Төлөв",
            key: "status",
            render: (record) =>
              record.is_selected ? (
                <Tag color="green">Сонгогдсон</Tag>
              ) : (
                <Tag color="default">-</Tag>
              ),
          }
,          
{
    title: "Улирал",
    key: "cycle",
    render: (record) =>
      record.thesis_cycle ? (
        <div>{record.thesis_cycle.semester} {record.thesis_cycle.year}-{record.thesis_cycle.end_year}</div>
      ) : (
        <Tag color="default">-</Tag>
      ),
  },
        {
          title: "Тайлбар",
          dataIndex: "req_note",
          render: (text) => text || "-",
        },
        
        {
            title: "Үйлдэл",
            key: "action",
            render: (_, record) => {
              // Энэ topic-аас сонгогдсон request байна уу?
              const selectedRequest = topic.topic_requests.find((r) => r.is_selected);
          
              if (record.is_selected) {
                // Сонгогдсон хүсэлт бол "Татгалзах" товч
                return (
                  <Button
                    type="default"
                    danger
                    size="small"
                    onClick={() => handleDecline(record)}
                  >
                    Татгалзах
                  </Button>
                );
              } else if (!selectedRequest) {
                // Хэрэв одоогоор сонгогдсон хүсэлт байхгүй бол "Зөвшөөрөх" товч
                return (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleConfirm(record)}
                  >
                    Зөвшөөрөх
                  </Button>
                );
              } else {
                // Бусад тохиолдолд ямар ч товч харуулахгүй
                return null;
              }
            },
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
