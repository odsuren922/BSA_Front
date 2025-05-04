import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import {
  Layout,
  Spin,
  notification,
  Typography,
  Tag,
  Button,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { fetchData } from "../../utils"; 
import CustomTable from "../../components/CustomTable"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { registerMongolFont } from "../../fonts/noto-mongolian-fonts"; 
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Content } from "antd/es/layout/layout"; // эсвэл "antd/lib/layout/layout"
=======
import { Layout, Spin, notification, Typography, Tag, Button, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { fetchData } from "../../utils";
import CustomTable from "../../components/CustomTable";
import { Content } from "antd/lib/layout/layout";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

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
<<<<<<< HEAD
        <Tag color={is_choosed ? "green" : "volcano"}>
=======
        <Tag color={is_choosed ? "green" : "yellow"}>
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
          {is_choosed ? "Тийм" : "Үгүй"}
        </Tag>
      ),
    },
<<<<<<< HEAD
    {
      title: "Сэдвийн нэр",
      dataIndex: "topic_title",
      key: "topic_title",
      render: (_, record) =>
        record.is_choosed ? record.topic_title || "-" : "-",
    },
    {
      title: "Удирдагч багш",
      dataIndex: "teacher_name",
      key: "teacher_name",
      render: (_, record) =>
        record.is_choosed ? record.teacher_name || "-" : "-",
    },
    { title: "Цахим хаяг", dataIndex: "mail", key: "mail" },
    { title: "Утас", dataIndex: "phone", key: "phone" },
=======
    { title: "Цахим хаяг", dataIndex: "mail", key: "mail" },
    { title: "Утасны дугаар", dataIndex: "phone", key: "phone" },
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  ];

  const fetchStudents = async () => {
    try {
      const rawData = await fetchData("students/all");
<<<<<<< HEAD
      if (!rawData.length) throw new Error("No student data found");
      setDataSource(rawData);
=======
      if (!rawData.length) throw new Error("No data returned");

      setDataSource(rawData);
      setLoading(false);
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
    } catch (error) {
      console.error("Error fetching students:", error);
      notification.error({
        message: "Алдаа",
<<<<<<< HEAD
        description: "Оюутнуудын мэдээлэл татахад алдаа гарлаа.",
      });
    } finally {
=======
        description: "Оюутнуудын мэдээллийг татахад алдаа гарлаа.",
      });
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

<<<<<<< HEAD
  const filteredForExport = () =>
    dataSource
      .filter((s) => s.is_choosed)
      .map((s) => ({
        SISI_ID: s.sisi_id,
        Нэр: s.firstname,
        Овог: s.lastname,
        Хөтөлбөр: s.program,
        Сэдэв: s.topic_title || "-",
        УдирдагчБагш: s.teacher_name || "-",
        Имэйл: s.mail,
        Утас: s.phone,
      }));

  const handleDownloadPDF = () => {
    registerMongolFont();
    const doc = new jsPDF();
    doc.setFont("NotoSansMongolian");
    doc.setFontSize(18);

    const rows = filteredForExport();
    const tableColumn = [
      "SISI ID", "Нэр", "Овог", "Хөтөлбөр",
      "Сэдэв", "Удирдагч Багш", "Имэйл", "Утас"
    ];
    const tableRows = rows.map((r) => Object.values(r));

    let currentPage = 1;
    const rowsPerPage = 20;

    for (let i = 0; i < tableRows.length; i += rowsPerPage) {
      if (currentPage > 1) doc.addPage();
      doc.text("Сэдэв сонгосон оюутны жагсаалт", 14, 22);
      doc.text(`Хуудас ${currentPage}`, 180, 15);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows.slice(i, i + rowsPerPage),
        startY: 30,
      });
      currentPage++;
    }

    doc.save("sedev-songoson-oyutnuud.pdf");
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredForExport());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Оюутнууд");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "oyutnuud.xlsx");
  };

  const handleDownloadCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredForExport());
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "oyutnuud.csv");
=======
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
    ]);

    autoTable(doc, {
      startY: 20,
      head: [["SISI ID", "Нэр", "Овог", "Хөтөлбөр", "Сэдэв", "Цахим хаяг", "Утас"]],
      body: tableData,
    });

    doc.save("Оюутны жагсаалт.pdf");
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
  };

  return (
    <div style={{ padding: "0 16px", background: "transparent" }}>
      <header style={{ textAlign: "left" }}>
        <Title level={3}>Оюутны Жагсаалт</Title>
      </header>

<<<<<<< HEAD
      <Layout style={{ background: "white", borderRadius: "10px", padding: "16px 0" }}>
        <Content style={{ padding: "0 16px" }}>
          <div className="p-4">
            <Spin spinning={loading}>
              <div style={{ marginBottom: "16px", textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadPDF}
                  style={{ marginRight: 8 }}
                >
                  PDF татах
                </Button>
                <Button onClick={handleDownloadExcel} style={{ marginRight: 8 }}>
                  Excel татах
                </Button>
                <Button onClick={handleDownloadCSV}>CSV татах</Button>
              </div>
=======
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
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

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
