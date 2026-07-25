import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const links = (
    <>
      <Link to="/search" className="nav-link" onClick={() => setMenuOpen(false)}>Search</Link>
      {user?.role === 'admin' && <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>Admin</Link>}
      {user && user.role !== 'admin' && <Link to="/my-bookings" className="nav-link" onClick={() => setMenuOpen(false)}>My Bookings</Link>}
      {!user && <Link to="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Login</Link>}
      {user && (
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout ({user.name.split(' ')[0]})
        </button>
      )}
    </>
  );

  return (
    <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 20 }}>
      <div className="container flex-between" style={{ height: 64 }}>
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, color: 'var(--primary)' }}
        >
          RentingWheels
        </Link>

        {/* Desktop nav */}
        <nav className="hide-mobile flex" style={{ gap: 20, alignItems: 'center' }}>
          {links}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="show-mobile"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{ background: 'none', border: 'none', padding: 8 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <nav
          style={{
            borderTop: '1px solid var(--border)',
            padding: '12px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: '#fff',
          }}
        >
          {links}
        </nav>
      )}
    </header>
  );
}