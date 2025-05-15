import React, { useEffect, useState } from "react";
import { Table, Select, Card, Typography, Row, Col ,InputNumber, Button, Alert} from "antd";
import api from "../../../context/api_helper"; 
import { toast } from "react-toastify";


//TODO::
import { useUser } from "../../../context/UserContext";
import "dayjs/locale/mn";
import dayjs from "dayjs";


import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.locale('mn');
dayjs.extend(utc);
dayjs.extend(timezone);
const { Option } = Select;
const { Title } = Typography;

const AssignedGradingTable = () => {
  const [data, setData] = useState([]);
  const [scores, SetScores] =useState([]);
  const [filtered, setFiltered] = useState([]);

  const [componentOptions, setComponentOptions] = useState([]);

  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editMode, setEditMode] = useState(false);
const [editableScores, setEditableScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentDeadline, setCurrentDeadline] = useState(null);

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
  }, [data, scores, selectedComponent]);
  

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/assigned-grading/teacher/${user.id}`);
      const resData = response.data;
  
      const components = resData.grading_components || [];
   
  
      // Flatten students into rows for the table
      const flattened = components.flatMap((component) =>
        component.students.map((item) => ({
          ...item,
          grading_component: {
            id: component.id,
            name: component.name,
            score: component.score,
          },
   
        }))
      );
  console.log("dfg",components )
      setData(flattened);
      setFiltered(flattened);
  
      // Generate filters
    // since only one thesis_cycle
      setComponentOptions(components);
    //   if (components.length > 0) {
    //     const selected = components.find(c => c.id === selectedComponent) || components[0];
    //     const deadline = selected.thesis_cycle_deadlines?.[0] || null;
    //     console.log(selected.thesis_cycle_deadlines)
    //     setCurrentDeadline(deadline);
    //   }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Үнэлгээний мэдээлэл авахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchScoreData = async () => {
    const scores= await api.get(`/assigned-grading/score/${user.id}`);
    console.log('scores', scores.data.data)
    SetScores(scores.data.data)
      

  };
  

  const handleFilter = () => {
    let result = [...data];


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
  }, [selectedComponent]);

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
  placeholder="Бүрэлдэхүүн сонгох"
  onChange={(value) => {
    setSelectedComponent(value);
    const selected = componentOptions.find((c) => c.id === value);
    setCurrentDeadline(selected?.thesis_cycle_deadlines?.[0] || null);
  }}
  allowClear
  style={{ width: 250 }}
>

{componentOptions.map((comp, index) => (
  <Option key={`component-${comp.id || index}`} value={comp.id}>
    {comp.name}
  </Option>
))}

          </Select>

          {!selectedComponent ? (
      <Row style={{ marginTop: 12 }}>
    <Col span={24}>
      <Alert
        message="Эхлээд бүрэлдэхүүн сонгоно уу"
        type="warning"
        showIcon
      />
    </Col>
  </Row>
):(

    <Row style={{ marginTop: 12 }}>
    <Col>
      {currentDeadline && dayjs().isAfter(dayjs.utc(currentDeadline?.end_date)) ? (
        <Alert
          type="error"
    
          message={`Энэ бүрэлдэхүүнд үнэлгээ өгөх хугацаа дууссан: ${dayjs
            .utc(currentDeadline?.end_date)
            .tz("Asia/Ulaanbaatar")
            .format("YYYY-MM-DD HH:mm")}`}
          showIcon
        />
      ) : (
        <Alert
    type={dayjs().isAfter(dayjs.utc(currentDeadline?.end_date)) ? "error" : "info"}
    showIcon
    message={
      <>
        📆 Үнэлгээний хугацаа:{" "}
        {dayjs
          .utc(currentDeadline?.start_date)
          .tz("Asia/Ulaanbaatar")
          .format("YYYY-MM-DD HH:mm")}{" "}
        →{" "}
        {dayjs
          .utc(currentDeadline?.end_date)
          .tz("Asia/Ulaanbaatar")
          .format("YYYY-MM-DD HH:mm")}
      </>
    }

  />
      )}
    </Col>
  </Row>
  
   
)
}
     </Col>

      </Row>



<Row justify="end" style={{ marginBottom: 12 }}>
  {selectedComponent && (
    editMode ? (
      <>
        <Button onClick={() => setEditMode(false)} style={{ marginRight: 8 }}>
          Болих
        </Button>
        <Button type="primary" onClick={handleSaveAll}>
          Хадгалах
        </Button>
      </>
    ) : (
      <Button
        onClick={() => setEditMode(true)}
        disabled={currentDeadline && dayjs().isAfter(dayjs.utc(currentDeadline.end_date))}
      >
        Засах
      </Button>
    )
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
