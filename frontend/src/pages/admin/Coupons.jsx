import { useEffect, useState } from 'react';
import api from '../../api/axios';

const empty = { code: '', discountType: 'percentage', discountValue: 10, minBookingAmount: 0, maxDiscount: '', usageLimit: '', expiryDate: '' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/coupons').then((res) => setCoupons(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/coupons', form);
    setForm(empty);
    load();
  };

  const remove = async (id) => { await api.delete(`/coupons/${id}`); load(); };

  return (
    <div>
      <h2>Coupons</h2>
      <form onSubmit={submit} className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <input className="input" placeholder="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        <select className="input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
        <input className="input" type="number" placeholder="Discount Value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
        <input className="input" type="number" placeholder="Min Booking Amount" value={form.minBookingAmount} onChange={(e) => setForm({ ...form, minBookingAmount: e.target.value })} />
        <input className="input" type="number" placeholder="Max Discount" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
        <input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
        <button className="btn btn-primary" type="submit">Create Coupon</button>
      </form>

      <div className="grid" style={{ gap: 8 }}>
        {coupons.map((c) => (
          <div key={c.id} className="card flex-between">
            <div>
              <strong>{c.code}</strong> — {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} off
            </div>
            <button className="btn btn-outline" onClick={() => remove(c.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
