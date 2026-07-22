import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import VehicleCard from '../components/VehicleCard';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [popular, setPopular] = useState([]);
  const [form, setForm] = useState({ categoryId: '', pickupDate: '', returnDate: '', rentalType: 'self_drive' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
    api.get('/vehicles?limit=4').then((res) => setPopular(res.data.results));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(form).toString();
    navigate(`/search?${params}`);
  };

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', padding: '60px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>Rent Cars, Bikes, Buses & More</h1>
          <p style={{ opacity: 0.9, marginBottom: 24 }}>Self-drive or driver-included — book in minutes.</p>
          <form onSubmit={handleSearch} className="card" style={{ background: '#fff', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Vehicle Type</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="input" type="date" value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} />
            <input className="input" type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
            <select className="input" value={form.rentalType} onChange={(e) => setForm({ ...form, rentalType: e.target.value })}>
              <option value="self_drive">Self Drive</option>
              <option value="driver_included">Driver Included</option>
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </section>

      <section className="container" style={{ padding: '40px 0' }}>
        <h2>Popular Vehicles</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {popular.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          {popular.length === 0 && <p style={{ color: 'var(--muted)' }}>No vehicles yet — add some from the Admin dashboard.</p>}
        </div>
      </section>

      <section className="container" style={{ padding: '20px 0 60px' }}>
        <h2>Why Choose Us</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {['Wide Vehicle Range', 'Transparent Pricing', 'Secure Payments', '24/7 Support'].map((t) => (
            <div key={t} className="card">{t}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
