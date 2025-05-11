import React, { useEffect, useState } from 'react';

interface StatsData {
  user_count: number;
  doc_count: number;
  request_count: number;
}

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbnVzZXI1Iiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ3MDc2ODc2fQ.knJO0QkMABJmUg6IzP-JfwkcouaBZocdu9krnwV14IA';
    fetch('http://127.0.0.1:8000/admin/stats', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => res.json())
      .then(setStats);
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2>Platform Statistics</h2>
      {stats ? (
        <ul>
          <li>User Count: {stats.user_count}</li>
          <li>Document Count: {stats.doc_count}</li>
          <li>Request Count: {stats.request_count}</li>
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Stats; 