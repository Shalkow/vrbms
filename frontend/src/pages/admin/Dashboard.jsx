import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/dashboard').then((res) => setStats(res.data)); }, []);
  if (!stats) return <p>Loading...</p>;

  const cards = [
    { label: "Today's Bookings", value: stats.todaysBookings },
    { label: 'Monthly Revenue', value: `₹${stats.monthlyRevenue}` },
    { label: 'Pending Payments', value: stats.pendingPayments },
    { label: 'Vehicles Available', value: stats.vehiclesAvailable },
    { label: 'Under Maintenance', value: stats.vehiclesUnderMaintenance },
  ];

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 24 }}>
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div style={{ fontSize: 22, fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.label}</div>
          </div>
        ))}
      </div>
      <h3>Recent Bookings</h3>
      <div className="grid" style={{ gap: 8 }}>
        {stats.recentBookings.map((b) => (
          <div key={b.id} className="card flex-between">
            <span>{b.bookingCode} — {b.Vehicle?.name}</span>
            <span className="badge badge-pending">{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
