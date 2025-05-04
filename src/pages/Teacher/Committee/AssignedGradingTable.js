import React, { useEffect, useState } from "react";
import { Table, Select, Card, Typography, Row, Col ,InputNumber, Button} from "antd";
import api from "../../../context/api_helper"; 
import { toast } from "react-toastify";



import { useUser } from "../../../context/UserContext";

const { Option } = Select;
const { Title } = Typography;

const AssignedGradingTable = () => {
  const [data, setData] = useState([]);
  const [scores, SetScores] =useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cycleOptions, setCycleOptions] = useState([]);
  const [componentOptions, setComponentOptions] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editMode, setEditMode] = useState(false);
const [editableScores, setEditableScores] = useState({});
  const [loading, setLoading] = useState(false);

 const { user } = useUser();
  useEffect(() => {
    fetchData();
    fetchScoreData();

  }, []);
  useEffect(() => {
    const merged = data.map((item) => {
      const matchedScore = scores.find(
        (s) =>
          s.student?.id === item.student?.id &&
          s.component?.id === item.grading_component?.id
      );
      return {
        ...item,
        score: matchedScore || null,
      };
    });
  
    setFiltered(merged);
  }, [data, scores, selectedCycle, selectedComponent]);
  

  const fetchData = async () => {
    setLoading(true)
    try{
         const response = await api.get(`/assigned-grading/teacher/${user.id}`);
    console.log(response.data.data)
    const gradingList = response.data.data;

    setData(gradingList);
    setFiltered(gradingList);
     
    const uniqueCycles = Array.from(
        gradingList.reduce((map, item) => {
          if (item.thesis_cycle && !map.has(item.thesis_cycle.id)) {
            map.set(item.thesis_cycle.id, item.thesis_cycle);
          }
          return map;
        }, new Map()).values()
      );
      
      const uniqueComponents = Array.from(
        gradingList.reduce((map, item) => {
          if (item.grading_component && !map.has(item.grading_component.id)) {
            map.set(item.grading_component.id, item.grading_component);
          }
          return map;
        }, new Map()).values()
      );
      
      setCycleOptions(uniqueCycles);
      setComponentOptions(uniqueComponents);
    }catch  (error) {
        console.error("Error fetching committees:", error);
      } finally {
        setLoading(false);
      }
   

    // Extract unique thesis cycles and components for filter options
 
      

  };
  const fetchScoreData = async () => {
    const scores= await api.get(`/assigned-grading/score/${user.id}`);
    console.log('scores', scores.data.data)
    SetScores(scores.data.data)
      

  };
  

  const handleFilter = () => {
    let result = [...data];

    if (selectedCycle) {
      result = result.filter(item => item.thesis_cycle?.id === selectedCycle);
    }

    if (selectedComponent) {
      result = result.filter(item => item.grading_component?.id === selectedComponent);
    }

    setFiltered(result);
  };
  const handleSaveAll = async () => {
    try {
      const promises = Object.entries(editableScores).map(async ([id, scoreVal]) => {
        const record = filtered.find((item) => item.id.toString() === id);
  
        return api.post("/scores", {
          student_id: record.student.id,
          thesis_id: record.thesis.id,
          component_id: record.grading_component.id,
          score: scoreVal,
          given_by_id: user.id,
          given_by_type: "teacher",
        });
      });
  
      await Promise.all(promises);
      toast.success("Бүх оноо амжилттай хадгалагдлаа");
      setEditMode(false);
      setEditableScores({});
      await fetchScoreData(); // refresh scores
    } catch (err) {
      toast.error("Оноо хадгалахад алдаа гарлаа");
    }
  };
  

  useEffect(() => {
    handleFilter();
  }, [selectedCycle, selectedComponent]);

  const columns = [
    {
        title: "Хөтөлбөр",
        dataIndex: "student",
        key: "program",
        render: student => student.program,
      },
    {
      title: "Оюутан",
      dataIndex: "student",
      key: "student",
      render: student => `${student.firstname} ${student.lastname}`,
    },
   
    {
      title: "Сэдэв",
      dataIndex: "thesis",
      key: "thesis",
      render: thesis => thesis.name_mongolian,
    },
    
    {
      title: "Төсөл хичээлийн цикл",
      dataIndex: "thesis_cycle",
      key: "cycle",
      render: cycle => cycle.name,
    },
    {
      title: "Үнэлгээний бүрэлдэхүүн",
      dataIndex: "grading_component",
      key: "component",
      render: comp => comp.name,
    },
    {
        title: "Боломжит оноо",
        dataIndex: "grading_component",
        key: "component",
        render: comp => comp.score,
      },
     
      {
        title: "Авсан оноо",
        key: "score",
        render: (_, record) => {
          const current = editableScores[record.id] ?? record.score?.score ?? "";
      
          return editMode  ? (
            <InputNumber
              min={0}
              max={100}
              value={current}
              onChange={(value) =>
                setEditableScores((prev) => ({ ...prev, [record.id]: value }))
              }
            />
          ) : (
            <span style={{ color: record.score ? "#000" : "gray" }}>
              {record.score?.score ?? "Оноо оруулаагүй"}
            </span>
          );
        },
      }
,      
          
      {
        title: "Дэлгэрэнгүй",
        render: (_, record) => (
          <a href={`/aboutthesis/${record.thesis?.id}`}>Дэлгэрэнгүй</a>
        )
      }
, 
      
  ];

  return (
    <Card>
      {/* <Title level={4}>Хуваарилсан үнэлгээ</Title> */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            placeholder="Цикл сонгох"
            onChange={setSelectedCycle}
            allowClear
            style={{ width: 500 }}
          >
{cycleOptions.map((cycle, index) => (
  <Option key={`cycle-${cycle.id || index}`} value={cycle.id}>
    {cycle.name}  {cycle.semester}
  </Option>
))}

          </Select>
        </Col>
        <Col>
          <Select
            placeholder="Бүрэлдэхүүн сонгох"
            onChange={setSelectedComponent}
            allowClear
            style={{ width: 250 }}
          >
{componentOptions.map((comp, index) => (
  <Option key={`component-${comp.id || index}`} value={comp.id}>
    {comp.name}
  </Option>
))}

          </Select>
        </Col>
      </Row>

      <Row justify="end" style={{ marginBottom: 12 }}>
  {editMode ? (
    <>
      <Button onClick={() => setEditMode(false)} style={{ marginRight: 8 }}>
        Болих
      </Button>
      <Button type="primary" onClick={handleSaveAll}>
        Хадгалах
      </Button>
    </>
  ) : (
    <Button onClick={() => setEditMode(true)}>Засах</Button>
  )}
</Row>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        loading={loading}
      />


    </Card>
  );
};

export default AssignedGradingTable;
