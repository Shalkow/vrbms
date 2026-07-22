import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: '60px 0' }}>
      <div className="card">
        <h2>Create Account</h2>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {['name', 'email', 'phone', 'password'].map((field) => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={{ textTransform: 'capitalize' }}>{field}</label>
              <input
                className="input"
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required={field !== 'phone'}
              />
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
