import { useEffect, useState } from 'react';
import api from '../../api/axios';

const statusBadge = { confirmed: 'badge-success', pending: 'badge-pending', cancelled: 'badge-danger', completed: 'badge-success', refunded: 'badge-pending', in_progress: 'badge-pending' };

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const load = () => api.get('/bookings/my').then((res) => setBookings(res.data));
  useEffect(() => { load(); }, []);

 

  return (
    <div className="container" style={{ padding: '30px 0' }}>
      <h2>My Bookings</h2>
      <div className="grid" style={{ gap: 12 }}>
        {bookings.map((b) => (
          <div key={b.id} className="card flex-between">
            <div>
              <strong>{b.Vehicle?.name}</strong> — {b.bookingCode}
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '4px 0' }}>
                {new Date(b.pickupDateTime).toLocaleString()} → {new Date(b.returnDateTime).toLocaleString()}
              </p>
              <p style={{ fontSize: 13 }}>Total: ₹{b.totalAmount}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13 }}>Total: ₹{b.totalAmount}</p>
        {b.Vehicle?.ownerPhone && (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Vehicle contact: {b.Vehicle.ownerPhone}</p>
        )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`badge ${statusBadge[b.status] || 'badge-pending'}`}>{b.status}</span>
        </div>
            </div>
        ))}
        {bookings.length === 0 && <p style={{ color: 'var(--muted)' }}>No bookings yet.</p>}
      </div>
    </div>
  );
}
