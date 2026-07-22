import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import VehicleCard from '../components/VehicleCard';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || '',
    fuelType: '', transmission: '', minSeats: '', sort: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/categories').then((res) => setCategories(res.data)); }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get('/vehicles', { params }).then((res) => setVehicles(res.data.results)).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="container" style={{ padding: '30px 0', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
      <aside className="card" style={{ height: 'fit-content' }}>
        <h3>Filters</h3>
        <label>Vehicle Type</label>
        <select className="input" value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
          <option value="">All</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label style={{ marginTop: 10, display: 'block' }}>Fuel</label>
        <select className="input" value={filters.fuelType} onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}>
          <option value="">All</option>
          <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
        </select>
        <label style={{ marginTop: 10, display: 'block' }}>Transmission</label>
        <select className="input" value={filters.transmission} onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}>
          <option value="">All</option>
          <option>Manual</option><option>Automatic</option>
        </select>
        <label style={{ marginTop: 10, display: 'block' }}>Sort</label>
        <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="">Default</option>
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
        </select>
      </aside>

      <main>
        <h2>Search Results {loading ? '' : `(${vehicles.length})`}</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
        {!loading && vehicles.length === 0 && <p style={{ color: 'var(--muted)' }}>No vehicles match your filters.</p>}
      </main>
    </div>
  );
}
