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
};

const EditableTable = () => {
  const [dataSource, setDataSource] = useState([]);
  const [, setCount] = useState(0);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [defaultFields, setDefaultFields] = useState([]);

  const fetchPosts = async () => {
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
            targetUser: item.targetUser || "All",
          };
        });

        setDataSource(fieldsData);
        setOriginalData(res[0]);
        setDefaultFields(res[0].default_fields || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = (key) => {
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
      key: "mongolianField",
      editable: true,
    },
    {
      title: "English Field",
      dataIndex: "englishField",
      key: "englishField",
      editable: true,
    },
    {
      title: "Зорилтот хэрэглэгч",
      dataIndex: "targetUser",
      render: (_, record) => (
        <Select
          defaultValue={record.targetUser}
          style={{ width: 150 }}
          options={[
            { value: "All", label: "Бүгд" },
            { value: "Student", label: "Оюутан" },
            { value: "Teacher", label: "Багш" },
          ]}
          onChange={(value) => {
            handleSave({ ...record, targetUser: value });
          }}
        />
      ),
    },
    {
      title: "Үйлдэл",
      dataIndex: "operation",
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
            </div>
          </Card>
        </div>

        {/* Хүснэгтийн товчлуурууд */}
        <div className="flex justify-between mb-4">
          <Button onClick={handleAdd} type="default">
            Талбар нэмэх
          </Button>
          <Button onClick={handleSaveToDatabase} type="primary">
            Хадгалах
          </Button>
        </div>

        {/* Хүснэгт */}
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
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
      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
        <Content style={{ padding: "0 16px" }}>
          <EditableTable />
        </Content>
      </Layout>
    </div>
  );
};

export default DeFormSet;
