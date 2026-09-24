import { useEffect, useState, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Layout from '../components/Layout';

const colors = {
  card: "#12141a",
  border: "#2a2d36",
  text: "#e6e8ec",
  muted: "#a0a6b0",
  accent: "#4fd8c9",
  danger: "#e05c5c",
  rowHover: "#181b22",
};

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA/Canada (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+86', label: 'China (+86)' },
];

const emptyForm = {
  name: '', countryCode: '+91', phone: '', email: '', city: '',
  address: '', assignedUserId: '', status: '',
};

function parsePhone(phoneStr = '') {
  const match = phoneStr.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) {
    return { countryCode: match[1], phone: match[2].replace(/\D/g, '').slice(0, 10) };
  }
  return { countryCode: '+91', phone: phoneStr.replace(/\D/g, '').slice(0, 10) };
}

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [reps, setReps] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [viewingId, setViewingId] = useState(null);

  const loadCustomers = () => {
    setLoading(true);
    axiosClient.get('/customers')
      .then((res) => setCustomers(res.data))
      .catch(() => setError('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  const loadReps = () => {
    axiosClient.get('/users', { params: { role: 'SALES_REP' } })
      .then((res) => setReps(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadCustomers();
    loadReps();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const repName = (id) => {
    if (!id) return 'Unassigned';
    const rep = reps.find((r) => String(r.id) === String(id));
    return rep ? rep.name : 'Unassigned';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm({ ...form, phone: digitsOnly });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    const payload = {
      name: form.name,
      phone: `${form.countryCode} ${form.phone}`,
      email: form.email,
      city: form.city,
      address: form.address,
      assignedUserId: form.assignedUserId ? Number(form.assignedUserId) : null,
      status: form.status,
    };

    try {
      if (editingId) {
        await axiosClient.put(`/customers/${editingId}`, payload);
      } else {
        await axiosClient.post('/customers', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadCustomers();
    } catch (err) {
      setError(editingId ? 'Failed to update customer' : 'Failed to create customer');
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setViewingId(null);
    const { countryCode, phone } = parsePhone(c.phone);
    setForm({
      name: c.name,
      countryCode,
      phone,
      email: c.email,
      city: c.city,
      address: c.address || '',
      assignedUserId: c.assignedUserId ? String(c.assignedUserId) : '',
      status: c.status || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const toggleView = (id) => {
    setEditingId(null);
    setViewingId(viewingId === id ? null : id);
  };

  const filteredCustomers = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q)
    );
  });

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

  return (
    <Layout>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <h2 style={{ margin: 0 }}>Customers</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <input
            placeholder="Search name, phone, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, width: 240 }}
          />
          <span style={{ color: colors.muted, fontSize: 14, whiteSpace: 'nowrap' }}>
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Add / Edit form card */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: 20,
        marginBottom: 24,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, color: colors.text }}>
          {editingId ? 'Edit Customer' : 'Add New Customer'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} name="name" placeholder="Customer or company name" value={form.name} onChange={handleChange} required />
            </div>

            <div style={{ minWidth: 150, flex: '0 1 150px' }}>
              <label style={labelStyle}>Country</label>
              <select name="countryCode" value={form.countryCode} onChange={handleChange} style={inputStyle}>
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 140, flex: '0 1 140px' }}>
              <label style={labelStyle}>Phone</label>
              <input
                style={inputStyle}
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit number"
                value={form.phone}
                onChange={handlePhoneChange}
                maxLength={10}
                required
              />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} name="email" type="email" placeholder="name@company.com" value={form.email} onChange={handleChange} required />
            </div>

            <div style={fieldWrapStyle}>
              <label style={labelStyle}>City</label>
              <input style={inputStyle} name="city" placeholder="City" value={form.city} onChange={handleChange} required />
            </div>

            <div style={{ minWidth: 220, flex: '1 1 220px' }}>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} name="address" placeholder="Street, area, pincode" value={form.address} onChange={handleChange} />
            </div>

            <div style={{ minWidth: 180, flex: '0 1 200px' }}>
              <label style={labelStyle}>Assigned Sales Rep</label>
              <select name="assignedUserId" value={form.assignedUserId} onChange={handleChange} style={inputStyle}>
                <option value="">Unassigned</option>
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: 140, flex: '0 1 140px' }}>
              <label style={labelStyle}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle} required>
                <option value="" disabled>Choose Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
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

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: colors.accent,
                color: '#0b0d12',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {editingId ? 'Update Customer' : 'Add Customer'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: colors.muted,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table card */}
      <div style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 24, color: colors.muted }}>Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: 24, color: colors.muted }}>
            {customers.length === 0 ? 'No customers yet. Add your first one above.' : 'No customers match your search.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>City</th>
                <th style={thStyle}>Assigned Rep</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <Fragment key={c.id}>
                  <tr
                    onMouseEnter={() => setHoveredRow(c.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      background: hoveredRow === c.id ? colors.rowHover : 'transparent',
                      transition: 'background 0.12s ease',
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{c.name}</td>
                    <td style={tdStyle}>{c.phone}</td>
                    <td style={tdStyle}>{c.email}</td>
                    <td style={tdStyle}>{c.city}</td>
                    <td style={tdStyle}>{repName(c.assignedUserId)}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        background: c.status === 'ACTIVE' ? 'rgba(79, 216, 201, 0.15)' : 'rgba(224, 92, 92, 0.15)',
                        color: c.status === 'ACTIVE' ? colors.accent : colors.danger,
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => toggleView(c.id)}
                        style={{
                          padding: '6px 14px',
                          background: 'transparent',
                          color: colors.muted,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 5,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginRight: 8,
                        }}
                      >
                        {viewingId === c.id ? 'Hide' : 'View'}
                      </button>
                      <button
                        onClick={() => startEdit(c)}
                        style={{
                          padding: '6px 14px',
                          background: 'transparent',
                          color: colors.accent,
                          border: `1px solid ${colors.accent}`,
                          borderRadius: 5,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                  {viewingId === c.id && (
                    <tr style={{ background: '#0e1015', borderBottom: `1px solid ${colors.border}` }}>
                      <td colSpan={7} style={{ padding: '14px 16px', fontSize: 13, color: colors.muted }}>
                        <strong style={{ color: colors.text }}>Customer ID:</strong> {c.id}
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        <strong style={{ color: colors.text }}>Address:</strong> {c.address || '—'}
                        &nbsp;&nbsp;|&nbsp;&nbsp;
                        <strong style={{ color: colors.text }}>Assigned Rep:</strong> {repName(c.assignedUserId)}
                      </td>
                    </tr>
                  )}
                </Fragment>
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

export default Customers;