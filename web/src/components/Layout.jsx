import { useNavigate, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/customers', label: 'Customers' },
    { path: '/visits', label: 'Visits' },
    { path: '/tasks', label: 'Tasks' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px', background: '#12141a', borderBottom: '1px solid #2a2d36'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <strong style={{ fontSize: 16 }}>Field Sales Assistant</strong>
          {navLinks.map((link) => (
            <span
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                cursor: 'pointer',
                color: location.pathname === link.path ? '#4fd8c9' : '#a0a6b0',
                fontWeight: location.pathname === link.path ? 600 : 400,
                borderBottom: location.pathname === link.path ? '2px solid #4fd8c9' : '2px solid transparent',
                paddingBottom: 4,
              }}
            >
              {link.label}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#a0a6b0', fontSize: 14 }}>{userName}</span>
          <button onClick={handleLogout} style={{
            padding: '6px 14px', background: 'transparent', color: '#a0a6b0',
            border: '1px solid #2a2d36', borderRadius: 4, cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </nav>
      <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;