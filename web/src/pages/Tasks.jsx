import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Layout from '../components/Layout';

const colors = {
  card: "#12141a",
  border: "#2a2d36",
  text: "#e6e8ec",
  muted: "#a0a6b0",
  accent: "#d6304f",
  danger: "#e05c5c",
  warning: "#f2b84b",
  rowHover: "#181b22",
};

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

const STATUS_STYLES = {
  OPEN: { bg: 'rgba(160, 166, 176, 0.15)', color: colors.muted },
  IN_PROGRESS: { bg: 'rgba(242, 184, 75, 0.15)', color: colors.warning },
  COMPLETED: { bg: 'rgba(214, 48, 79, 0.15)', color: colors.accent },
  CANCELLED: { bg: 'rgba(224, 92, 92, 0.15)', color: colors.danger },
};

const PRIORITY_STYLES = {
  LOW: { bg: 'rgba(160, 166, 176, 0.15)', color: colors.muted },
  MEDIUM: { bg: 'rgba(242, 184, 75, 0.15)', color: colors.warning },
  HIGH: { bg: 'rgba(224, 92, 92, 0.15)', color: colors.danger },
};

const emptyForm = { customerId: '', assignedUserId: '', title: '', dueDate: '', priority: 'MEDIUM' };

const extractErrorMessage = (err, fallback) => {
  const backendMessage = err.response?.data?.message || err.response?.data?.error;
  const status = err.response?.status;
  if (backendMessage) return `${fallback} — ${backendMessage}`;
  if (status) return `${fallback} (HTTP ${status})`;
  return fallback;
};

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reps, setReps] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hoveredRow, setHoveredRow] = useState(null);

  const loadData = () => {
    axiosClient.get('/tasks').then((res) => setTasks(res.data)).catch(() => setError('Failed to load tasks'));
    axiosClient.get('/customers').then((res) => setCustomers(res.data)).catch(() => {});
    axiosClient.get('/users', { params: { role: 'SALES_REP' } }).then((res) => setReps(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const customerName = (id) => {
    const c = customers.find((c) => String(c.id) === String(id));
    return c ? c.name : `#${id}`;
  };

  const repName = (id) => {
    const r = reps.find((r) => String(r.id) === String(id));
    return r ? r.name : `#${id}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.customerId || !form.assignedUserId) {
      setError('Select both a customer and a sales rep before adding the task.');
      return;
    }

    try {
      await axiosClient.post('/tasks', {
        ...form,
        customerId: Number(form.customerId),
        assignedUserId: Number(form.assignedUserId),
      });
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create task'));
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.put(`/tasks/${id}`, { status });
      loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to update task'));
    }
  };

  const visibleTasks = statusFilter === 'ALL' ? tasks : tasks.filter((t) => t.status === statusFilter);

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: 600,
    letterSpacing: 0.3,
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 11px',
    background: '#0e1015',
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    color: colors.text,
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
  };

  const fieldWrapStyle = { minWidth: 160, flex: '1 1 160px' };

  const badgeStyle = (style) => ({
    padding: '3px 10px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    background: style.bg,
    color: style.color,
  });

  return (
    <Layout>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <h2 style={{ margin: 0 }}>Tasks</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, width: 170 }}
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <span style={{ color: colors.muted, fontSize: 14, whiteSpace: 'nowrap' }}>
            {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {reps.length === 0 && (
        <div style={{
          padding: '10px 12px', borderRadius: 6, marginBottom: 16,
          background: 'rgba(242, 184, 75, 0.12)', color: colors.warning, fontSize: 13,
        }}>
          No sales reps found — "Assign to Rep" will be empty until at least one SALES_REP account is registered.
        </div>
      )}

      {/* Add task form card */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: 20,
        marginBottom: 24,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: colors.text }}>Add New Task</h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Customer</label>
              <select style={inputStyle} name="customerId" value={form.customerId} onChange={handleChange} required>
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Assigned Rep</label>
              <select style={inputStyle} name="assignedUserId" value={form.assignedUserId} onChange={handleChange} required>
                <option value="">Assign to Rep</option>
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 200, flex: '1 1 200px' }}>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} name="title" placeholder="Task title" value={form.title} onChange={handleChange} required />
            </div>

            <div style={{ minWidth: 150, flex: '0 1 150px' }}>
              <label style={labelStyle}>Due Date</label>
              <input style={inputStyle} type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
            </div>

            <div style={{ minWidth: 140, flex: '0 1 140px' }}>
              <label style={labelStyle}>Priority</label>
              <select style={inputStyle} name="priority" value={form.priority} onChange={handleChange}>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 12px',
              borderRadius: 6,
              background: 'rgba(224, 92, 92, 0.12)',
              color: colors.danger,
              fontSize: 13,
              marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: '10px 20px',
              background: colors.accent,
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Add Task
          </button>
        </form>
      </div>

      {/* Table card */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {visibleTasks.length === 0 ? (
          <div style={{ padding: 24, color: colors.muted }}>
            {tasks.length === 0 ? 'No tasks yet. Add your first one above.' : 'No tasks match this filter.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Assigned To</th>
                <th style={thStyle}>Due Date</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((t) => (
                <tr
                  key={t.id}
                  onMouseEnter={() => setHoveredRow(t.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                    background: hoveredRow === t.id ? colors.rowHover : 'transparent',
                    transition: 'background 0.12s ease',
                  }}
                >
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{t.title}</td>
                  <td style={tdStyle}>{customerName(t.customerId)}</td>
                  <td style={tdStyle}>{repName(t.assignedUserId)}</td>
                  <td style={tdStyle}>{t.dueDate}</td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.LOW)}>
                      {t.priority}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                      style={{
                        ...badgeStyle(STATUS_STYLES[t.status] || STATUS_STYLES.OPEN),
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} style={{ background: colors.card, color: colors.text }}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: '12px 16px',
  color: '#a0a6b0',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
};

const tdStyle = {
  padding: '14px 16px',
  color: '#e6e8ec',
  fontSize: 14,
};

export default Tasks;