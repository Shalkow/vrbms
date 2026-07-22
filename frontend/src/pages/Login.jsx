import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, padding: '60px 0' }}>
      <div className="card">
        <h2>Login</h2>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginBottom: 12 }} />
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginBottom: 12 }} />
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Login</button>
        </form>
        <p style={{ marginTop: 12, fontSize: 13 }}>
          No account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Admin demo login (after seeding): admin@vrbms.com / Admin@123</p>
      </div>
    </div>
  );
}
