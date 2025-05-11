import React, { useEffect, useState, useRef } from 'react';

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
  const fileInput = useRef<HTMLInputElement>(null);

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
    if (!window.confirm(`Delete document "${doc.filename}"?`)) return;
    fetch(`http://127.0.0.1:8000/admin/docs/${doc.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'Document deleted') fetchDocs();
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
    if (!window.confirm(`Re-embed document "${doc.filename}"?`)) return;
    fetch(`http://127.0.0.1:8000/admin/docs/${doc.id}/reembed`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg === 'Re-embedded') fetchDocs();
        else setMsg(data.detail || 'Failed to re-embed');
      });
  }

  function handleDeleteEmbedding(doc: Document) {
    if (!window.confirm(`Delete embedding for document "${doc.filename}"?`)) return;
    fetch(`http://127.0.0.1:8000/admin/docs/${doc.id}/embedding`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg) fetchDocs();
        else setMsg(data.detail || 'Failed to delete embedding');
      });
  }

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const file = fileInput.current?.files?.[0];
    if (!file) return setMsg('Please select a file');
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://127.0.0.1:8000/embed/', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.doc_id) {
          fetchDocs();
          if (fileInput.current) fileInput.current.value = '';
        } else setMsg(data.detail || 'Upload failed');
      });
  }

  return (
    <div style={{ padding: 32 }}>
      <h2>Document Management</h2>
      <form onSubmit={handleUpload} style={{ marginBottom: 16 }}>
        <input type="file" ref={fileInput} accept=".pdf,.txt" style={{ marginRight: 12 }} />
        <button type="submit">Upload</button>
        <span style={{ color: 'red', marginLeft: 16 }}>{msg}</span>
      </form>
      {loading ? <p>Loading...</p> : (
        <table border={1} cellPadding={8} style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Filename</th>
              <th>Upload Time</th>
              <th>Chunks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => (
              <tr key={doc.id}>
                <td>{doc.id}</td>
                <td>{doc.filename}</td>
                <td>{doc.upload_time}</td>
                <td>{doc.chunk_count}</td>
                <td>{doc.status}</td>
                <td>
                  <button style={{ marginRight: 8 }} onClick={() => handleShowChunks(doc)}>View Chunks</button>
                  <button style={{ marginRight: 8 }} onClick={() => handleReembed(doc)}>Re-embed</button>
                  <button style={{ marginRight: 8 }} onClick={() => handleDeleteEmbedding(doc)}>Delete Embedding</button>
                  <button onClick={() => handleDelete(doc)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Chunks Modal */}
      {showChunks && (
        <div style={modalStyle}>
          <div style={modalBoxStyle}>
            <h3>Chunks of {current?.filename}</h3>
            <div style={{ maxHeight: 300, overflow: 'auto', marginBottom: 12 }}>
              <ol>
                {chunks.map((c, i) => <li key={i} style={{ marginBottom: 8 }}>{c}</li>)}
              </ol>
            </div>
            <button onClick={() => setShowChunks(false)}>Close</button>
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

export default Documents; 