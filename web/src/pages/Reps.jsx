import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Layout from "../components/Layout";

const colors = {
  bg: "#12141a",
  border: "#2a2d36",
  text: "#e6e8ec",
  muted: "#a0a6b0",
  accent: "#d6304f",
  danger: "#e05c5c",
};

const emptyForm = { name: "", email: "", password: "", confirmPassword: "" };

function Reps() {
  const [reps, setReps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchReps();
    fetchCustomers();
  }, []);

  const fetchReps = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/users", {
        params: { role: "SALES_REP" },
      });
      setReps(res.data);
    } catch (err) {
      setError("Failed to load sales reps.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axiosClient.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      // customer count is a nice-to-have; ignore failure here
    }
  };

  const customerCount = (repId) =>
    customers.filter((c) => String(c.assignedUserId) === String(repId)).length;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      await axiosClient.post("/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "SALES_REP",
      });
      setForm(emptyForm);
      fetchReps();
    } catch (err) {
      if (err.response?.status === 409) {
        setFormError("This email is already registered.");
      } else {
        setFormError("Failed to add sales rep.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (rep) => {
    const nextStatus = rep.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setUpdatingId(rep.id);
    try {
      await axiosClient.put(`/users/${rep.id}/status`, { status: nextStatus });
      fetchReps();
    } catch (err) {
      setError("Failed to update rep status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReps = reps.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (r.name || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
  });

  const labelStyle = {
    display: "block",
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: 600,
    letterSpacing: 0.3,
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 11px",
    background: "#0e1015",
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    color: colors.text,
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
  };

  const fieldWrapStyle = { minWidth: 160, flex: "1 1 160px" };

  return (
    <Layout>
      <div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, flexWrap: "wrap", gap: 12,
        }}>
          <h2 style={{ margin: 0 }}>Sales Reps</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <input
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, width: 220 }}
            />
            <span style={{ color: colors.muted, fontSize: 14, whiteSpace: "nowrap" }}>
              {filteredReps.length} rep{filteredReps.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: 20,
          marginBottom: 24,
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, color: colors.text }}>Add New Sales Rep</h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} name="email" type="email" placeholder="name@company.com" value={form.email} onChange={handleChange} required />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Confirm Password</label>
                <input style={inputStyle} name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            {formError && (
              <div style={{
                padding: "10px 12px", borderRadius: 6, background: "rgba(224, 92, 92, 0.12)",
                color: colors.danger, fontSize: 13, marginBottom: 14,
              }}>
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px",
                background: colors.accent,
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Adding..." : "Add Rep"}
            </button>
          </form>
        </div>

        {error && <p style={{ color: colors.danger }}>{error}</p>}

        {loading ? (
          <div style={{ color: colors.muted }}>Loading reps...</div>
        ) : filteredReps.length === 0 ? (
          <p style={{ color: colors.muted }}>
            {reps.length === 0 ? "No sales reps found." : "No reps match your search."}
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Customers Assigned</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Joined</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReps.map((rep) => (
                <tr key={rep.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={tdStyle}>{rep.name}</td>
                  <td style={tdStyle}>{rep.email}</td>
                  <td style={tdStyle}>{customerCount(rep.id)}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: rep.status === "ACTIVE" ? "rgba(214, 48, 79, 0.15)" : "rgba(224, 92, 92, 0.15)",
                      color: rep.status === "ACTIVE" ? colors.accent : colors.danger,
                    }}>
                      {rep.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      onClick={() => toggleStatus(rep)}
                      disabled={updatingId === rep.id}
                      style={{
                        padding: "6px 14px",
                        background: "transparent",
                        color: rep.status === "ACTIVE" ? colors.danger : colors.accent,
                        border: `1px solid ${rep.status === "ACTIVE" ? colors.danger : colors.accent}`,
                        borderRadius: 5,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: updatingId === rep.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {updatingId === rep.id ? "..." : rep.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </button>
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
  textAlign: "left",
  padding: "10px 8px",
  color: colors.muted,
  fontSize: 13,
  fontWeight: 600,
};

const tdStyle = {
  padding: "12px 8px",
  color: colors.text,
  fontSize: 14,
};

export default Reps;