import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Layout from "../components/Layout";

const colors = {
  bg: "#12141a",
  border: "#2a2d36",
  text: "#e6e8ec",
  muted: "#a0a6b0",
  accent: "#4fd8c9",
  danger: "#e05c5c",
};

function Reps() {
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReps();
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

  if (loading) {
    return (
      <Layout>
        <div style={{ color: colors.muted }}>Loading reps...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ color: colors.danger }}>{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <h2 style={{ margin: 0 }}>Sales Reps</h2>
          <span style={{ color: colors.muted, fontSize: 14 }}>
            {reps.length} rep{reps.length !== 1 ? "s" : ""}
          </span>
        </div>

        {reps.length === 0 ? (
          <p style={{ color: colors.muted }}>No sales reps found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {reps.map((rep) => (
                <tr key={rep.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={tdStyle}>{rep.name}</td>
                  <td style={tdStyle}>{rep.email}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: rep.status === "ACTIVE" ? "rgba(79, 216, 201, 0.15)" : "rgba(224, 92, 92, 0.15)",
                      color: rep.status === "ACTIVE" ? colors.accent : colors.danger,
                    }}>
                      {rep.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : "-"}
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