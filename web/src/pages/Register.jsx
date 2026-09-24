import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AuthPanel from '../components/AuthPanel';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/auth/register', { name, email, password, role: 'SALES_REP' });
      setSuccess('Account created. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 409) {
        setError('This email is already registered.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fsa-auth-shell">
      <AuthPanel variant="register" />

      <div className="fsa-auth-form-side">
        <div className="fsa-auth-form-inner">
          <h2 style={{ fontFamily: 'var(--fsa-display)', fontWeight: 600, fontSize: 24, color: 'var(--fsa-paper)', margin: '0 0 6px' }}>
            Create your account
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fsa-fog)', margin: '0 0 28px' }}>
            Sign up as a sales representative.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="fsa-label">Full name</label>
            <input
              className="fsa-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />

            <label className="fsa-label" style={{ marginTop: 18 }}>Email</label>
            <input
              className="fsa-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />

            <label className="fsa-label" style={{ marginTop: 18 }}>Password</label>
            <input
              className="fsa-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <label className="fsa-label" style={{ marginTop: 18 }}>Confirm password</label>
            <input
              className="fsa-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && <div className="fsa-banner fsa-banner-error">{error}</div>}
            {success && <div className="fsa-banner fsa-banner-success">{success}</div>}

            <button type="submit" className="fsa-btn-primary" disabled={loading} style={{ marginTop: 22 }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--fsa-fog)' }}>
              Already have an account?{' '}
              <button type="button" className="fsa-link" onClick={() => navigate('/login')}>
                Log in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;