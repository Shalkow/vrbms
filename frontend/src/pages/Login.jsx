import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.6 21.6 0 0 1 5.06-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Enter your email address';
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Enter your password';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      setFormError(err.response?.data?.message || 'We could not log you in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex' }}>
      {/* Brand panel - hidden on mobile */}
      <div
        className="hide-mobile"
        style={{
          flex: '0 0 42%',
          background: 'linear-gradient(155deg, var(--primary) 0%, #1f3358 65%, var(--primary-dark) 100%)',
          color: '#fff',
          padding: '56px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          width="420" height="420" viewBox="0 0 420 420"
          style={{ position: 'absolute', right: -80, bottom: -80, opacity: 0.15 }}
        >
          <path d="M20 380 Q 140 260 220 300 T 400 120" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
          <circle cx="20" cy="380" r="7" fill="#fb6d48" />
          <circle cx="400" cy="120" r="7" fill="#fb6d48" />
        </svg>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>
          RentingWheels
        </Link>
        <div>
          <h1 style={{ fontSize: 34, lineHeight: 1.15, maxWidth: 340 }}>Your next ride is one login away.</h1>
          <p style={{ color: '#c7cede', fontSize: 15, maxWidth: 320 }}>
            Book bikes and cars across Goa in a few taps, and manage every trip from one place.
          </p>
        </div>
        <p style={{ color: '#8b93a8', fontSize: 12.5 }}>&copy; {new Date().getFullYear()} RentingWheels</p>
      </div>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="show-mobile" style={{ marginBottom: 28 }}>
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
              RentingWheels
            </Link>
          </div>

          <h2>Log in</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: -4, marginBottom: 24 }}>
            Welcome back — enter your details to continue.
          </p>

          {formError && <div className="alert alert-danger">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                className={`input${fieldErrors.email ? ' input-error' : ''}`}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && <p className="field-error" id="email-error">{fieldErrors.email}</p>}
            </div>

            <div className="field-group">
              <div className="flex-between">
                <label className="field-label" htmlFor="password">Password</label>
              </div>
              <div className="input-wrap">
                <input
                  id="password"
                  className={`input${fieldErrors.password ? ' input-error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {fieldErrors.password && <p className="field-error" id="password-error">{fieldErrors.password}</p>}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} type="submit" disabled={submitting}>
              {submitting && <span className="spinner" />}
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 13.5, textAlign: 'center', color: 'var(--muted)' }}>
            No account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}