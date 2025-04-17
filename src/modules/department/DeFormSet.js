import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Spin,
  Table,
  notification,
  Layout,
  Typography,
} from "antd";
import { fetchData, postData } from "../../utils";

const { Content } = Layout;
const { Title } = Typography;

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  const childNode = editable ? (
    editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} шаардлагатай.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" onClick={toggleEdit}>
        {children}
      </div>
    )
  ) : (
    children
  );

  return <td {...restProps}>{childNode}</td>;
};

const EditableTable = () => {
  const [dataSource, setDataSource] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [defaultFields, setDefaultFields] = useState([]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetchData("proposalform");
      if (res.length > 0) {
        const form = res[0];

        const mappedFields = form.fields.map((item, index) => {
          const englishField = Object.keys(item)[0];
          const mongolianField = item[englishField];
          return {
            key: `field-${index}`,
            englishField,
            mongolianField,
            targetUser: item.targetUser || "All",
          };
        });

        setDataSource(mappedFields);
        setOriginalData(form);
        setDefaultFields(form.default_fields || []);
      }
    } catch (err) {
      notification.error({ message: "Алдаа", description: "Маягтын өгөгдөл татагдсангүй" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = (key) => {
    setDataSource(dataSource.filter((item) => item.key !== key));
  };

  const handleAdd = () => {
    const newRow = {
      key: `new-${Date.now()}`,
      englishField: "new_field",
      mongolianField: "Шинэ талбар",
      targetUser: "All",
    };
    setDataSource([...dataSource, newRow]);
  };

  const handleSave = (row) => {
    const updated = dataSource.map((item) => (item.key === row.key ? { ...item, ...row } : item));
    setDataSource(updated);
  };

  const handleSaveToDatabase = async () => {
    if (!originalData) return;

    const updatedFields = dataSource.map((item) => ({
      [item.englishField]: item.mongolianField,
      targetUser: item.targetUser || "All",
    }));

    try {
      await postData("proposalform", {
        ...originalData,
        fields: updatedFields,
      });

      notification.success({
        message: "Амжилттай",
        description: "Маягт хадгалагдлаа.",
      });

      fetchPosts();
    } catch (error) {
      notification.error({
        message: "Хадгалах алдаа",
        description: "Өгөгдөл хадгалахад алдаа гарлаа.",
      });
    }
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = [
    {
      title: "Монгол талбар",
      dataIndex: "mongolianField",
      editable: true,
    },
    {
      title: "English Field",
      dataIndex: "englishField",
      editable: true,
    },
    {
      title: "Зорилтот хэрэглэгч",
      dataIndex: "targetUser",
      render: (_, record) => (
        <Select
          value={record.targetUser}
          style={{ width: 150 }}
          options={[
            { value: "All", label: "Бүгд" },
            { value: "Student", label: "Оюутан" },
            { value: "Teacher", label: "Багш" },
          ]}
          onChange={(value) => handleSave({ ...record, targetUser: value })}
        />
      ),
    },
    {
      title: "Үйлдэл",
      dataIndex: "operation",
      render: (_, record) => (
        <Popconfirm title="Та устгах уу?" onConfirm={() => handleDelete(record.key)}>
          <Button danger>Устгах</Button>
        </Popconfirm>
      ),
    },
  ];

  const mappedColumns = columns.map((col) =>
    col.editable
      ? {
          ...col,
          onCell: (record) => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave,
          }),
        }
      : col
  );

  return (
    <div>
      <Spin spinning={loading}>
        <div style={{ marginBottom: "24px" }}>
          <Card title="Тогтмол талбарууд">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {Array.isArray(defaultFields) &&
                defaultFields.map((item, i) => (
                  <div key={i} style={{ padding: "6px 12px", background: "#f5f5f5", borderRadius: 4 }}>
                    {Object.values(item)[0]}
                  </div>
                ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-between mb-4">
          <Button onClick={handleAdd}>Талбар нэмэх</Button>
          <Button type="primary" onClick={handleSaveToDatabase}>
            Хадгалах
          </Button>
        </div>

        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={mappedColumns}
          pagination={false}
        />
      </Spin>
    </div>
  );
};

const DeFormSet = () => {
  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Сэдэв дэвшүүлэх маягт тохиргоо</Title>
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
