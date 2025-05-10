import {
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Col,
    Row,
    Alert,
    Button,
    
} from "antd";
const { Option } = Select;

const CycleStep1_InfoForm = ({
    form,
    gradingSchemas,
    setSelectedSchema,
    statusWarning,
    setStatusWarning,
    editable,
    onEditClick,
    onSaveClick,
    loadingCycle,
}) => (
    <>
        {!editable ? (
            <div style={{ textAlign: "right", marginTop: 16 }}>
                <Button color="pink" variant="filled" onClick={onEditClick}>
                    Засах
                </Button>
            </div>
        ) : (
            <div style={{ textAlign: "right", marginTop: 16 }}>
                <Button color="pink" variant="outlined" onClick={onEditClick}>
                    Болих
                </Button>
                <Button
                    color="pink"
                    variant="filled"
                    style={{ marginLeft: 8 }}
                    loading={loadingCycle}
                    onClick={async () => {
                        try {
                            const values = await form.validateFields();

                            onSaveClick(values);
                        } catch (err) {
                            console.log("Validation Failed:", err);
                        }
                    }}
                >
                    Хадгалах
                </Button>
            </div>
        )}

        <Row gutter={16}>
            <Col span={12}>
                <Form.Item
                    name="name"
                    label="БСА нэр"
                    rules={[{ required: true }]}
                >
                    <Input disabled={!editable} />
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item
                    name="year"
                    label="Хичээлийн жил"
                    rules={[{ required: true }]}
                >
                    <InputNumber min={2000} disabled={!editable} />
                </Form.Item>
            </Col>
            <Col span={6}>
                <Form.Item
                    name="end_year"
                    label="Дуусах жил"
                    rules={[{ required: true }]}
                >
                    <InputNumber min={2000} disabled={!editable} />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name="semester" label="Улирал">
                    <Select disabled={!editable}>
                        <Option value="Намар">Намар</Option>
                        <Option value="Хавар">Хавар</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name="start_date" label="Эхлэх өдөр">
                    <DatePicker
                        style={{ width: "100%" }}
                        disabled={!editable}
                    />
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name="end_date" label="Дуусах өдөр">
                    <DatePicker
                        style={{ width: "100%" }}
                        disabled={!editable}
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item
                    name="grading_schema_id"
                    label="Дүгнэх аргачлал"
                    rules={[{ required: true }]}
                >
                    <Select
                        disabled={!editable}
                        onChange={(id) =>
                            setSelectedSchema(
                                gradingSchemas.find(
                                    (s) => s.id === parseInt(id)
                                )
                            )
                        }
                    >
                        {gradingSchemas.map((s) => (
                            <Option key={s.id} value={s.id}>
                                {s.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="status" label="Төлөв">
                    <Select
                        disabled={!editable}
                        onChange={(val) =>
                            setStatusWarning(
                                val === "Хаагдсан"
                                    ? "Цикл хаагдвал бүх холбоотой ажлууд хаагдана."
                                    : ""
                            )
                        }
                    >
                        <Option value="Идэвхитэй">Идэвхитэй</Option>
                        <Option value="Хүлээгдэж буй">Хүлээгдэж буй</Option>
                        <Option value="Хаагдсан">Хаагдсан</Option>
                        <Option value="Цуцлагдсан">Цуцлагдсан</Option>
                    </Select>
                </Form.Item>
                {statusWarning && (
                    <Alert type="warning" message={statusWarning} showIcon />
                )}
            </Col>
        </Row>
    </>
);

export default CycleStep1_InfoForm;
