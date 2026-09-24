import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import RecentVisits from '../components/RecentVisits';
import FollowUpTasks from '../components/FollowUpTasks';
import { COLORS, SHADOW } from '../theme';
import {
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from '../components/icons';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        boxShadow: SHADOW,
        borderRadius: 14,
        padding: '20px 22px',
      }}
    >
      <div className="fsa-skel" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 16 }} />
      <div className="fsa-skel" style={{ width: 48, height: 24, borderRadius: 4, marginBottom: 8 }} />
      <div className="fsa-skel" style={{ width: 100, height: 12, borderRadius: 4 }} />
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const userName = localStorage.getItem('userName');
  const firstName = userName ? userName.split(' ')[0] : '';

  useEffect(() => {
    axiosClient
      .get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard'));
  }, []);

  const cards = summary
    ? [
        { icon: <UsersIcon />, value: summary.totalCustomers, label: 'Total customers', color: COLORS.accent, bg: COLORS.accentBg },
        { icon: <CalendarIcon />, value: summary.visitsThisMonth, label: 'Visits this month', color: COLORS.accent, bg: COLORS.accentBg },
        { icon: <ClockIcon />, value: summary.pendingFollowUps, label: 'Pending follow-ups', color: COLORS.amber, bg: COLORS.amberBg },
        { icon: <CheckCircleIcon />, value: summary.completedVisits, label: 'Completed visits', color: COLORS.accent, bg: COLORS.accentBg },
        { icon: <TrendingUpIcon />, value: summary.highOpportunities, label: 'High opportunities', color: COLORS.red, bg: COLORS.redBg },
        { icon: <AlertTriangleIcon />, value: summary.competitiveAlerts, label: 'Competitive alerts', color: COLORS.red, bg: COLORS.redBg },
      ]
    : [];

  return (
    <Layout>
      <style>{`
        @keyframes fsaPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .fsa-skel {
          background: ${COLORS.border};
          animation: fsaPulse 1.4s ease-in-out infinite;
        }
        .fsa-lower-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 16px;
        }
        @media (min-width: 780px) {
          .fsa-lower-grid {
            grid-template-columns: 1.6fr 1fr;
          }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: 0 }}>
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </h2>
          <p style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 6 }}>
            Here&apos;s what&apos;s happening across your accounts today.
          </p>
        </div>
        <button
          onClick={() => navigate('/customers')}
          className="fsa-btn fsa-btn-primary"
          style={{
            background: COLORS.accent,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            padding: '9px 16px',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: SHADOW,
          }}
        >
          + Add customer
        </button>
      </div>

      {error && (
        <div
          style={{
            background: COLORS.redBg,
            border: `1px solid ${COLORS.red}`,
            color: COLORS.red,
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {summary
          ? cards.map((card) => <StatCard key={card.label} {...card} />)
          : !error && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      <div className="fsa-lower-grid">
        <RecentVisits />
        <FollowUpTasks />
      </div>
    </Layout>
  );
}

export default Dashboard;