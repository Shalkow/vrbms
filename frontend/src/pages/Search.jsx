import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import VehicleCard from '../components/VehicleCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('categoryId') || '',
    fuelType: '', transmission: '', minSeats: '', sort: '',
    pickupDate: searchParams.get('pickupDate') || '',
    returnDate: searchParams.get('returnDate') || '',
  });
  const [loading, setLoading] = useState(true);
  const [dateError, setDateError] = useState('');

  useEffect(() => { api.get('/categories').then((res) => setCategories(res.data)); }, []);

  useEffect(() => {
    if (filters.pickupDate && filters.returnDate && filters.returnDate <= filters.pickupDate) {
      setDateError('Return date must be after the pickup date');
      return;
    }
    setDateError('');
    setLoading(true);
    const { pickupDate, returnDate, ...rest } = filters;
    const params = Object.fromEntries(Object.entries(rest).filter(([, v]) => v));
    if (pickupDate && returnDate) {
      params.pickupDateTime = `${pickupDate}T10:00`;
      params.returnDateTime = `${returnDate}T10:00`;
    }
    api.get('/vehicles', { params }).then((res) => setVehicles(res.data.results)).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="container search-layout" style={{ padding: '30px 0' }}>
      <aside className="card" style={{ height: 'fit-content' }}>
        <h3>Filters</h3>

        <label>Pick-up date</label>
        <input
          className="input" type="date" style={{ marginBottom: 10 }}
          min={new Date().toISOString().slice(0, 10)}
          value={filters.pickupDate}
          onChange={(e) => {
            const newPickup = e.target.value;
            setFilters((f) => ({ ...f, pickupDate: newPickup, returnDate: f.returnDate && f.returnDate <= newPickup ? '' : f.returnDate }));
          }}
        />
        <label>Return date</label>
        <input
          className="input" type="date" style={{ marginBottom: dateError ? 4 : 10 }}
          min={filters.pickupDate ? new Date(new Date(filters.pickupDate).getTime() + 86400000).toISOString().slice(0, 10) : ''}
          disabled={!filters.pickupDate}
          value={filters.returnDate}
          onChange={(e) => setFilters({ ...filters, returnDate: e.target.value })}
        />
        {dateError && <p className="field-error" style={{ marginBottom: 10 }}>{dateError}</p>}

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
        {filters.pickupDate && filters.returnDate && !dateError && (
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: -8, marginBottom: 16 }}>
            Showing vehicles available from {filters.pickupDate} to {filters.returnDate}
          </p>
        )}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
        {!loading && vehicles.length === 0 && (
          <p style={{ color: 'var(--muted)' }}>
            {filters.pickupDate && filters.returnDate
              ? 'No vehicles are available for the selected dates. Try different dates or filters.'
              : 'No vehicles match your filters.'}
          </p>
        )}
      </main>
    </div>
  );
}