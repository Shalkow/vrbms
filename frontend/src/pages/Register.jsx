import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
const PHONE_RE = /^[0-9+\-\s]{7,15}$/;

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Enter your full name';
    if (!form.email.trim()) errors.email = 'Enter your email address';
    else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address';
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
    if (!form.password) errors.password = 'Create a password';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      navigate('/');
    } catch (err) {
      setFormError(err.response?.data?.message || 'We could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
    { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { key: 'phone', label: 'Phone number (optional)', type: 'tel', autoComplete: 'tel' },
  ];

  return (
    <div className="container" style={{ maxWidth: 420, padding: '56px 0' }}>
      <div className="card">
        <h2>Create your account</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: -4, marginBottom: 22 }}>
          Book bikes and cars across Goa in a few taps.
        </p>

        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {fields.map(({ key, label, type, autoComplete }) => (
            <div className="field-group" key={key}>
              <label className="field-label" htmlFor={key}>{label}</label>
              <input
                id={key}
                className={`input${fieldErrors[key] ? ' input-error' : ''}`}
                type={type}
                autoComplete={autoComplete}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                aria-invalid={!!fieldErrors[key]}
              />
              {fieldErrors[key] && <p className="field-error">{fieldErrors[key]}</p>}
            </div>
          ))}

          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password"
                className={`input${fieldErrors.password ? ' input-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                aria-invalid={!!fieldErrors.password}
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
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 4 }} type="submit" disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13.5, textAlign: 'center', color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}