import { useEffect, useState } from 'react';
import api from '../../api/axios';

const empty = { city: '', branchName: '', address: '', latitude: '', longitude: '' };

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/locations').then((res) => setLocations(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/locations', form);
    setForm(empty);
    load();
  };

  const remove = async (id) => { await api.delete(`/locations/${id}`); load(); };

  return (
    <div>
      <h2>Locations</h2>
      <form onSubmit={submit} className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <input className="input" placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="input" placeholder="Branch Name" value={form.branchName} onChange={(e) => setForm({ ...form, branchName: e.target.value })} />
        <input className="input" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input className="input" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
        <input className="input" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
        <button className="btn btn-primary" type="submit">Add Location</button>
      </form>
      <div className="grid" style={{ gap: 8 }}>
        {locations.map((l) => (
          <div key={l.id} className="card flex-between">
            <span>{l.city} — {l.branchName}</span>
            <button className="btn btn-outline" onClick={() => remove(l.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
