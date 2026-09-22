import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Layout from '../components/Layout';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    axiosClient.get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard'));
  }, []);

  const cardStyle = {
    background: '#1a1d24', border: '1px solid #2a2d36', padding: 24,
    borderRadius: 8, textAlign: 'center',
  };

  return (
    <Layout>
      <h2>Welcome, {userName}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
          <div style={cardStyle}><h3 style={{ color: '#4fd8c9' }}>{summary.totalCustomers}</h3><p>Total Customers</p></div>
          <div style={cardStyle}><h3 style={{ color: '#4fd8c9' }}>{summary.visitsThisMonth}</h3><p>Visits This Month</p></div>
          <div style={cardStyle}><h3 style={{ color: '#f2b84b' }}>{summary.pendingFollowUps}</h3><p>Pending Follow-ups</p></div>
          <div style={cardStyle}><h3 style={{ color: '#4fd8c9' }}>{summary.completedVisits}</h3><p>Completed Visits</p></div>
          <div style={cardStyle}><h3 style={{ color: '#e74c3c' }}>{summary.highOpportunities}</h3><p>High Opportunities</p></div>
          <div style={cardStyle}><h3 style={{ color: '#e74c3c' }}>{summary.competitiveAlerts}</h3><p>Competitive Alerts</p></div>
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;