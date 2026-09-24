import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Layout from '../components/Layout';

function AiInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ sentiment: '', opportunity: '', priority: '' });

  useEffect(() => {
    axiosClient
      .get('/ai/insights')
      .then((res) => setInsights(res.data))
      .catch(() => setError('Failed to load AI insights'))
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const levelColor = (level) => {
    if (level === 'POSITIVE' || level === 'HIGH') return '#27ae60';
    if (level === 'NEUTRAL' || level === 'MEDIUM') return '#f39c12';
    if (level === 'NEGATIVE' || level === 'LOW') return '#e74c3c';
    return '#888';
  };

  const badge = (label, value) => (
    <span
      style={{
        display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 12,
        background: levelColor(value), color: '#fff', marginRight: 6,
      }}
    >
      {label}: {value}
    </span>
  );

  const inputStyle = {
    padding: 8, background: '#1a1d24', border: '1px solid #2a2d36',
    borderRadius: 4, color: '#e7eef7',
  };

  const filtered = insights.filter((i) => {
    if (filters.sentiment && i.sentiment !== filters.sentiment) return false;
    if (filters.opportunity && i.opportunity !== filters.opportunity) return false;
    if (filters.priority && i.priority !== filters.priority) return false;
    return true;
  });

  return (
    <Layout>
      <h2>AI Insights</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div
        style={{
          display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20,
          padding: 12, background: '#1a1d24', border: '1px solid #2a2d36', borderRadius: 6,
        }}
      >
        <span style={{ fontSize: 13, opacity: 0.7 }}>Filter:</span>
        <select style={inputStyle} name="sentiment" value={filters.sentiment} onChange={handleFilterChange}>
          <option value="">All Sentiments</option>
          <option value="POSITIVE">Positive</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="NEGATIVE">Negative</option>
        </select>
        <select style={inputStyle} name="opportunity" value={filters.opportunity} onChange={handleFilterChange}>
          <option value="">All Opportunities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select style={inputStyle} name="priority" value={filters.priority} onChange={handleFilterChange}>
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        {(filters.sentiment || filters.opportunity || filters.priority) && (
          <button onClick={() => setFilters({ sentiment: '', opportunity: '', priority: '' })}>Clear</button>
        )}
      </div>

      {loading && <p style={{ opacity: 0.6 }}>Loading insights...</p>}

      {!loading && filtered.map((i) => (
        <div key={i.id} style={{ border: '1px solid #2a2d36', background: '#1a1d24', borderRadius: 6, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>{i.customerName}</strong>
              {i.productInterest && <span style={{ opacity: 0.7 }}> — {i.productInterest}</span>}
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {i.visitDate?.split('T')[0]}
                {i.competitor && ` · Competitor: ${i.competitor}`}
              </div>
            </div>
          </div>

          <p style={{ margin: '12px 0 8px' }}>{i.summary}</p>
          <div>
            {badge('Sentiment', i.sentiment)}
            {badge('Opportunity', i.opportunity)}
            {badge('Priority', i.priority)}
            {badge('Competitive Risk', i.competitiveRisk)}
          </div>
          <p style={{ marginTop: 8, fontStyle: 'italic' }}>→ {i.recommendation}</p>
        </div>
      ))}

      {!loading && filtered.length === 0 && <p style={{ opacity: 0.6 }}>No AI insights match the selected filters.</p>}
    </Layout>
  );
}

export default AiInsights;