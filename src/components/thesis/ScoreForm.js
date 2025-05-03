import React , {useEffect}from "react";
import { Button, Card, Col, Form, InputNumber, Row, Select } from "antd";
import { toast } from "react-toastify";
import api from "../../context/api_helper";
import { useUser } from "../../context/UserContext";

const ScoreForm = ({
  thesisId,
  gradingSchema,
  onSuccess,
  Supervisorid,
  Studentid,
  thesisCycleId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [selectedComponent, setSelectedComponent] = React.useState(null);
  const [scoreValue, setScoreValue] = React.useState(0);
  const { user } = useUser();
  const [hasPermission, setHasPermission] = React.useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (!selectedComponent) {
       
        setHasPermission(false);
        return;
      }
  
      if (selectedComponent?.by_who === "supervisor") {

        setHasPermission(true)
        // setHasPermission(user.id === Supervisorid && user.role === "teacher");
      } else if (selectedComponent?.by_who === "committee") {

        console.log( "thesis_cycle_id:", thesisCycleId)
        console.log("selectedComponent.id",selectedComponent.id)
        console.log("Studentid",Studentid)
        console.log("user.id",user.id)

        try {
          const res = await api.post("/committees/check-assignment", {
            thesis_cycle_id: thesisCycleId,
            grading_component_id: selectedComponent.id,
            student_id: Studentid,
            teacher_id: user.id,
          });
        
          setHasPermission(res.data.match);
          if (!res.data.match) {
            toast.error(
              "Та энэ оюутныг үнэлэх эрхгүй байна. Та энэ хороонд хамаарахгүй байна."
            );
          }
        } catch (e) {
          toast.error("Шалгах явцад алдаа гарлаа.");
          setHasPermission(false);
        }
      }
    };
  
    checkPermission();
  }, [selectedComponent, user]);
  


  const handleScoreSubmit = async () => {
    try {
      setLoading(true);
      await api.post("/thesis-scores", {
        thesis_id: thesisId,
        grading_component_id: selectedComponent,
        score: scoreValue,
      });
      toast.success("Амжилттай оноо өглөө!");
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      toast.error("Алдаа гарлаа: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Үнэлгээ өгөх" className="mb-4">
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Үнэлгээний компонент" required>
              <Select
                placeholder="Компонент сонгох"
                value={selectedComponent?.id}
                onChange={(id) => {
                  const selected = gradingSchema?.grading_components?.find(
                    (c) => c.id === id
                  );
                  setSelectedComponent(selected);
                }}
                options={
                  gradingSchema?.grading_components?.map((component) => ({
                    label: component.name,
                    value: component.id,
                  })) || []
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Боломжит Оноо">
              {selectedComponent?.score ?? "—"}
            </Form.Item>
          </Col>
          {hasPermission && (
  <Col span={12}>
    <Form.Item
      label="Оноо"
      name="score"
      rules={[
        {
          required: true,
          message: "Оноо оруулна уу!",
          type: "number",
        },
        { min: 0, max: 100 },
      ]}
    >
      <InputNumber
        min={0}
        max={100}
        onChange={setScoreValue}
        formatter={(value) => `${value}`}
      />
    </Form.Item>

    <Button type="primary" onClick={handleScoreSubmit} loading={loading}>
      Хадгалах
    </Button>
  </Col>
)}

        </Row>
        {/* <Button type="primary" onClick={handleScoreSubmit} loading={loading}>
          Хадгалах
        </Button> */}
      </Form>
    </Card>
  );
};

export default ScoreForm;
