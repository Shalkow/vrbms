import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div className="container flex-between" style={{ height: 64 }}>
        <Link to="/" style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>🚗 VRBMS</Link>
        <nav className="flex" style={{ gap: 20, alignItems: 'center' }}>
          <Link to="/search">Search</Link>
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user && user.role !== 'admin' && <Link to="/my-bookings">My Bookings</Link>}
          {!user && <Link to="/login" className="btn btn-outline">Login</Link>}
          {user && (
            <button className="btn btn-outline" onClick={() => { logout(); navigate('/'); }}>
              Logout ({user.name.split(' ')[0]})
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
