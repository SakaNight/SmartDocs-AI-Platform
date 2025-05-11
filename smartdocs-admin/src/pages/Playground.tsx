import React, { useState, useEffect } from 'react';

interface Document {
  id: number;
  filename: string;
}

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbnVzZXI1Iiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ3MDc2ODc2fQ.knJO0QkMABJmUg6IzP-JfwkcouaBZocdu9krnwV14IA'; // TODO: Replace with your admin token

const Playground: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [retrieved, setRetrieved] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<Document[]>([]);
  const [docId, setDocId] = useState<number | ''>('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/admin/docs', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => setDocs(Array.isArray(data) ? data : []));
  }, []);

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAnswer('');
    setRetrieved([]);
    setMsg('');
    fetch('http://127.0.0.1:8000/ask/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ query: question }) // 如需限定文档可扩展
    })
      .then(res => res.json())
      .then(data => {
        setAnswer(data.answer || '');
        setRetrieved(data.retrieved || []);
        setLoading(false);
      })
      .catch(() => { setMsg('Error occurred'); setLoading(false); });
  }

  return (
    <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
      <h2>RAG Playground</h2>
      <form onSubmit={handleAsk} style={{ marginBottom: 24 }}>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          rows={3}
          style={{ width: '100%', marginBottom: 12 }}
        />
        {/* 可选文档下拉框，暂不生效 */}
        {/* <select value={docId} onChange={e => setDocId(Number(e.target.value))} style={{ marginBottom: 12 }}>
          <option value="">All Documents</option>
          {docs.map(doc => <option key={doc.id} value={doc.id}>{doc.filename}</option>)}
        </select> */}
        <div>
          <button type="submit" disabled={loading || !question.trim()} style={{ padding: '6px 18px' }}>
            {loading ? 'Asking...' : 'Ask'}
          </button>
          <span style={{ color: 'red', marginLeft: 16 }}>{msg}</span>
        </div>
      </form>
      {retrieved.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4>Retrieved Chunks</h4>
          <ol>
            {retrieved.map((c, i) => <li key={i} style={{ marginBottom: 8 }}>{c}</li>)}
          </ol>
        </div>
      )}
      {answer && (
        <div style={{ background: '#f6f6f6', padding: 16, borderRadius: 6 }}>
          <h4>LLM Answer</h4>
          <div>{answer}</div>
        </div>
      )}
    </div>
  );
};

export default Playground; 