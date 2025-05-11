import React, { useEffect, useState } from 'react';

interface LogEntry {
  id: number;
  user: string;
  endpoint: string;
  method: string;
  timestamp: string;
}

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbnVzZXI1Iiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ3MDc2ODc2fQ.knJO0QkMABJmUg6IzP-JfwkcouaBZocdu9krnwV14IA'; // TODO: 替换为你的admin token
    fetch('http://127.0.0.1:8000/admin/logs', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => {
        console.log(res.status); // <--- 这里可以看到状态码
        return res.json();
      })
      .then(data => {
        // 兼容后端直接返回数组或对象
        const logs = Array.isArray(data) ? data : (data.logs || []);
        setLogs(logs);
        setLoading(false);
      });
  }, []);
  return (
    <div style={{ padding: 32 }}>
      <h2>API Request Logs</h2>
      {loading ? <p>Loading...</p> : (
        <table border={1} cellPadding={8} style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Endpoint</th>
              <th>Method</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.user}</td>
                <td>{log.endpoint}</td>
                <td>{log.method}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Logs; 