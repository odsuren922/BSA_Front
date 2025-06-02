import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    Form,
    Input,
    Select,
    Spin,
    Table,
    Typography,
    Layout,
    notification,
    Popconfirm,
} from "antd";
import {fetchData, postData} from "../../utils"
const { Content } = Layout;
const { Title } = Typography;

const EditableTable = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [isBulkEditing, setIsBulkEditing] = useState(false);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetchData("proposal-fields");
            const fieldsData = res.map((item, index) => ({
                key: item.id || `row-${index}`,
                id: item.id,
                mongolianField: item.name,
                englishField: item.name_en,
                targeted_to: item.targeted_to || "both",
                status: item.status || "active",
            }));
            setDataSource(fieldsData);
            form.setFieldsValue({ dataSource: fieldsData });
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleAdd = () => {
        const newRow = {
            key: `new-${Date.now()}`,
            mongolianField: "Шинэ талбар",
            englishField: "new_field",
            targeted_to: "both",
            status: "active",
        };
        const updated = [...dataSource, newRow];
        setDataSource(updated);
        form.setFieldsValue({ dataSource: updated });
    };



    const handleSaveAll = async () => {
        try {
            const values = await form.validateFields();
            const updatedRows = values.dataSource.map((item, i) => ({
                id: dataSource[i].id,
                name: item.mongolianField,
                name_en: item.englishField,
                targeted_to: item.targeted_to,
                dep_id: 1,
                type: "text",
                is_required: false,
                status: item.status,
            }));

           await postData(`proposal-fields/bulk-upsert`, {  fields: updatedRows}, "post");


            notification.success({
                message: "Амжилттай",
                description: "Бүх мөр хадгалагдлаа.",
            });

            setIsBulkEditing(false);
            fetchPosts();
        } catch (error) {
            notification.error({
                message: "Алдаа",
                description: "Бүгдийг хадгалах үед алдаа гарлаа.",
            });
        }
    };
    const handleDelete = async (key) => {
        const item = dataSource.find((item) => item.key === key);
    
        if (!item) return;
    
        try {
            if (item.id) {
                await postData(`proposal-fields/${item.id}`, {}, "delete");

            }
    
            const newData = dataSource.filter((i) => i.key !== key);
            setDataSource(newData);
            form.setFieldsValue({ dataSource: newData });
    
            notification.success({
                message: "Устгасан",
                description: "Талбар амжилттай устгагдлаа.",
            });
        } catch (error) {
            notification.error({
                message: "Алдаа",
                description: "Устгах үед алдаа гарлаа.",
            });
        }
    };
    
    const columns = [
        {
            title: "Монгол талбар",
            dataIndex: "mongolianField",
            render: (text, record, index) => (
                isBulkEditing ? (
                    <Form.Item
                        name={["dataSource", index, "mongolianField"]}
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: "Хоосон байж болохгүй" }]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    text
                )
            ),
        },
        {
            title: "English Field",
            dataIndex: "englishField",
            render: (text, record, index) => (
                isBulkEditing ? (
                    <Form.Item
                        name={["dataSource", index, "englishField"]}
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: "Required" }]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    text
                )
            ),
        },
        {
            title: "Зорилтот хэрэглэгч",
            dataIndex: "targeted_to",
            render: (text, record, index) => (
                isBulkEditing ? (
                    <Form.Item name={["dataSource", index, "targeted_to"]} style={{ margin: 0 }}>
                        <Select
                            options={[
                                { value: "both", label: "Бүгд" },
                                { value: "student", label: "Оюутан" },
                                { value: "teacher", label: "Багш" },
                            ]}
                        />
                    </Form.Item>
                ) : (
                    {
                        both: "Бүгд",
                        student: "Оюутан",
                        teacher: "Багш",
                    }[text]
                )
            ),
        },
        {
            title: "Төлөв",
            dataIndex: "status",
            render: (text, record, index) => (
                isBulkEditing ? (
                    <Form.Item name={["dataSource", index, "status"]} style={{ margin: 0 }}>
                        <Select
                            options={[
                                { value: "active", label: "Идэвхтэй" },
                                { value: "inactive", label: "Идэвхгүй" },
                                { value: "archived", label: "Архивлагдсан" },
                            ]}
                        />
                    </Form.Item>
                ) : (
                    {
                        active: "Идэвхтэй",
                        inactive: "Идэвхгүй",
                        archived: "Архивлагдсан",
                    }[text]
                )
            ),
        },
        {
            title: "Үйлдэл",
            dataIndex: "operation",
            render: (_, record) => (
                <Popconfirm title="Устгах уу?" onConfirm={() => handleDelete(record.key)}>
                    <Button type="link" danger disabled={!isBulkEditing}>
                        Устгах
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Spin spinning={loading}>
                <Card title="Тогтмол талбарууд" style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {["Сэдвийн нэр (Монгол)", "Сэдвийн нэр (Англи)", "Товч агуулга", "Зорилтот хөтөлбөр"].map(
                            (label, index) => (
                                <div
                                    key={index}
                                    style={{
                                        width: "24%",
                                        textAlign: "center",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "8px",
                                    }}
                                >
                                    {label}
                                </div>
                            )
                        )}
                    </div>
                </Card>
        
                <div className="flex justify-between mb-4">
        
                <Button color="primary" variant="filled" onClick={handleAdd} type="default" disabled={!isBulkEditing}>
    Талбар нэмэх
</Button>

              
                    <div>
                        {isBulkEditing ? (
                            <>
                                <Button type="primary" onClick={handleSaveAll} style={{ marginRight: 8 }}>
                                    Бүгдийг хадгалах
                                </Button>
                                <Button onClick={() => setIsBulkEditing(false)}>Цуцлах</Button>
                            </>
                        ) : (
                            <Button color="primary" variant="outlined" onClick={() => setIsBulkEditing(true)}>
                                Засварлах горим
                            </Button>
                        )}
                    </div>
                </div>

                <Form form={form} component={false}>
                    <Table
                        bordered
                        dataSource={dataSource}
                        columns={columns}
                        rowClassName="editable-row"
                        pagination={false}
                    />
                </Form>
            </Spin>
        </div>
    );
};

const DeFormSet = () => {
    return (
        <div style={{ padding: "0 16px", background: "transparent" }}>
            <header style={{ textAlign: "left" }}>
                <Title level={3}>Сэдэв дэвшүүлэх хэлбэр</Title>
            </header>
            <Layout style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}>
                <Content style={{ padding: "0 16px" }}>
                    <EditableTable />
                </Content>
            </Layout>
        </div>
    );
};

export default DeFormSet;