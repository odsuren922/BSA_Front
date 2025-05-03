import React, { useState, useEffect } from "react";
import { Upload, Button, message, List } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import api from "../../context/api_helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const ThesisFileUpload = ({ thesisId }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const res = await api.get(`/thesis/${thesisId}/files`);
    setFiles(res.data);
  };

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/thesis/${thesisId}/upload-file`, formData);
      toast.success("Таны тайлан амжилттай илгээгдлээ");
      fetchFiles();
    } catch {
      message.error("Алдаа гарлаа");
    }
  };

  return (
    <>
      <Upload
        customRequest={handleUpload}
        accept="application/pdf"
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>PDF Upload</Button>
      </Upload>

      {files.length > 0 ? (
  <List
    dataSource={[files[files.length - 1]]}
    renderItem={(file) => (
      <List.Item>
        {file.original_name} —
        <a
          href={`http://127.0.0.1:8000/storage/${file.file_path}`}
          target="_blank"
          rel="noreferrer"
        >
          Харах
        </a>
      </List.Item>
    )}
  />
) : (
  <div>Файл олдсонгүй</div>
)}

    </>
  );
};

export default ThesisFileUpload;
