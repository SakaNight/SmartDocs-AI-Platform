import React, { useEffect, useState } from 'react';
import { Card, Table, Typography } from 'antd';

const { Title } = Typography;

interface LogEntry {
  id: number;
  user: string;
  endpoint: string;
  method: string;
  timestamp: string;
}

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbnVzZXI1Iiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ3MDc2ODc2fQ.knJO0QkMABJmUg6IzP-JfwkcouaBZocdu9krnwV14IA'; // TODO: Replace with your admin token

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/admin/logs', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        const logs = Array.isArray(data) ? data : (data.logs || []);
        setLogs(logs);
        setLoading(false);
      });
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'User', dataIndex: 'user', width: 120 },
    { title: 'Endpoint', dataIndex: 'endpoint', width: 200 },
    { title: 'Method', dataIndex: 'method', width: 100 },
    { title: 'Time', dataIndex: 'timestamp', width: 220 },
  ];

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
      <Card style={{ width: '100%', maxWidth: 900, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }} bodyStyle={{ padding: 32 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>API Request Logs</Title>
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Logs; 