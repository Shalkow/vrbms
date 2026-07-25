import { useEffect, useRef, useState } from 'react';
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
const PHONE_RE = /^[0-9+\-\s]{8,15}$/;
const RESEND_COOLDOWN = 60;

function BrandPanel() {
  return (
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
      <svg width="420" height="420" viewBox="0 0 420 420" style={{ position: 'absolute', right: -80, bottom: -80, opacity: 0.15 }}>
        <path d="M20 380 Q 140 260 220 300 T 400 120" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" />
        <circle cx="20" cy="380" r="7" fill="#fb6d48" />
        <circle cx="400" cy="120" r="7" fill="#fb6d48" />
      </svg>
      <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22 }}>RentingWheels</Link>
      <div>
        <h1 style={{ fontSize: 34, lineHeight: 1.15, maxWidth: 340 }}>Your next ride is one login away.</h1>
        <p style={{ color: '#c7cede', fontSize: 15, maxWidth: 320 }}>
          Book bikes and cars across Goa in a few taps, and manage every trip from one place.
        </p>
      </div>
      <p style={{ color: '#8b93a8', fontSize: 12.5 }}>&copy; {new Date().getFullYear()} RentingWheels</p>
    </div>
  );
}

function EmailPasswordForm() {
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
    <form onSubmit={handleSubmit} noValidate>
      {formError && <div className="alert alert-danger">{formError}</div>}
      <div className="field-group">
        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email" className={`input${fieldErrors.email ? ' input-error' : ''}`} type="email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
      </div>
      <div className="field-group">
        <label className="field-label" htmlFor="password">Password</label>
        <div className="input-wrap">
          <input
            id="password" className={`input${fieldErrors.password ? ' input-error' : ''}`}
            type={showPassword ? 'text' : 'password'} autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!fieldErrors.password}
          />
          <button type="button" className="input-icon-btn" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>
            <EyeIcon open={showPassword} />
          </button>
        </div>
        {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} type="submit" disabled={submitting}>
        {submitting && <span className="spinner" />}
        {submitting ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}

function PhoneOtpForm() {
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!PHONE_RE.test(phone.trim())) {
      setError('Enter a valid phone number, with country code (e.g. +91XXXXXXXXXX)');
      return;
    }
    setSubmitting(true);
    try {
      const data = await requestOtp(phone.trim());
      setDevOtp(data.devOtp || '');
      setStep('code');
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    try {
      const data = await requestOtp(phone.trim());
      setDevOtp(data.devOtp || '');
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend the code.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code we sent you');
      return;
    }
    setSubmitting(true);
    try {
      const user = await verifyOtp(phone.trim(), code.trim(), name.trim());
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect or expired code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendCode} noValidate>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="field-group">
          <label className="field-label" htmlFor="phone">Phone number</label>
          <input
            id="phone" className="input" type="tel" autoComplete="tel" placeholder="+91XXXXXXXXXX"
            value={phone} onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} type="submit" disabled={submitting}>
          {submitting && <span className="spinner" />}
          {submitting ? 'Sending…' : 'Send code'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} noValidate>
      {error && <div className="alert alert-danger">{error}</div>}
      {devOtp && (
        <div className="alert" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' }}>
          Test mode — SMS isn't connected yet, so here's your code: <strong>{devOtp}</strong>
        </div>
      )}
      <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: -6, marginBottom: 16 }}>
        Code sent to <strong>{phone}</strong>. <button type="button" onClick={() => setStep('phone')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, padding: 0, cursor: 'pointer' }}>Change</button>
      </p>

      <div className="field-group">
        <label className="field-label" htmlFor="code">6-digit code</label>
        <input
          id="code" className="input" type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
          value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center' }}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="name">Full name <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(only needed the first time)</span></label>
        <input id="name" className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} type="submit" disabled={submitting}>
        {submitting && <span className="spinner" />}
        {submitting ? 'Verifying…' : 'Verify and log in'}
      </button>

      <button
        type="button" onClick={handleResend} disabled={cooldown > 0}
        style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: cooldown > 0 ? 'var(--muted)' : 'var(--primary)', fontWeight: 600, fontSize: 13.5, padding: 8 }}
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
      </button>
    </form>
  );
}

export default function Login() {
  const [mode, setMode] = useState('email'); // 'email' | 'phone'

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex' }}>
      <BrandPanel />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="show-mobile" style={{ marginBottom: 28 }}>
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
              RentingWheels
            </Link>
          </div>

          <h2>Log in</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: -4, marginBottom: 20 }}>
            Welcome back — choose how you'd like to continue.
          </p>

          <div className="flex" style={{ gap: 4, background: '#f1efe9', borderRadius: 10, padding: 4, marginBottom: 22 }}>
            {[{ id: 'email', label: 'Email & Password' }, { id: 'phone', label: 'Phone' }].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', fontWeight: 600, fontSize: 13.5,
                  background: mode === t.id ? '#fff' : 'transparent',
                  color: mode === t.id ? 'var(--primary)' : 'var(--muted)',
                  boxShadow: mode === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === 'email' ? <EmailPasswordForm /> : <PhoneOtpForm />}

          <p style={{ marginTop: 20, fontSize: 13.5, textAlign: 'center', color: 'var(--muted)' }}>
            No account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}