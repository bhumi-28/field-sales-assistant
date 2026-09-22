import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Layout from '../components/Layout';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customerId: '', assignedUserId: '', title: '', dueDate: '', priority: 'MEDIUM'
  });
  const [error, setError] = useState('');

  const loadData = () => {
    axiosClient.get('/tasks').then((res) => setTasks(res.data)).catch(() => setError('Failed to load tasks'));
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
      await axiosClient.post('/tasks', {
        ...form,
        customerId: Number(form.customerId),
        assignedUserId: Number(form.assignedUserId),
      });
      setForm({ customerId: '', assignedUserId: '', title: '', dueDate: '', priority: 'MEDIUM' });
      loadData();
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const markComplete = async (id) => {
    try {
      await axiosClient.put(`/tasks/${id}`, { status: 'COMPLETED' });
      loadData();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const inputStyle = {
    padding: 8, background: '#1a1d24', border: '1px solid #2a2d36',
    borderRadius: 4, color: '#e7eef7',
  };

  return (
    <Layout>
      <h2>Tasks</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <select style={inputStyle} name="customerId" value={form.customerId} onChange={handleChange} required>
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input style={inputStyle} name="assignedUserId" placeholder="Assigned User ID" value={form.assignedUserId} onChange={handleChange} required />
        <input style={inputStyle} name="title" placeholder="Task title" value={form.title} onChange={handleChange} required />
        <input style={inputStyle} type="date" name="dueDate" value={form.dueDate} onChange={handleChange} required />
        <select style={inputStyle} name="priority" value={form.priority} onChange={handleChange}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2a2d36', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Title</th>
            <th style={{ padding: 8 }}>Due Date</th>
            <th style={{ padding: 8 }}>Priority</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #1e2128' }}>
              <td style={{ padding: 8 }}>{t.title}</td>
              <td style={{ padding: 8 }}>{t.dueDate}</td>
              <td style={{ padding: 8 }}>{t.priority}</td>
              <td style={{ padding: 8 }}>{t.status}</td>
              <td style={{ padding: 8 }}>
                {t.status !== 'COMPLETED' && (
                  <button onClick={() => markComplete(t.id)}>Mark Complete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default Tasks;