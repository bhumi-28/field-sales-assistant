import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Layout from '../components/Layout';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '' });
  const [error, setError] = useState('');

  const loadCustomers = () => {
    axiosClient.get('/customers')
      .then((res) => setCustomers(res.data))
      .catch(() => setError('Failed to load customers'));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axiosClient.post('/customers', form);
      setForm({ name: '', phone: '', email: '', city: '' });
      loadCustomers();
    } catch (err) {
      setError('Failed to create customer');
    }
  };

  const inputStyle = {
    padding: 8, background: '#1a1d24', border: '1px solid #2a2d36',
    borderRadius: 4, color: '#e7eef7',
  };

  return (
    <Layout>
      <h2>Customers</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input style={inputStyle} name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input style={inputStyle} name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        <input style={inputStyle} name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input style={inputStyle} name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <button type="submit">Add Customer</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2a2d36', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Phone</th>
            <th style={{ padding: 8 }}>Email</th>
            <th style={{ padding: 8 }}>City</th>
            <th style={{ padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #1e2128' }}>
              <td style={{ padding: 8 }}>{c.name}</td>
              <td style={{ padding: 8 }}>{c.phone}</td>
              <td style={{ padding: 8 }}>{c.email}</td>
              <td style={{ padding: 8 }}>{c.city}</td>
              <td style={{ padding: 8 }}>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default Customers;