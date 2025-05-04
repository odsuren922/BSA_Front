import React, { useState, useEffect, useCallback } from "react";
import { Layout, Typography, Tabs, Spin, Button, notification } from "antd";
import { fetchData } from "../../utils";
import TopicDetail from "../TopicDetail";
import CustomTable from "../../components/CustomTable";

const { Content } = Layout;
const { Title } = Typography;

const ProposedTopics = () => {
<<<<<<< HEAD
  const [activeKey, setActiveKey] = useState("1");
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    const type = activeKey === "1" ? "teacher" : "student";

    try {
      const response = await fetchData(`supervisor/topics/submitted?type=${type}`);

      const transformed = response.map((item) => {
        const fields = JSON.parse(item.fields || "[]");
        const getValue = (key) => fields.find((f) => f.field === key)?.value || "-";

        return {
          ...item,
          key: item.id,
          name_mongolian: getValue("name_mongolian"),
          name_english: getValue("name_english"),
          description: getValue("description"),
          fields,
        };
      });

      setDataSource(transformed);

      setColumns([
        {
          title: "Сэдвийн нэр (Монгол)",
          dataIndex: "name_mongolian",
          key: "name_mongolian",
        },
        {
          title: "Сэдвийн нэр (Англи)",
          dataIndex: "name_english",
          key: "name_english",
        },
        {
          title: "Товч агуулга",
          dataIndex: "description",
          key: "description",
        },
        {
          title: "Үйлдэл",
          key: "actions",
          fixed: "right",
=======
  const [activeKey, setActiveKey] = useState("1"); // Идэвхтэй табын түлхүүр хадгалах
  const [loading, setLoading] = useState(false); // Өгөгдөл ачаалж байгаа эсэхийг заах
  const [dataSource, setDataSource] = useState([]); // Хүснэгтийн өгөгдлийг хадгалах
  const [columns, setColumns] = useState([]); // Хүснэгтийн багануудыг хадгалах
  const [isModalOpen, setIsModalOpen] = useState(false); // Дэлгэрэнгүй цонх нээлттэй эсэхийг заах
  const [selectedRowData, setSelectedRowData] = useState(null); // Сонгосон мөрний өгөгдлийг хадгалах

  // Таб солигдох үед идэвхтэй табын түлхүүрийг шинэчлэх
  const handleTabChange = (key) => {
    setActiveKey(key);
    console.log(`Tab: ${key}`); // Шинэ табын түлхүүрийг консолд хэвлэх
  };

  // Сэдвүүдийг серверээс татах функц
  const fetchTopics = useCallback(async () => {
    setLoading(true); // Ачаалал эхэлснийг заах

    try {
      const type = activeKey === "1" ? "teacher" : "student"; // Табын түлхүүрээс хамааран төрөл тодорхойлох
      const endpoint = `topics/submittedby/${type}`; // Тохирох API endpoint-ыг ашиглах
      const rawData = await fetchData(endpoint); // Серверээс өгөгдөл татах

      const transformedData = rawData.map((item) => {
        // Өгөгдлийг тохирох формат руу хөрвүүлэх
        const fieldsArray = JSON.parse(item.fields);
        const fieldsObject = fieldsArray.reduce(
          (acc, field) => ({
            ...acc,
            [field.field]: field.value,
            [`${field.field}_name`]: field.field2,
          }),
          {}
        );
        return { ...item, ...fieldsObject, key: item.id, type }; // Өгөгдөлд key болон type нэмэх
      });

      setDataSource(transformedData); // Хүснэгтийн өгөгдлийг шинэчлэх

      if (transformedData.length > 0) {
        // Хүснэгтийн баганы тохиргоо хийх
        const dynamicColumns = JSON.parse(transformedData[0].fields)
          .filter((field) =>
            ["name_english", "name_mongolian", "description"].includes(
              field.field
            )
          )
          .map((field) => ({
            title: field.field2, // Баганын гарчиг
            dataIndex: field.field, // Өгөгдөл авах түлхүүр
            key: field.field,
          }));

        // Үйлдэл багана нэмэх
        dynamicColumns.push({
          title: "Үйлдэл",
          key: "actions",
          fixed: "right", // Баруун талд тогтмол байршуулах
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
          width: 150,
          render: (_, record) => (
            <Button type="default" onClick={() => handleDetails(record)}>
              Дэлгэрэнгүй
            </Button>
          ),
<<<<<<< HEAD
        },
      ]);
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Алдаа",
        description: "Өгөгдөл ачаалах үед алдаа гарлаа.",
      });
    } finally {
      setLoading(false);
    }
  }, [activeKey]);

  useEffect(() => {
    fetchTopics();
    const interval = setInterval(fetchTopics, 5000);
    return () => clearInterval(interval);
  }, [fetchTopics]);

  const handleDetails = (record) => {
    setSelectedRowData(record);
    setIsModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsModalOpen(false);
  };

  const items = [
    {
      key: "1",
      label: "Багш дэвшүүлсэн сэдэв",
    },
    {
      key: "2",
      label: "Оюутан дэвшүүлсэн сэдэв",
=======
        });

        setColumns(dynamicColumns); // Багануудыг хадгалах
      }
    } catch (error) {
      // Алдаа гарвал мэдэгдэл харуулах
      console.error("Error fetching topics:", error);
      notification.error({
        message: "Алдаа",
        description: "Мэдээлэл татахад алдаа гарлаа. Дахин оролдоно уу!",
      });
    } finally {
      setLoading(false); // Ачаалал дууссаныг заах
    }
  }, [activeKey]);

  // Анхны ачааллын үед болон таб солигдох үед өгөгдөл татах
  useEffect(() => {
    fetchTopics();
    const intervalId = setInterval(fetchTopics, 5000); // Өгөгдлийг 5 секунд тутамд шинэчлэх

    return () => clearInterval(intervalId); // Interval-ийг цэвэрлэх
  }, [fetchTopics]);

  // Дэлгэрэнгүй цонхыг нээх функц
  const handleDetails = (record) => {
    setSelectedRowData(record); // Сонгосон мөрийн өгөгдлийг хадгалах
    setIsModalOpen(true); // Цонхыг нээх
  };

  // Дэлгэрэнгүй цонхыг хаах функц
  const closeDetailModal = () => {
    setIsModalOpen(false); // Цонхыг хаах
  };

  // Табын тохиргоо
  const items = [
    {
      key: "1", // Табын давтагдашгүй түлхүүр
      label: "Багш дэвшүүлсэн сэдвийн жагсаалт", // Табын гарчиг
    },
    {
      key: "2",
      label: "Оюутан дэвшүүлсэн сэдвийн жагсаалт",
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    },
  ];

  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
<<<<<<< HEAD
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Дэвшүүлсэн сэдвүүдийн жагсаалт</Title>
      </header>

      <Layout style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}>
        <Content style={{ padding: "0 16px" }}>
          <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />

          <Spin spinning={loading}>
            <CustomTable
              bordered
              columns={columns}
              dataSource={dataSource}
              scroll={{ x: "max-content" }}
              hasLookupField={true}
              onRefresh={fetchTopics}
            />
          </Spin>

          {isModalOpen && (
=======
      {/* Хуудасны гарчиг */}
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Дэвшүүлсэн сэдвийн жагсаалт</Title>
      </header>

      {/* Хүснэгт байрлах хэсэг */}
      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
        <Content style={{ padding: "0 16px" }}>
          {/* Табын сонголт */}
          <Tabs
            items={items} // Табын тохиргоо
            activeKey={activeKey} // Идэвхтэй таб
            onChange={handleTabChange} // Таб солигдоход ажиллах функц
          />
          {/* Өгөгдөл ачаалж байгааг харуулах Spin */}
          <Spin spinning={loading}>
            {/* CustomTable ашиглан хүснэгт харуулах */}
            <CustomTable
              bordered // Хүснэгтэд хүрээ нэмэх
              columns={columns} // Хүснэгтийн баганууд
              dataSource={dataSource} // Өгөгдлийн эх сурвалж
              scroll={{ x: "max-content" }} // Хэвтээ гүйлгэх тохиргоо
              hasLookupField={true} // Хайлт хийх боломжтой эсэх
              onRefresh={fetchTopics} // Дахин ачаалах функц
            />
          </Spin>
          {isModalOpen && (
            // Дэлгэрэнгүй мэдээллийн цонхыг харуулах
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
            <TopicDetail
              isModalOpen={isModalOpen}
              data={selectedRowData}
              onClose={closeDetailModal}
            />
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default ProposedTopics;
