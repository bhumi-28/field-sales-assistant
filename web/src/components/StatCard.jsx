function iconWrapStyle(color, bg) {
  return {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg || `${color}1f`,
    color,
    marginBottom: 16,
    '--chip-glow': `${color}66`,
  };
}

function StatCard({ icon, value, label, color = '#d6304f', bg }) {
  return (
    <div className="fsa-card" style={{ padding: '20px 22px' }}>
      <div className="fsa-chip-glow" style={iconWrapStyle(color, bg)}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#e6e8ec', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: 13.5, color: '#8b91a1', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default StatCard;