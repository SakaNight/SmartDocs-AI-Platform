import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Typography, Button, Modal, Upload, message, Space, Popconfirm } from 'antd';
import { UploadOutlined, FileSearchOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Document {
  id: number;
  filename: string;
  upload_time: string;
  chunk_count: number;
  status: string;
}

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbnVzZXI1Iiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ3MDc2ODc2fQ.knJO0QkMABJmUg6IzP-JfwkcouaBZocdu9krnwV14IA'; // TODO: Replace with your admin token

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChunks, setShowChunks] = useState(false);
  const [chunks, setChunks] = useState<string[]>([]);
  const [current, setCurrent] = useState<Document | null>(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  function fetchDocs() {
    setLoading(true);
    fetch('http://127.0.0.1:8000/admin/docs', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        setDocs(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  useEffect(() => { fetchDocs(); }, []);

  function handleDelete(doc: Document) {
    fetch(`http://127.0.0.1:8000/admin/docs/${doc.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'Document deleted') { fetchDocs(); message.success('Document deleted'); }
        else setMsg(data.detail || 'Failed to delete');
      });
  }

  function handleShowChunks(doc: Document) {
    setCurrent(doc);
    setShowChunks(true);
    fetch(`http://127.0.0.1:8000/admin/docs/${doc.id}/chunks`, {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setChunks(data.chunks || []));
  }

  function handleReembed(doc: Document) {
    fetch(`http://127.0.0.1:8000/admin/docs/${doc.id}/reembed`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'Re-embedded') { fetchDocs(); message.success('Re-embedded'); }
        else setMsg(data.detail || 'Failed to re-embed');
      });
  }

  function handleDeleteEmbedding(doc: Document) {
    fetch(`http://127.0.0.1:8000/admin/docs/${doc.id}/embedding`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg) { fetchDocs(); message.success('Embedding deleted'); }
        else setMsg(data.detail || 'Failed to delete embedding');
      });
  }

  function handleUpload({ file }: any) {
    setUploading(true);
    setMsg('');
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://127.0.0.1:8000/embed/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        setUploading(false);
        if (data.doc_id) {
          fetchDocs();
          message.success('Upload successful');
        } else setMsg(data.detail || 'Upload failed');
      });
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Filename', dataIndex: 'filename', width: 220 },
    { title: 'Upload Time', dataIndex: 'upload_time', width: 180 },
    { title: 'Chunks', dataIndex: 'chunk_count', width: 100 },
    { title: 'Status', dataIndex: 'status', width: 120 },
    {
      title: 'Actions',
      key: 'actions',
      width: 320,
      render: (_: any, doc: Document) => (
        <Space>
          <Button icon={<FileSearchOutlined />} size="small" onClick={() => handleShowChunks(doc)}>View Chunks</Button>
          <Button icon={<RedoOutlined />} size="small" onClick={() => handleReembed(doc)}>Re-embed</Button>
          <Button icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteEmbedding(doc)}>Delete Embedding</Button>
          <Popconfirm title="Delete this document?" onConfirm={() => handleDelete(doc)} okText="Yes" cancelText="No">
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
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