import React, { useState ,useEffect} from "react";
import {
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Button,
  Tooltip,
  Space,
  Tag,
  Badge,
  Spin,
  Skeleton
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  TableOutlined,
  ShareAltOutlined
} from "@ant-design/icons";
import ThesisStatusModal from "./SupervisodThesis/ThesisStatusModel";
import AllThesisStatusModel from "./SupervisodThesis/AllThesisStatusModel";
const { Title, Text, Paragraph } = Typography;

const getProfileColor = (name) => {
  const colors = [
    "#FF5733",
    "#33B5E5",
    "#FFBB33",
    "#2E7D32",
    "#673AB7",
    "#D32F2F",
    "#00796B",
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

const ThesisCard = ({ data }) => {

  const [loading, setLoading] = useState(true);

  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [selectedCycleTheses, setSelectedCycleTheses] = useState([]);
  useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);
  const showTableModal = (theses) => {
    setSelectedCycleTheses(theses);
    setTableModalVisible(true);
  };

  const handleTableModalClose = () => {
    setTableModalVisible(false);
    setSelectedCycleTheses([]);
  };

  if (!data || data.length === 0) {
    return <p className="text-center text-muted">Өгөгдөл байхгүй байна</p>;
  }

  // Group by thesis_cycle.id
  const grouped = {};
  data.forEach((thesis) => {
    const cycleId = thesis.thesis_cycle?.id || "unknown";
    if (!grouped[cycleId]) {
      grouped[cycleId] = {
        cycle: thesis.thesis_cycle,
        theses: [],
      };
    }
    grouped[cycleId].theses.push(thesis);
  });

  // Convert to array and sort
  const groupedArray = Object.values(grouped).sort((a, b) => {
    const aActive = a.cycle?.status === "Идэвхитэй" ? 0 : 1;
    const bActive = b.cycle?.status === "Идэвхитэй" ? 0 : 1;

    if (aActive !== bActive) return aActive - bActive;

    const aDate = new Date(a.cycle?.start_date);
    const bDate = new Date(b.cycle?.start_date);

    return aDate - bDate;
  });

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[...Array(4)].map((_, idx) => (
          <Col key={idx} xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-center text-muted">Өгөгдөл байхгүй байна</p>;
  }

  return (
    <>
      <AllThesisStatusModel
        visible={tableModalVisible}
        onCancel={handleTableModalClose}
        theses={selectedCycleTheses}
      />

      {groupedArray.map((group, index) => (
        <div key={index}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "10px 0",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "16px",
              }}
            >
              {group.cycle?.year} {group.cycle?.semester},{" "}
              {group.cycle?.start_date} - {group.cycle?.end_date}
            </Text>
            <Button
              type="primary"
              icon={<TableOutlined />}
              onClick={() => showTableModal(group.theses)}
              size="small"
            >
              Хүснэгтээр харах
            </Button>
          </div>

          {/* Theses under this cycle */}
          <Row gutter={[16, 16]}>
            {group.theses.map((thesis, idx) => {
              const { student } = thesis;
              return (
                <Col key={idx} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    style={{ height: "100%", marginBottom: "10px" }}
                  >
                    {/* Student Info Section */}
                    <div className="d-flex align-items-center mb-3">
                      <Avatar
                        style={{
                          backgroundColor: getProfileColor(student.firstname),
                          verticalAlign: "middle",
                        }}
                        size={48}
                      >
                        {student.firstname?.charAt(0).toUpperCase()}
                      </Avatar>
                      <div style={{ marginLeft: "12px" }}>
                        <Title level={5} style={{ margin: 0 }}>
                          {`${student.lastname} ${student.firstname}`}
                        </Title>
                        <Text type="secondary">{student.program}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {student.mail}
                        </Text>
                      </div>
                    </div>

                    {/* Thesis Info Section - Now using all available space */}
                    <div style={{ flexGrow: 1 }}>
                      <Paragraph
                        strong
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 4 }}
                      >
                        {thesis.name_mongolian}
                      </Paragraph>
                      <Paragraph
                        type="secondary"
                        italic
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 12, fontSize: 13 }}
                      >
                        {thesis.name_english}
                      </Paragraph>

                      {/* Status Indicators - More compact and informative */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Статус:{" "}
                            <Tag
                              color={
                                thesis.status === "active" ? "green" : "orange"
                              }
                            >
                              {thesis.status === "active"
                                ? "Идэвхитэй"
                                : "Хүлээгдэж байна"}
                            </Tag>
                          </Text>
                        </div>
                        <div>
                          {thesis.thesisPlanStatus && (
                            <Space size="small">
                              <Tooltip title="Төлөвлөгөөний төлөв">
                                <Badge
                                  status={
                                    thesis.thesisPlanStatus
                                      .department_status === "approved"
                                      ? "success"
                                      : thesis.thesisPlanStatus
                                          .department_status === "rejected"
                                      ? "error"
                                      : "warning"
                                  }
                                />
                              </Tooltip>
                            </Space>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar for visual status indication */}
                      {thesis.thesisPlanStatus && (
                        <div style={{ marginBottom: 12 }}></div>
                      )}

                      {/* Key dates if available */}
                      {thesis.important_dates && (
                        <div style={{ marginTop: 8 }}>
                          <Text strong style={{ fontSize: 12 }}>
                            Чухал огноо:
                          </Text>
                          <ul
                            style={{
                              paddingLeft: 16,
                              margin: "4px 0",
                              fontSize: 11,
                              color: "#595959",
                            }}
                          >
                            {thesis.important_dates.map((date, i) => (
                              <li key={i}>
                                {date.description}: {date.date}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Now at the bottom */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "auto",
                        paddingTop: 8,
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() =>
                          (window.location.href = `/aboutthesis/${thesis.id}`)
                        }
                      >
                        Дэлгэрэнгүй
                      </Button>
                      {/* <Space>
                        <Button size="small" icon={<DownloadOutlined />} />
                        <Button size="small" icon={<ShareAltOutlined />} />
                      </Space> */}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}
    </>
  );
};

export default ThesisCard;
