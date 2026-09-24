import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const COLORS = {
  text: '#e6e8ec',
  textMuted: '#8b91a1',
  accent: '#d6304f',
  red: '#e2635f',
  surface: '#12151c',
  border: '#242836',
};

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function RecentVisits() {
  const [visits, setVisits] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/visits')
      .then((res) => {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.visitDate) - new Date(a.visitDate)
        );
        setVisits(sorted.slice(0, 5));
      })
      .catch(() => setError('Could not load recent visits'));
  }, []);

  return (
    <div className="fsa-card" style={{ padding: '20px 22px' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, margin: '0 0 16px' }}>
        Recent visits
      </h3>

      {error && <p style={{ fontSize: 13, color: COLORS.red }}>{error}</p>}

      {!error && visits === null && (
        <p style={{ fontSize: 13, color: COLORS.textMuted }}>Loading...</p>
      )}

      {visits && visits.length === 0 && (
        <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>
          No visits logged yet. Once a rep submits one from the mobile app, it shows up here.
        </p>
      )}

      {visits && visits.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {visits.map((visit, i) => (
            <div
              key={visit.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '10px 0',
                borderBottom: i === visits.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text }}>
                  {visit.customerName || `Customer #${visit.customerId}`}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: COLORS.textMuted,
                    marginTop: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {visit.purpose || visit.productInterest || 'Visit logged'}
                </div>
              </div>
              <span style={{ fontSize: 12, color: COLORS.textMuted, flexShrink: 0 }}>
                {timeAgo(visit.visitDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentVisits;