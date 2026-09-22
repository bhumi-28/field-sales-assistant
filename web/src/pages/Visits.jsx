import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Layout from '../components/Layout';

function Visits() {
  const [visits, setVisits] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: '', visitDate: '', purpose: '', discussion: '',
    productInterest: '', competitor: '', requirement: '', remarks: '', followUpDate: ''
  });
  const [error, setError] = useState('');
  const [insights, setInsights] = useState({});
  const [analyzing, setAnalyzing] = useState(null);

  const loadData = () => {
    axiosClient.get('/visits').then((res) => setVisits(res.data)).catch(() => setError('Failed to load visits'));
    axiosClient.get('/customers').then((res) => setCustomers(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        customerId: Number(form.customerId),
        visitDate: form.visitDate + 'T10:00:00',
      };
      await axiosClient.post('/visits', payload);
      setForm({
        customerId: '', visitDate: '', purpose: '', discussion: '',
        productInterest: '', competitor: '', requirement: '', remarks: '', followUpDate: ''
      });
      loadData();
    } catch (err) {
      setError('Failed to create visit — check required fields');
    }
  };

  const analyzeVisit = async (visitId) => {
    setAnalyzing(visitId);
    setError('');
    try {
      const res = await axiosClient.post('/ai/analyze-visit', { visitId });
      setInsights({ ...insights, [visitId]: res.data });
    } catch (err) {
      setError('AI analysis failed — is the AI service running on port 8000?');
    } finally {
      setAnalyzing(null);
    }
  };

  const riskColor = (level) => {
    if (level === 'HIGH') return '#e74c3c';
    if (level === 'MEDIUM') return '#f39c12';
    if (level === 'LOW') return '#27ae60';
    return '#888';
  };

  const badge = (label, value) => (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12,
      background: riskColor(value), color: '#fff', marginRight: 6
    }}>
      {label}: {value}
    </span>
  );

  const inputStyle = {
    padding: 8, background: '#1a1d24', border: '1px solid #2a2d36',
    borderRadius: 4, color: '#e7eef7',
  };

  return (
    <Layout>
      <h2>Visits</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, maxWidth: 500 }}>
        <select style={inputStyle} name="customerId" value={form.customerId} onChange={handleChange} required>
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input style={inputStyle} type="date" name="visitDate" value={form.visitDate} onChange={handleChange} required />
        <input style={inputStyle} name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} required />
        <textarea style={inputStyle} name="discussion" placeholder="Discussion notes" value={form.discussion} onChange={handleChange} required />
        <input style={inputStyle} name="productInterest" placeholder="Product Interest" value={form.productInterest} onChange={handleChange} />
        <input style={inputStyle} name="competitor" placeholder="Competitor" value={form.competitor} onChange={handleChange} />
        <input style={inputStyle} name="requirement" placeholder="Requirement" value={form.requirement} onChange={handleChange} />
        <input style={inputStyle} name="remarks" placeholder="Remarks" value={form.remarks} onChange={handleChange} />
        <label>Follow-up date</label>
        <input style={inputStyle} type="date" name="followUpDate" value={form.followUpDate} onChange={handleChange} required />
        <button type="submit">Add Visit</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {visits.map((v) => (
        <div key={v.id} style={{ border: '1px solid #2a2d36', background: '#1a1d24', borderRadius: 6, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{v.customerName}</strong> — {v.purpose}
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {v.visitDate?.split('T')[0]} · Follow-up: {v.followUpDate}
              </div>
            </div>
            <button onClick={() => analyzeVisit(v.id)} disabled={analyzing === v.id}>
              {analyzing === v.id ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </div>

          {insights[v.id] && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2d36' }}>
              <p style={{ margin: '0 0 8px' }}>{insights[v.id].summary}</p>
              <div>
                {badge('Sentiment', insights[v.id].sentiment)}
                {badge('Opportunity', insights[v.id].opportunity)}
                {badge('Priority', insights[v.id].priority)}
                {badge('Competitive Risk', insights[v.id].competitiveRisk)}
              </div>
              <p style={{ marginTop: 8, fontStyle: 'italic' }}>→ {insights[v.id].recommendation}</p>
            </div>
          )}
        </div>
      ))}
    </Layout>
  );
}

export default Visits;