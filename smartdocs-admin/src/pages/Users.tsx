import React, { useEffect, useState } from 'react';
import { Card, Table, Typography, Button, Modal, Form, Input, Select, Space, message, Popconfirm } from 'antd';

const { Title } = Typography;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

const PAGE_SIZE = 10;
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbnVzZXI1Iiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ3MDc2ODc2fQ.knJO0QkMABJmUg6IzP-JfwkcouaBZocdu9krnwV14IA'; // TODO: Replace with your admin token

const emptyUser = { id: 0, username: '', email: '', role: 'user', created_at: '' };

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [current, setCurrent] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [resetPwd, setResetPwd] = useState('');
  const [msg, setMsg] = useState('');

  function fetchUsers() {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/admin/users?skip=${(page-1)*PAGE_SIZE}&limit=${PAGE_SIZE}&q=${q}`,
      { headers: { 'Authorization': 'Bearer ' + token } })
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }

  useEffect(() => { fetchUsers(); }, [q, page]);

  // Add User
  function handleAdd(values: any) {
    setMsg('');
    fetch('http://127.0.0.1:8000/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(values)
    })
      .then(res => res.json())
      .then(data => {
        if (data.user_id) {
          setShowAdd(false); form.resetFields(); fetchUsers(); message.success('User added');
        } else { setMsg(data.detail || 'Failed to add user'); }
      });
  }

  // Edit User
  function handleEdit(values: any) {
    if (!current) return;
    setMsg('');
    fetch(`http://127.0.0.1:8000/admin/users/${current.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(values)
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'User updated') {
          setShowEdit(false); fetchUsers(); message.success('User updated');
        } else { setMsg(data.detail || 'Failed to update user'); }
      });
  }

  // Delete User
  function handleDelete(user: User) {
    setMsg('');
    fetch(`http://127.0.0.1:8000/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'User deleted') {
          setShowDelete(false); fetchUsers(); message.success('User deleted');
        } else { setMsg(data.detail || 'Failed to delete user'); }
      });
  }

  // Reset Password
  function handleResetPwd() {
    if (!current) return;
    setMsg('');
    fetch(`http://127.0.0.1:8000/admin/users/${current.id}/reset_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ new_password: resetPwd })
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'Password reset') {
          setShowReset(false); setResetPwd(''); message.success('Password reset');
        } else { setMsg(data.detail || 'Failed to reset password'); }
      });
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Username', dataIndex: 'username', width: 120 },
    { title: 'Email', dataIndex: 'email', width: 180 },
    { title: 'Role', dataIndex: 'role', width: 100 },
    { title: 'Created At', dataIndex: 'created_at', width: 180 },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_: any, user: User) => (
        <Space>
          <Button size="small" onClick={() => { setCurrent(user); setShowEdit(true); form.setFieldsValue(user); }}>Edit</Button>
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(user)} okText="Yes" cancelText="No">
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
          <Button size="small" onClick={() => { setCurrent(user); setShowReset(true); setResetPwd(''); }}>Reset Password</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
      <Card style={{ width: '100%', maxWidth: 1100, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }} bodyStyle={{ padding: 32 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>User Management</Title>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Search username or email"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            style={{ width: 260 }}
            allowClear
          />
          <Button type="primary" onClick={() => { setShowAdd(true); form.resetFields(); }}>Add User</Button>
        </div>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: PAGE_SIZE, current: page, onChange: setPage }}
          bordered
          size="middle"
        />
      </Card>
      {/* Add User Modal */}
      <Modal
        open={showAdd}
        title="Add User"
        onCancel={() => setShowAdd(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> <Input /> </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}> <Input.Password /> </Form.Item>
          <Form.Item name="role" label="Role" initialValue="user" rules={[{ required: true }]}> <Select><Option value="user">user</Option><Option value="admin">admin</Option></Select> </Form.Item>
        </Form>
      </Modal>
      {/* Edit User Modal */}
      <Modal
        open={showEdit}
        title="Edit User"
        onCancel={() => setShowEdit(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form form={form} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}> <Input /> </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}> <Select><Option value="user">user</Option><Option value="admin">admin</Option></Select> </Form.Item>
        </Form>
      </Modal>
      {/* Reset Password Modal */}
      <Modal
        open={showReset}
        title="Reset Password"
        onCancel={() => setShowReset(false)}
        onOk={handleResetPwd}
        okText="Submit"
      >
        <Input.Password placeholder="New Password" value={resetPwd} onChange={e => setResetPwd(e.target.value)} />
      </Modal>
    </div>
  );
};

export default Users; 