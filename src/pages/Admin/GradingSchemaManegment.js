import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  Card,
  Collapse,
  Spin,
  message,
  Badge,
  Row,
  Col,
  Space
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import api from "../../context/api_helper";
import SchemaEditorModal from "../../components/thesisCycle/SchemaEditorModal";

const { Panel } = Collapse;
const { confirm } = Modal;

const GradingSchemaManagement = () => {
  const [schemas, setSchemas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); 
  const [editSchema, setEditSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activePanels, setActivePanels] = useState([]);

  useEffect(() => {
    fetchGradingSchemas();
  }, []);

  const fetchGradingSchemas = async () => {
    setLoading(true);
    try {
      const response = await api.get("/grading-schemas");
      setSchemas(response.data);
    } catch (error) {
      console.error("Error fetching schemas:", error);
      message.error("Мэдээлэл авахад алдаа гарлаа!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (schemaId) => {
    confirm({
      title: "Баталгаажуулах",
      icon: <ExclamationCircleOutlined />,
      content: "Та энэ БСА-г устгахдаа итгэлтэй байна уу?",
      okText: "Тийм, устгах",
      okType: "danger",
      cancelText: "Үгүй",
      onOk: async () => {
        setDeletingId(schemaId);
        try {
          await api.delete(`/grading-schemas/${schemaId}`);
          setSchemas(schemas.filter((s) => s.id !== schemaId));
          message.success("Амжилттай устгалаа!");
        } catch (error) {
          console.error("Error deleting schema:", error);
          message.error("Устгаж чадсангүй!");
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      render: (_, __, index) => index + 1,
      width: 60
    },
    {
      title: "Нэр",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Жил",
      dataIndex: "year",
      key: "year"
    },
    {
      title: "Үйлдлүүд",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditSchema(record);
              setModalVisible(true);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === record.id}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <div >
     <Row gutter={[16, 16]} justify="space-between" align="middle">        <Col>
          <h2>Дүгнэх үе шатын тохиргоо</h2>
        </Col>
        <Col>
        
      <Button
        type="primary"
        icon={<PlusOutlined />}
     onClick={() => setModalVisible(true)} 
        // onClick={() => {
        //     console.log("Button clicked"); // Debugging
        //     setModalVisible(true);
        //   }}
      >
        Шинээр нэмэх
      </Button>
        </Col>
      </Row>

   <div style={{ marginTop: 20, marginBottom: 20 }}>
   <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={schemas}
            rowKey="id"
            pagination={false}
            bordered
            className="mb-4"
          />

        
        </Spin>
    </div>
      

      <Card>
        <Spin spinning={loading}>
      
          <Collapse
            activeKey={activePanels}
            onChange={(keys) => setActivePanels(keys)}
            accordion
          >
            {schemas.map((schema) => (
              <Panel
                header={`${schema.name} (${schema.year})`}
                key={schema.id}
                extra={
                  <Badge
                    count={schema.grading_components?.length || 0}
                    showZero
                    color="#1890ff"
                  />
                }
              >
                {schema.grading_components?.map((component, index) => (
                  <Card
                    key={index}
                    title={`${component.name} (${component.score}%)`}
                    bordered={false}
                    className="mb-3"
                  >
                    <p>
                      <strong>Хугацаа:</strong> {component.scheduled_week} -р долоо хоногт
                    </p>
                    <p>
           
                      <strong>Дүгнэгч: </strong> 
                      {component.by_who === "supervisor" &&'Удирдагч багш ' }
                      {component.by_who ==="committee" &&'Комисс'  }
                      {component.by_who === "examiner" &&'Шүүмж багш'}
                    </p>
                    {component.grading_criteria?.length > 0 && (
                      <>
                        <h5>Шалгуур үзүүлэлтүүд:</h5>
                        <ul>
                          {component.grading_criteria.map((criteria, idx) => (
                            <li key={idx}>
                              {criteria.name} - {criteria.score} оноо
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </Card>
                ))}
              </Panel>
            ))}
          </Collapse>
        </Spin>
      </Card>

      <SchemaEditorModal
        open={modalVisible} // Changed from 'visible' to 'open'
        onCancel={() => {
          setModalVisible(false);
          setEditSchema(null);
        }}
        onSuccess={() => {
          fetchGradingSchemas();
          setModalVisible(false);
          setEditSchema(null);
        }}
        schema={editSchema}
      />
    </div>
  );
};

export default GradingSchemaManagement;