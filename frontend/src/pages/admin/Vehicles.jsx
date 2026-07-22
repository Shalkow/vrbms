import { useEffect, useState } from 'react';
import api from '../../api/axios';

const empty = { name: '', vehicleNumber: '', categoryId: '', locationId: '', fuelType: 'Petrol', transmission: 'Manual', seats: 4, dailyRate: 1500 };

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/vehicles?limit=100').then((res) => setVehicles(res.data.results));
  useEffect(() => {
    load();
    api.get('/categories').then((res) => setCategories(res.data));
    api.get('/locations').then((res) => setLocations(res.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const { dailyRate, ...vehicleData } = form;
    const res = await api.post('/vehicles', vehicleData);
    await api.post(`/vehicles/${res.data.id}/pricing`, { pricingType: 'daily', dailyRate, isActive: true });
    setForm(empty);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    await api.delete(`/vehicles/${id}`);
    load();
  };

  const setStatus = async (id, status) => {
    await api.put(`/vehicles/${id}`, { status });
    load();
  };

  return (
    <div>
      <div className="flex-between">
        <h2>Vehicles</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Vehicle'}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <input className="input" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Vehicle Number" required value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
          <select className="input" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input" required value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })}>
            <option value="">Location</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.city}</option>)}
          </select>
          <select className="input" value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })}>
            <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
          </select>
          <select className="input" value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })}>
            <option>Manual</option><option>Automatic</option>
          </select>
          <input className="input" type="number" placeholder="Seats" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
          <input className="input" type="number" placeholder="Daily Rate (₹)" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} />
          <button className="btn btn-primary" type="submit">Save Vehicle</button>
        </form>
      )}

      <div className="grid" style={{ gap: 8 }}>
        {vehicles.map((v) => (
          <div key={v.id} className="card flex-between">
            <div>
              <strong>{v.name}</strong> ({v.vehicleNumber}) — {v.VehicleCategory?.name}
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>{v.VehiclePricing?.[0]?.dailyRate ? `₹${v.VehiclePricing[0].dailyRate}/day` : 'No pricing set'}</p>
            </div>
            <div className="flex" style={{ gap: 8 }}>
              <select className="input" value={v.status} onChange={(e) => setStatus(v.id, e.target.value)}>
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="btn btn-outline" onClick={() => remove(v.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
