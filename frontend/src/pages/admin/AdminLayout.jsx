import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/vehicles', label: 'Vehicles' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/locations', label: 'Locations' },
];

export default function AdminLayout() {
  return (
    <div className="container" style={{ padding: '30px 0', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
      <aside>
        <div className="card">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              style={({ isActive }) => ({ display: 'block', padding: '8px 0', fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--primary)' : 'inherit' })}>
              {l.label}
            </NavLink>
          ))}
        </div>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
