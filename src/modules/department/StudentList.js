import React, { useState, useEffect } from "react";
import { Layout, Spin, notification, Typography, Tag, Button, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { fetchData } from "../../utils";
import CustomTable from "../../components/CustomTable";
import { Content } from "antd/lib/layout/layout";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
//TODO:: ACTIVE STUDENT AND THEIR YEARS
const { Title } = Typography;

const StudentList = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);

  const columns = [
    { title: "SISI ID", dataIndex: "sisi_id", key: "id" },
    { title: "Нэр", dataIndex: "firstname", key: "name" },
    { title: "Овог", dataIndex: "lastname", key: "lname" },
    { title: "Хөтөлбөр", dataIndex: "program", key: "program" },
    {
      title: "Сэдэв сонгосон эсэх",
      dataIndex: "is_choosed",
      key: "is_choosed",
      filters: [
        { text: "Тийм", value: true },
        { text: "Үгүй", value: false },
      ],
      onFilter: (value, record) => record.is_choosed === value,
      render: (is_choosed) => (
        <Tag color={is_choosed ? "green" : "yellow"}>
          {is_choosed ? "Тийм" : "Үгүй"}
        </Tag>
      ),
    },
    { title: "Цахим хаяг", dataIndex: "mail", key: "mail" },
    { title: "Утасны дугаар", dataIndex: "phone", key: "phone" },
    { title: "Төлөв", dataIndex: "status", key: "status" },
  ];

  const fetchStudents = async () => {
    try {
      const rawData = await fetchData("students/all");
      if (!rawData.length) throw new Error("No data returned");

      setDataSource(rawData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      notification.error({
        message: "Алдаа",
        description: "Оюутнуудын мэдээллийг татахад алдаа гарлаа.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🎯 Excel экспорт
  const exportToExcel = () => {
    const data = dataSource.map((row) => ({
      "SISI ID": row.sisi_id,
      "Нэр": row.firstname,
      "Овог": row.lastname,
      "Хөтөлбөр": row.program,
      "Сэдэв сонгосон эсэх": row.is_choosed ? "Тийм" : "Үгүй",
      "Цахим хаяг": row.mail,
      "Утасны дугаар": row.phone,
      'status': row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Оюутнууд");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Оюутны жагсаалт.xlsx");
  };

  // 📄 PDF экспорт
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Оюутны жагсаалт", 14, 15);

    const tableData = dataSource.map((row) => [
      row.sisi_id,
      row.firstname,
      row.lastname,
      row.program,
      row.is_choosed ? "Тийм" : "Үгүй",
      row.mail,
      row.phone,
        row.status,
    ]);

    autoTable(doc, {
      startY: 20,
      head: [["SISI ID", "Нэр", "Овог", "Хөтөлбөр", "Сэдэв", "Цахим хаяг", "Утас", 'status']],
      body: tableData,
    });

    doc.save("Оюутны жагсаалт.pdf");
  };

  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Оюутны Жагсаалт</Title>
      </header>

      <Layout
        style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}
      >
        <Content style={{ padding: "0 16px" }}>
          <div className="p-4">
            <Spin spinning={loading}>
              {/* Экспорт товчлуурууд */}
              <Space style={{ marginBottom: 16 }}>
                <Button icon={<DownloadOutlined />} onClick={exportToExcel}>
                  Excel татах
                </Button>
                <Button icon={<DownloadOutlined />} onClick={exportToPDF}>
                  PDF татах
                </Button>
              </Space>

              <CustomTable
                columns={columns}
                dataSource={dataSource}
                bordered
                scroll={{ x: "max-content" }}
                hasLookupField={true}
                onRefresh={fetchStudents}
              />
            </Spin>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default StudentList;
