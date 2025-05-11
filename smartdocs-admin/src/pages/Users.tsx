import React, { useEffect, useState } from 'react';

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
  const [current, setCurrent] = useState<User>(emptyUser);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });
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
  function handleAdd() {
    setMsg('');
    fetch('http://127.0.0.1:8000/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        if (data.user_id) {
          setShowAdd(false); setForm({ username: '', email: '', password: '', role: 'user' }); fetchUsers();
        } else { setMsg(data.detail || 'Failed to add user'); }
      });
  }

  // Edit User
  function handleEdit() {
    setMsg('');
    fetch(`http://127.0.0.1:8000/admin/users/${current.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ email: form.email, role: form.role })
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'User updated') {
          setShowEdit(false); fetchUsers();
        } else { setMsg(data.detail || 'Failed to update user'); }
      });
  }

  // Delete User
  function handleDelete() {
    setMsg('');
    fetch(`http://127.0.0.1:8000/admin/users/${current.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'User deleted') {
          setShowDelete(false); fetchUsers();
        } else { setMsg(data.detail || 'Failed to delete user'); }
      });
  }

  // Reset Password
  function handleResetPwd() {
    setMsg('');
    fetch(`http://127.0.0.1:8000/admin/users/${current.id}/reset_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ new_password: resetPwd })
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'Password reset') {
          setShowReset(false); setResetPwd('');
        } else { setMsg(data.detail || 'Failed to reset password'); }
      });
  }

  return (
    <div style={{ padding: 32 }}>
      <h2>User Management</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Search username or email"
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1); }}
          style={{ marginRight: 16, padding: 4 }}
        />
        <button style={{ padding: '4px 12px' }} onClick={() => { setShowAdd(true); setForm({ username: '', email: '', password: '', role: 'user' }); setMsg(''); }}>Add User</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <table border={1} cellPadding={8} style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.created_at}</td>
                <td>
                  <button style={{ marginRight: 8 }} onClick={() => { setCurrent(u); setForm({ ...u, password: '' }); setShowEdit(true); setMsg(''); }}>Edit</button>
                  <button style={{ marginRight: 8 }} onClick={() => { setCurrent(u); setShowDelete(true); setMsg(''); }}>Delete</button>
                  <button onClick={() => { setCurrent(u); setShowReset(true); setResetPwd(''); setMsg(''); }}>Reset Password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 16 }}>
        <button disabled={page === 1} onClick={() => setPage(page-1)}>Prev</button>
        <span style={{ margin: '0 12px' }}>Page {page}</span>
        <button disabled={users.length < PAGE_SIZE} onClick={() => setPage(page+1)}>Next</button>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div style={modalStyle}>
          <div style={modalBoxStyle}>
            <h3>Add User</h3>
            <input placeholder="Username" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={{ marginBottom: 8 }} />
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ marginBottom: 8 }} />
            <input placeholder="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ marginBottom: 8 }} />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ marginBottom: 8 }}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <div style={{ color: 'red', minHeight: 20 }}>{msg}</div>
            <button onClick={handleAdd} style={{ marginRight: 8 }}>Submit</button>
            <button onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {showEdit && (
        <div style={modalStyle}>
          <div style={modalBoxStyle}>
            <h3>Edit User</h3>
            <div>Username: {current.username}</div>
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ marginBottom: 8 }} />
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ marginBottom: 8 }}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <div style={{ color: 'red', minHeight: 20 }}>{msg}</div>
            <button onClick={handleEdit} style={{ marginRight: 8 }}>Submit</button>
            <button onClick={() => setShowEdit(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Delete User Modal */}
      {showDelete && (
        <div style={modalStyle}>
          <div style={modalBoxStyle}>
            <h3>Delete User</h3>
            <div>Are you sure to delete user "{current.username}"?</div>
            <div style={{ color: 'red', minHeight: 20 }}>{msg}</div>
            <button onClick={handleDelete} style={{ marginRight: 8 }}>Confirm</button>
            <button onClick={() => setShowDelete(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* Reset Password Modal */}
      {showReset && (
        <div style={modalStyle}>
          <div style={modalBoxStyle}>
            <h3>Reset Password</h3>
            <div>Username: {current.username}</div>
            <input placeholder="New Password" type="password" value={resetPwd} onChange={e => setResetPwd(e.target.value)} style={{ marginBottom: 8 }} />
            <div style={{ color: 'red', minHeight: 20 }}>{msg}</div>
            <button onClick={handleResetPwd} style={{ marginRight: 8 }}>Submit</button>
            <button onClick={() => setShowReset(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyle: React.CSSProperties = {
  position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalBoxStyle: React.CSSProperties = {
  background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
};

export default Users; 