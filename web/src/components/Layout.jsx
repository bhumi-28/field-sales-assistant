import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const COLORS = {
  bg: '#0b0d12',
  surface: '#12151c',
  border: '#242836',
  text: '#e6e8ec',
  textMuted: '#8b91a1',
  accent: '#d6304f',
};

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="#3a151b" />
        <rect x="7" y="15" width="3.2" height="6" rx="1" fill={COLORS.accent} />
        <rect x="12.4" y="11" width="3.2" height="10" rx="1" fill={COLORS.accent} />
        <rect x="17.8" y="7" width="3.2" height="14" rx="1" fill={COLORS.accent} />
      </svg>
      <span style={{ fontSize: 15.5, fontWeight: 600, color: COLORS.text, letterSpacing: '-0.01em' }}>
        Field Sales Assistant
      </span>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.8 4.6L18 8l-4.2 1.4L12 14l-1.8-4.6L6 8l4.2-1.4L12 2z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  );
}

function initials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

const ALL_NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', roles: ['ADMIN'] },
  { path: '/customers', label: 'Customers', roles: ['ADMIN'] },
  { path: '/visits', label: 'Visits', roles: ['ADMIN', 'SALES_REP'] },
  { path: '/tasks', label: 'Tasks', roles: ['ADMIN'] },
  { path: '/reps', label: 'Reps', roles: ['ADMIN'] },
  { path: '/insights', label: 'AI Insights', icon: true, roles: ['ADMIN'] },
  { path: '/assistant', label: 'AI Assistant', icon: true, roles: ['ADMIN', 'SALES_REP'] },
];

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/customers?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const navLinks = ALL_NAV_LINKS.filter((link) => link.roles.includes(userRole));

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 32px',
          background: COLORS.surface,
          borderBottom: `1px solid ${COLORS.border}`,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Logo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <span
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`fsa-nav-link${active ? ' active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: active ? COLORS.accent : COLORS.textMuted,
                    fontWeight: active ? 600 : 500,
                    borderBottom: active ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                    paddingBottom: 4,
                    transition: 'color 0.15s ease',
                  }}
                >
                  {link.icon && <AiIcon />}
                  {link.label}
                </span>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {userRole === 'ADMIN' && (
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: COLORS.textMuted,
                  display: 'flex',
                }}
              >
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search customers..."
                className="fsa-search"
                style={{
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  padding: '7px 12px 7px 30px',
                  fontSize: 13.5,
                  color: COLORS.text,
                  width: 190,
                  outline: 'none',
                }}
              />
            </div>
          )}
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: COLORS.border,
              color: COLORS.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12.5,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {initials(userName)}
          </div>
          <span style={{ color: COLORS.textMuted, fontSize: 14 }}>{userName}</span>
          <button
            onClick={handleLogout}
            className="fsa-btn fsa-btn-outline"
            style={{
              padding: '6px 14px',
              background: 'transparent',
              color: COLORS.textMuted,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13.5,
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <div style={{ padding: '36px 32px', maxWidth: 1600, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>{children}</div>
    </div>
  );
}

export default Layout;