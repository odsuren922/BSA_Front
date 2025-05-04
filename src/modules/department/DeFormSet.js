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

<<<<<<< HEAD
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
=======
  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
          className="focus:outline-none"
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap px-3 py-1 cursor-pointer"
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return (
    <td className="editable-cell relative" {...restProps}>
      {childNode}
    </td>
  );
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
};

const EditableTable = () => {
  const [dataSource, setDataSource] = useState([]);
<<<<<<< HEAD
=======
  const [, setCount] = useState(0);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [defaultFields, setDefaultFields] = useState([]);

  const fetchPosts = async () => {
<<<<<<< HEAD
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
=======
    try {
      setLoading(true);
      const res = await fetchData("proposalform");
      if (res.length > 0) {
        const fieldsData = res[0].fields.map((item, index) => {
          const englishField = Object.keys(item).find((key) => key !== "targetUser");
          const mongolianField = item[englishField];
          return {
            key: `row-${index}`,
            mongolianField,
            englishField,
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
            targetUser: item.targetUser || "All",
          };
        });

<<<<<<< HEAD
        setDataSource(mappedFields);
        setOriginalData(form);
        setDefaultFields(form.default_fields || []);
      }
    } catch (err) {
      notification.error({ message: "Алдаа", description: "Маягтын өгөгдөл татагдсангүй" });
=======
        setDataSource(fieldsData);
        setOriginalData(res[0]);
        setDefaultFields(res[0].default_fields || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = (key) => {
<<<<<<< HEAD
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
=======
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const handleAdd = () => {
    setCount((prevCount) => {
      const newRow = {
        key: `new-${Date.now()}`,
        mongolianField: "Шинэ талбар",
        englishField: "new_field",
        targetUser: "Бүгд",
      };
      setDataSource((prevDataSource) => [...prevDataSource, newRow]);
      return prevCount + 1;
    });
  };

  const handleSave = (row) => {
    setDataSource((prevDataSource) =>
      prevDataSource.map((item) =>
        item.key === row.key ? { ...item, ...row } : item
      )
    );
  };

  const handleSaveToDatabase = async () => {

    if (!originalData) return;

    const updatedFields = dataSource.map(
      ({ mongolianField, englishField, targetUser }) => ({
        [englishField]: mongolianField,
        targetUser,
      })
    );

    const updatedData = {
      ...originalData,
      fields: updatedFields,
    };

    try {
      await postData("proposalform", updatedData, "post");
      notification.success({
        message: "Амжилттай",
        description: "Талбаруудыг амжилттай хадгаллаа.",
        placement: "topRight",
        duration: 3,
      });
      fetchPosts();
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Талбар хадгалахад алдаа гарлаа.",
        placement: "topRight",
        duration: 3,
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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
<<<<<<< HEAD
=======
      key: "mongolianField",
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      editable: true,
    },
    {
      title: "English Field",
      dataIndex: "englishField",
<<<<<<< HEAD
=======
      key: "englishField",
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      editable: true,
    },
    {
      title: "Зорилтот хэрэглэгч",
      dataIndex: "targetUser",
      render: (_, record) => (
        <Select
<<<<<<< HEAD
          value={record.targetUser}
=======
          defaultValue={record.targetUser}
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
          style={{ width: 150 }}
          options={[
            { value: "All", label: "Бүгд" },
            { value: "Student", label: "Оюутан" },
            { value: "Teacher", label: "Багш" },
          ]}
<<<<<<< HEAD
          onChange={(value) => handleSave({ ...record, targetUser: value })}
=======
          onChange={(value) => {
            handleSave({ ...record, targetUser: value });
          }}
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        />
      ),
    },
    {
      title: "Үйлдэл",
      dataIndex: "operation",
<<<<<<< HEAD
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
=======
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Устгах уу?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button danger>Устгах</Button>
          </Popconfirm>
        ) : null,
    },
  ].map((col) => ({
    ...col,
    onCell: (record) => ({
      record,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,
      handleSave,
    }),
  }));

  return (
    <div className="p-4">
      <Spin spinning={loading}>
        {/* Тогтмол талбаруудыг харуулах хэсэг */}
        <div style={{ marginBottom: "24px" }}>
          <Card
            title={<span style={{ fontWeight: "normal" }}>Тогтмол талбарууд</span>}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {Array.isArray(defaultFields) &&
                defaultFields.map((fieldObject, index) => {
                  const displayField = Object.entries(fieldObject).find(
                    ([key]) => key !== "targetUser"
                  );
                  const label = displayField ? displayField[1] : "Тодорхойгүй";
                  return (
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
                  );
                })}
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
            </div>
          </Card>
        </div>

<<<<<<< HEAD
        <div className="flex justify-between mb-4">
          <Button onClick={handleAdd}>Талбар нэмэх</Button>
          <Button type="primary" onClick={handleSaveToDatabase}>
=======
        {/* Хүснэгтийн товчлуурууд */}
        <div className="flex justify-between mb-4">
          <Button onClick={handleAdd} type="default">
            Талбар нэмэх
          </Button>
          <Button onClick={handleSaveToDatabase} type="primary">
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
            Хадгалах
          </Button>
        </div>

<<<<<<< HEAD
=======
        {/* Хүснэгт */}
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
<<<<<<< HEAD
          columns={mappedColumns}
          pagination={false}
=======
          columns={columns}
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        />
      </Spin>
    </div>
  );
};

const DeFormSet = () => {
  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      <header style={{ textAlign: "left" }}>
<<<<<<< HEAD
        <Title level={3}>Сэдэв дэвшүүлэх маягт тохиргоо</Title>
      </header>

      <Layout style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}>
=======
        <Title level={3}>Сэдэв дэвшүүлэх хэлбэр</Title>
      </header>
      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
        <Content style={{ padding: "0 16px" }}>
          <EditableTable />
        </Content>
      </Layout>
    </div>
  );
};

export default DeFormSet;
