// Ant Design-enhanced version of ThesisCycleManagement
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Badge,
  Tabs,
  Row,
  Col,
  Space,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import GradingSchemaManagement from "./GradingSchemaManegment";
import api from "../../context/api_helper";
import CycleFormModal from "../../components/thesisCycle/CycleFormModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { TabPane } = Tabs;
const { Option } = Select;

const ThesisCycleManagement = () => {
  const [cycles, setCycles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCycle, setEditCycle] = useState(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [key, setKey] = useState("cycles");

  useEffect(() => {
    fetchThesisCycle();
  }, []);

  const fetchThesisCycle = async () => {
    try {
      const response = await api.get(`/thesis-cycles`);
      setCycles(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching thesis cycles:", error);
    }
  };

  const handleSubmit = async (cycleData) => {
    try {
      if (editCycle) {
        const res = await api.put(`/thesis-cycles/${editCycle.id}`, cycleData);
        setCycles(
          cycles.map((c) =>
            c.id === cycleData.id ? { ...cycleData, id: c.id } : c
          )
        );
        toast.success("Циклийг амжилттай шинэчлэв!");
      } else {
        const res = await api.post(`/thesis-cycles`, cycleData);
        setCycles([...cycles, { ...cycleData, id: Date.now() }]);
        toast.success("Циклийг амжилттай нэмлээ!");
      }
    } catch (err) {
      toast.error("Алдаа гарлаа!");
    } finally {
      setShowModal(false);
      setEditCycle(null);
    }
  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      render: (_, __, i) => i + 1,
    },
    {
      title: "БСА нэр",
      dataIndex: "name",
    },
    {
      title: "Жил",
      dataIndex: "year",
      render: (_, record) => `${record.year} - ${record.end_year}`,
    },

    {
      title: "Улирал",
      dataIndex: "semester",
    },
    {
      title: "Эхлэх",
      dataIndex: "start_date",
    },
    {
      title: "Дуусах",
      dataIndex: "end_date",
    },

    {
      title: "Үе шат",
      dataIndex: "steps",
      render: (_, record) =>
        record.grading_schema
          ? `${record.grading_schema.name} (${record.grading_schema.year})`
          : "—",
    },

    {
      title: "Төлөв",
      dataIndex: "status",
      render: (status) => (
        <Badge
          status={
            {
              Идэвхитэй: "success",
              Хаагдсан: "default",
              "Хүлээгдэж буй": "warning",
              Цуцлагдсан: "error",
            }[status] || "processing"
          }
          text={status}
        />
      ),
    },
    {
      title: "Засах",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setEditCycle(record);
            setShowModal(true);
          }}
        />
      ),
    },
    {
      title: "Дэлгэрэнгүй",
      render: (_, record) => (
        <a
          href={`/allthesis/${record.id}`}
          className="ant-btn ant-btn-primary ant-btn-sm"
        >
          харах
        </a>
      ),
    },
  ];

  const filteredCycles = cycles.filter(
    (cycle) =>
      (!filterYear || cycle.year.toString() === filterYear) &&
      (!filterSemester || cycle.semester === filterSemester) &&
      (!filterStatus || cycle.status === filterStatus)
  );

  return (
    <div className="p-6 " style={{ padding: "15px", paddingRight: "48px" }}>
      <Tabs activeKey={key} onChange={setKey} type="card">
        <TabPane tab="Улирал" key="cycles">
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col>
              <h2>Бакалаврын судалгааны ажлын улирал</h2>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowModal(true)}
              >
                Бакалаврын судалгааны ажил шинээр нэмэх
              </Button>
            </Col>
          </Row>

          <Space size="middle" style={{ marginTop: 20, marginBottom: 20 }}>
            <Input
              type="number"
              placeholder="Жилээр шүүх"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{ width: 120 }}
            />
            <Select
              placeholder="Улирал"
              value={filterSemester || undefined}
              onChange={(value) => setFilterSemester(value || "")}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="Хавар">Хавар</Option>
              <Option value="Намар">Намар</Option>
            </Select>
            <Select
              placeholder="Төлөв"
              value={filterStatus || undefined}
              onChange={(value) => setFilterStatus(value || "")}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="Идэвхитэй">Идэвхитэй</Option>
              <Option value="Хаагдсан">Хаагдсан</Option>
              <Option value="Хүлээгдэж буй">Хүлээгдэж буй</Option>
              <Option value="Цуцлагдсан">Цуцлагдсан</Option>
            </Select>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredCycles}
            rowKey="id"
            bordered
            pagination={{ pageSize: 8 }}
          />

          <CycleFormModal
            show={showModal}
            onHide={() => {
              setShowModal(false);
              setEditCycle(null);
            }}
            onSubmit={handleSubmit}
            cycle={editCycle}
          />
        </TabPane>
        <TabPane tab="Дүгнэх үе шат" key="grading">
          <h2 style={{ marginBottom: 20 }}>
            Судалгааны ажлыг гүйцэтгэх, хамгаалах үе шат
          </h2>
          <GradingSchemaManagement />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ThesisCycleManagement;
