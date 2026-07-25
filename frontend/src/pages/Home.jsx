import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import VehicleCard from '../components/VehicleCard';

const BENEFITS = [
  {
    title: 'Wide Vehicle Range',
    desc: 'From scooters to sedans and buses — pick what fits your trip and budget.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 13l1.5-5A2 2 0 0 1 6.4 6.5h11.2A2 2 0 0 1 19.5 8l1.5 5" />
        <rect x="1" y="13" width="22" height="6" rx="2" />
        <circle cx="6.5" cy="19" r="1.7" />
        <circle cx="17.5" cy="19" r="1.7" />
      </svg>
    ),
  },
  {
    title: 'Transparent Pricing',
    desc: 'No hidden fees. See your full price breakdown before you confirm.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 15.5c0 1.1 1 2 2.5 2s2.5-.8 2.5-1.8-1-1.5-2.5-1.9-2.5-.9-2.5-1.9S10.9 10 12.4 10s2.1.6 2.3 1.4" />
        <path d="M12 8v1M12 15v1" />
      </svg>
    ),
  },
  {
    title: 'Secure Payments',
    desc: 'Every transaction is encrypted and protected end to end.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2 4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: '24/7 Support',
    desc: 'Questions or roadside issues? Our team is a message away, anytime.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 1 9 9" />
        <path d="M3 12v3a3 3 0 0 0 3 3h1M21 12v-1a9 9 0 0 0-9-9" />
        <rect x="17" y="9" width="4" height="6" rx="1" />
        <rect x="3" y="9" width="4" height="6" rx="1" />
      </svg>
    ),
  },
];

function RoadIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 480 420" style={{ maxWidth: 420 }}>
      <circle cx="380" cy="90" r="70" fill="#fb6d48" opacity="0.18" />
      <path d="M0 340 Q 120 260 240 300 T 480 220" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 16" strokeLinecap="round" opacity="0.35" />
      {/* Scooter silhouette */}
      <g transform="translate(90,180)">
        <circle cx="30" cy="150" r="26" fill="none" stroke="#fff" strokeWidth="6" opacity="0.9" />
        <circle cx="220" cy="150" r="26" fill="none" stroke="#fff" strokeWidth="6" opacity="0.9" />
        <path d="M30 150 L90 150 L120 80 L170 80" fill="none" stroke="#fb6d48" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M170 80 L200 60 M170 80 L200 100" stroke="#fb6d48" strokeWidth="8" strokeLinecap="round" />
        <path d="M90 150 L150 150 Q 190 150 210 120 L220 150" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        <rect x="60" y="130" width="46" height="16" rx="8" fill="#fff" opacity="0.9" />
      </g>
    </svg>
  );
}

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
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1 style={{ fontSize: 42, marginBottom: 10 }}>Rent Cars, Bikes, Buses &amp; More</h1>
            <p style={{ opacity: 0.85, marginBottom: 0, fontSize: 16, maxWidth: 440 }}>
              Self-drive or driver-included — book your ride across Goa in minutes.
            </p>
          </div>
          <div className="hide-mobile" style={{ display: 'flex', justifyContent: 'center' }}>
            <RoadIllustration />
          </div>
        </div>
      </section>

      <div className="container">
        <form onSubmit={handleSearch} className="hero-search-card hero-search-form">
          <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Vehicle Type</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            className="input" type="date" placeholder="Pick-up date"
            min={new Date().toISOString().slice(0, 10)}
            value={form.pickupDate}
            onChange={(e) => {
              const newPickup = e.target.value;
              setForm((f) => ({
                ...f,
                pickupDate: newPickup,
                returnDate: f.returnDate && f.returnDate <= newPickup ? '' : f.returnDate,
              }));
            }}
          />
          <input
            className="input" type="date" placeholder="Return date"
            min={form.pickupDate ? new Date(new Date(form.pickupDate).getTime() + 86400000).toISOString().slice(0, 10) : ''}
            disabled={!form.pickupDate}
            value={form.returnDate}
            onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
          />
          <select className="input" value={form.rentalType} onChange={(e) => setForm({ ...form, rentalType: e.target.value })}>
            <option value="self_drive">Self Drive</option>
            <option value="driver_included">Driver Included</option>
          </select>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <section className="container" style={{ padding: '48px 0 40px' }}>
        <h2>Popular Vehicles</h2>
        <p style={{ color: 'var(--muted)', marginTop: -4, marginBottom: 20 }}>Handpicked rides, ready to book today.</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {popular.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
          {popular.length === 0 && <p style={{ color: 'var(--muted)' }}>No vehicles yet — add some from the Admin dashboard.</p>}
        </div>
      </section>

      <section className="container" style={{ padding: '20px 0 64px' }}>
        <h2>Why Choose RentingWheels</h2>
        <p style={{ color: 'var(--muted)', marginTop: -4, marginBottom: 22 }}>
          Thousands of riders trust us for their trips across Goa — here's why.
        </p>
        <div className="benefits-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card">
              <div className="benefit-icon">{b.icon}</div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>{b.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}