import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Statistic, Row, Col } from 'antd';

const { Title } = Typography;

interface StatsData {
  user_count: number;
  doc_count: number;
  request_count: number;
}

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbnVzZXI1Iiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ3MDc2ODc2fQ.knJO0QkMABJmUg6IzP-JfwkcouaBZocdu9krnwV14IA'; // TODO: Replace with your admin token

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/admin/stats', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
      <Card style={{ width: '100%', maxWidth: 600, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }} bodyStyle={{ padding: 32 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>Platform Statistics</Title>
        {loading ? <p>Loading...</p> : stats && (
          <Row gutter={32} justify="center">
            <Col><Statistic title="Users" value={stats.user_count} /></Col>
            <Col><Statistic title="Documents" value={stats.doc_count} /></Col>
            <Col><Statistic title="Requests" value={stats.request_count} /></Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default Stats; 