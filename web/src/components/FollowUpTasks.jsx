import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const COLORS = {
  text: '#e6e8ec',
  textMuted: '#8b91a1',
  amber: '#e0a63f',
  red: '#e2635f',
  surface: '#12151c',
  border: '#242836',
};

const PRIORITY_COLOR = {
  HIGH: COLORS.red,
  MEDIUM: COLORS.amber,
  LOW: COLORS.textMuted,
};

function formatDue(dateString) {
  if (!dateString) return 'No due date';
  const due = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due ${due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}

function FollowUpTasks() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient
      .get('/tasks')
      .then((res) => {
        const open = res.data
          .filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setTasks(open.slice(0, 5));
      })
      .catch(() => setError('Could not load follow-ups'));
  }, []);

  const markDone = async (id) => {
    const prev = tasks;
    setTasks((t) => t.filter((task) => task.id !== id));
    try {
      await axiosClient.put(`/tasks/${id}`, { status: 'COMPLETED' });
    } catch {
      setTasks(prev);
      setError('Could not update task — try again');
    }
  };

  return (
    <div className="fsa-card" style={{ padding: '20px 22px' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, margin: '0 0 16px' }}>
        Follow-ups due
      </h3>

      {error && <p style={{ fontSize: 13, color: COLORS.red }}>{error}</p>}

      {!error && tasks === null && (
        <p style={{ fontSize: 13, color: COLORS.textMuted }}>Loading...</p>
      )}

      {tasks && tasks.length === 0 && (
        <p style={{ fontSize: 13.5, color: COLORS.textMuted }}>
          Nothing pending. You&apos;re all caught up.
        </p>
      )}

      {tasks && tasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {tasks.map((task, i) => {
            const dueLabel = formatDue(task.dueDate);
            const overdue = dueLabel.startsWith('Overdue');
            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i === tasks.length - 1 ? 'none' : `1px solid ${COLORS.border}`,
                }}
              >
                <button
                  onClick={() => markDone(task.id)}
                  title="Mark complete"
                  className="fsa-check-btn"
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: '50%',
                    border: `1.5px solid ${COLORS.border}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                    padding: 0,
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      color: COLORS.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {task.title}
                  </div>
                  <div
                    style={{ fontSize: 12, color: overdue ? COLORS.red : COLORS.textMuted, marginTop: 2 }}
                  >
                    {dueLabel}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: PRIORITY_COLOR[task.priority] || COLORS.textMuted,
                    flexShrink: 0,
                  }}
                >
                  {task.priority}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FollowUpTasks;