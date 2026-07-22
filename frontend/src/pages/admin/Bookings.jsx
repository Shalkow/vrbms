import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const load = () => api.get('/admin/bookings').then((res) => setBookings(res.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/bookings/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <h2>All Bookings</h2>
      <div className="grid" style={{ gap: 8 }}>
        {bookings.map((b) => (
          <div key={b.id} className="card flex-between">
            <div>
              <strong>{b.bookingCode}</strong> — {b.Vehicle?.name}
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Total: ₹{b.totalAmount}</p>
            </div>
            <select className="input" value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
        {bookings.length === 0 && <p style={{ color: 'var(--muted)' }}>No bookings yet.</p>}
      </div>
    </div>
  );
}
