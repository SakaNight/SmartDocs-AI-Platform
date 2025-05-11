import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { RocketOutlined, ExperimentOutlined, FileSearchOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => (
  <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }}>
    <Card
      style={{ maxWidth: 480, width: '100%', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
      bordered={false}
      bodyStyle={{ padding: 36 }}
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Title level={2} style={{ textAlign: 'center', color: '#1677ff', marginBottom: 0 }}>
          <RocketOutlined style={{ marginRight: 12 }} />
          SmartDocs AI Platform
        </Title>
        <Paragraph style={{ textAlign: 'center', color: '#eee', fontSize: 18 }}>
          Welcome to <Text strong style={{ color: '#fff' }}>SmartDocs AI</Text>!<br />
          A modern RAG-powered platform for intelligent document retrieval, Q&A, management and analytics.
        </Paragraph>
        <Space direction="horizontal" style={{ width: '100%', justifyContent: 'center' }}>
          <Button type="primary" size="large" icon={<FileSearchOutlined />} href="/playground">
            Try Playground
          </Button>
          <Button size="large" icon={<ExperimentOutlined />} href="/documents">
            Manage Documents
          </Button>
        </Space>
      </Space>
    </Card>
  </div>
);

export default Home; 