import React, { useState } from "react";
import {
  Collapse,
  Card,
  Tag,
  Spin,
  Table,
  Button,
  Modal,
  notification,
  Select,
} from "antd";
import dayjs from "dayjs";
import { postData } from "../../utils";

const { Panel } = Collapse;

function ArchivedTopic({ originalTopics, loading, fetchTopicData }) {
  const [cycleFilter, setCycleFilter] = useState(null);
  const [requestCycleFilter, setRequestCycleFilter] = useState(null);

  const handleUnarchive = (topic) => {
    Modal.confirm({
      title: "Та итгэлтэй байна уу?",
      content: "Энэ сэдвийг архивнаас гаргах уу?",
      okText: "Архивнаас гаргах",
      cancelText: "Болих",
      onOk: async () => {
        try {
          await postData(`proposed-topics/${topic.id}/unarchive`, {}, "put");
          notification.success({
            message: "Амжилттай",
            description: "Сэдвийг архивнаас гаргалаа.",
          });
          if (typeof fetchTopicData === "function") {
            fetchTopicData();
          }
        } catch (error) {
          notification.error({
            message: "Алдаа",
            description: "Архивнаас гаргах үед алдаа гарлаа.",
          });
        }
      },
    });
  };

  // 🔍 Filtered topics
  const filteredTopics = originalTopics.filter((t) => {
    const matchCycle = cycleFilter ? t.thesis_cycle?.id === cycleFilter : true;
    const matchRequestCycle = requestCycleFilter
      ? t.topic_requests?.some(
          (r) => r.thesis_cycle?.id === requestCycleFilter
        )
      : true;
    return matchCycle && matchRequestCycle;
  });

  // 🎯 Cycle options
  const topicCycleOptions = Array.from(
    new Map(
      originalTopics
        .filter((t) => t.thesis_cycle)
        .map((t) => [t.thesis_cycle.id, t.thesis_cycle])
    ).values()
  ).map((cycle) => ({
    label: `${cycle.semester} улирал, ${cycle.year}-${cycle.end_year}`,
    value: cycle.id,
  }));

  const requestCycleOptions = Array.from(
    new Map(
      originalTopics
        .flatMap((t) => t.topic_requests || [])
        .filter((r) => r.thesis_cycle)
        .map((r) => [r.thesis_cycle.id, r.thesis_cycle])
    ).values()
  ).map((cycle) => ({
    label: `${cycle.semester} улирал, ${cycle.year}-${cycle.end_year}`,
    value: cycle.id,
  }));

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        <Select
          placeholder="Сэдэв дэвшүүлсэн улирал"
          value={cycleFilter}
          onChange={(val) => setCycleFilter(val)}
          allowClear
          style={{ width: 300 }}
          options={topicCycleOptions}
        />

        <Select
          placeholder="Хүсэлт ирүүлсэн улирал"
          value={requestCycleFilter}
          onChange={(val) => setRequestCycleFilter(val)}
          allowClear
          style={{ width: 300 }}
          options={requestCycleOptions}
        />
      </div>

      <Collapse accordion>
        {filteredTopics.map((topic) => (
          <Panel
            key={topic.id}
            header={`${topic.title_mn} (${topic.statusMn})`}
            extra={<Tag color="gray">Archived</Tag>}
          >
            <Card bordered size="small">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div />
                <Button type="primary" onClick={() => handleUnarchive(topic)}>
                  Архивнаас гаргах
                </Button>
              </div>

              <p>
                <strong>Гарчиг (EN):</strong> {topic.title_en}
              </p>
              <p>
                <strong>Тайлбар:</strong> {topic.description}
              </p>
              <p>
                <strong>Төлөв:</strong> {topic.status}
              </p>

              {topic.approval_logs?.length > 0 && (
                <>
                  <h5 style={{ marginTop: 10 }}>Баталгаажуулалтын түүх</h5>
                  {topic.approval_logs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: 12,
                        paddingLeft: 12,
                        borderLeft: "3px solid #91d5ff",
                      }}
                    >
                      <p>
                        <strong>Үйлдэл:</strong>{" "}
                        {log.action === "approved"
                          ? "Зөвшөөрсөн"
                          : "Татгалзсан"}{" "}
                        — {dayjs(log.acted_at).format("YYYY-MM-DD HH:mm")}
                      </p>
                      {log.comment && (
                        <p>
                          <strong>Тайлбар:</strong> {log.comment}
                        </p>
                      )}
                      <p>
                        <strong>Шийдвэр гаргасан:</strong>{" "}
                        {log.reviewer?.lastname} овогтой{" "}
                        {log.reviewer?.firstname}
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
                            (r) =>
                              r.thesis_cycle?.id === requestCycleFilter
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
                      },
                      {
                        title: "Төлөв",
                        key: "status",
                        render: (record) =>
                          record.is_selected ? (
                            <Tag color="green">Сонгогдсон</Tag>
                          ) : (
                            <Tag color="default">-</Tag>
                          ),
                      },
                      {
                        title: "Тайлбар",
                        dataIndex: "req_note",
                        render: (text) => text || "-",
                      },
                    ]}
                  />
                </>
              )}
            </Card>
          </Panel>
        ))}
      </Collapse>
    </Spin>
  );
}

export default ArchivedTopic;
