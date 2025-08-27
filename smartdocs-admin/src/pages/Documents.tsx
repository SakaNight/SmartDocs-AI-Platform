import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Typography, Button, Modal, Upload, message, Space, Popconfirm } from 'antd';
import { UploadOutlined, FileSearchOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import api from "../services/api";

const { Title } = Typography;

interface Document {
  id: number;
  filename: string;
  upload_time: string;
  chunk_count: number;
  status: string;
}

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChunks, setShowChunks] = useState(false);
  const [chunks, setChunks] = useState<string[]>([]);
  const [current, setCurrent] = useState<Document | null>(null);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  async function fetchDocs() {
    try {
      setLoading(true);
      const res = await api.get("/admin/docs");
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      console.error(e);
      message.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocs();
  }, []);

  async function handleDelete(doc: Document) {
    try {
      const res = await api.delete(`/admin/docs/${doc.id}`);
      if (res.data?.msg === "Document deleted") {
        message.success("Document deleted");
        fetchDocs();
      } else {
        setMsg(res.data?.detail || "Failed to delete");
      }
    } catch (e: any) {
      console.error(e);
      setMsg("Failed to delete");
    }
  }

  async function handleShowChunks(doc: Document) {
    try {
      setCurrent(doc);
      setShowChunks(true);
      const res = await api.get(`/admin/docs/${doc.id}/chunks`);
      setChunks(res.data?.chunks || []);
    } catch (e: any) {
      console.error(e);
      setChunks([]);
    }
  }

  async function handleReembed(doc: Document) {
    try {
      const res = await api.post(`/admin/docs/${doc.id}/reembed`);
      if (res.data?.msg === "Re-embedded") {
        message.success("Re-embedded");
        fetchDocs();
      } else {
        setMsg(res.data?.detail || "Failed to re-embed");
      }
    } catch (e: any) {
      console.error(e);
      setMsg("Failed to re-embed");
    }
  }

  async function handleDeleteEmbedding(doc: Document) {
    try {
      const res = await api.delete(`/admin/docs/${doc.id}/embedding`);
      if (res.data?.msg) {
        message.success("Embedding deleted");
        fetchDocs();
      } else {
        setMsg(res.data?.detail || "Failed to delete embedding");
      }
    } catch (e: any) {
      console.error(e);
      setMsg("Failed to delete embedding");
    }
  }

  async function handleUpload({ file }: any) {
    try {
      setUploading(true);
      setMsg("");
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/embed/", formData);
      if (res.data?.doc_id) {
        message.success("Upload successful");
        fetchDocs();
      } else {
        setMsg(res.data?.detail || "Upload failed");
      }
    } catch (e: any) {
      console.error(e);
      setMsg("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "Filename", dataIndex: "filename", width: 220 },
    { title: "Upload Time", dataIndex: "upload_time", width: 180 },
    { title: "Chunks", dataIndex: "chunk_count", width: 100 },
    { title: "Status", dataIndex: "status", width: 120 },
    {
      title: "Actions",
      key: "actions",
      width: 320,
      render: (_: any, doc: Document) => (
        <Space>
          <Button
            icon={<FileSearchOutlined />}
            size="small"
            onClick={() => handleShowChunks(doc)}
          >
            View Chunks
          </Button>
          <Button
            icon={<RedoOutlined />}
            size="small"
            onClick={() => handleReembed(doc)}
          >
            Re-embed
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteEmbedding(doc)}
          >
            Delete Embedding
          </Button>
          <Popconfirm
            title="Delete this document?"
            onConfirm={() => handleDelete(doc)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
      <Card style={{ width: '100%', maxWidth: 1200, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }} bodyStyle={{ padding: 32 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>Document Management</Title>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Upload
            customRequest={handleUpload}
            showUploadList={false}
            accept=".pdf,.txt"
            disabled={uploading}
          >
            <Button icon={<UploadOutlined />} loading={uploading} type="primary">Upload</Button>
          </Upload>
          <span style={{ color: 'red' }}>{msg}</span>
        </div>
        <Table
          columns={columns}
          dataSource={docs}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          size="middle"
        />
      </Card>
      {/* Chunks Modal */}
      <Modal
        open={showChunks}
        title={`Chunks of ${current?.filename}`}
        onCancel={() => setShowChunks(false)}
        footer={<Button onClick={() => setShowChunks(false)}>Close</Button>}
        width={700}
      >
        <div style={{ maxHeight: 400, overflow: 'auto', marginBottom: 12 }}>
          <ol>
            {chunks.map((c, i) => <li key={i} style={{ marginBottom: 8 }}>{c}</li>)}
          </ol>
        </div>
      </Modal>
    </div>
  );
};

export default Documents; 
