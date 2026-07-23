import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { vehicleImageUrl } from '../../utils/vehicleImage';

const empty = { name: '', vehicleNumber: '', categoryId: '', locationId: '', fuelType: 'Petrol', transmission: 'Manual', seats: 4, dailyRate: 1500 };
const placeholderImage = 'https://placehold.co/96x64?text=Vehicle';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/vehicles?limit=100&includeInactive=true').then((res) => setVehicles(res.data.results));
  useEffect(() => {
    load();
    api.get('/categories').then((res) => setCategories(res.data));
    api.get('/locations').then((res) => setLocations(res.data));
  }, []);

  const resetForm = () => {
    setForm(empty);
    setEditingId(null);
    setImageFile(null);
    setImagePreview('');
    setError('');
    setShowForm(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { dailyRate, ...vehicleData } = form;
      const response = editingId
        ? await api.put(`/vehicles/${editingId}`, vehicleData)
        : await api.post('/vehicles', vehicleData);
      const vehicleId = response.data.id;

      await api.post(`/vehicles/${vehicleId}/pricing`, { pricingType: 'daily', dailyRate, isActive: true });
      if (imageFile) {
        const imageData = new FormData();
        imageData.append('image', imageFile);
        imageData.append('isPrimary', 'true');
        await api.post(`/vehicles/${vehicleId}/images`, imageData);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the vehicle. Please try again.');
    }
  };

  const startEdit = (vehicle) => {
    const dailyPricing = vehicle.VehiclePricings?.find((pricing) => pricing.pricingType === 'daily');
    const primaryImage = vehicle.VehicleImages?.find((image) => image.isPrimary) || vehicle.VehicleImages?.[0];
    setForm({
      name: vehicle.name,
      vehicleNumber: vehicle.vehicleNumber,
      categoryId: String(vehicle.categoryId),
      locationId: String(vehicle.locationId),
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      dailyRate: dailyPricing?.dailyRate || 1500,
    });
    setEditingId(vehicle.id);
    setImageFile(null);
    setImagePreview(vehicleImageUrl(primaryImage?.imageUrl || vehicle.thumbnail, ''));
    setError('');
    setShowForm(true);
  };

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
        <button className="btn btn-primary" onClick={() => showForm ? resetForm() : setShowForm(true)}>{showForm ? 'Cancel' : '+ Add Vehicle'}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <h3 style={{ gridColumn: '1 / -1', margin: 0 }}>{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
          {error && <p style={{ gridColumn: '1 / -1', color: 'crimson', margin: 0 }}>{error}</p>}
          <input className="input" placeholder="Name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input className="input" placeholder="Vehicle Number" required value={form.vehicleNumber} onChange={(event) => setForm({ ...form, vehicleNumber: event.target.value })} />
          <select className="input" required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
            <option value="">Category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select className="input" required value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })}>
            <option value="">Location</option>
            {locations.map((location) => <option key={location.id} value={location.id}>{location.city}</option>)}
          </select>
          <select className="input" value={form.fuelType} onChange={(event) => setForm({ ...form, fuelType: event.target.value })}>
            <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option>
          </select>
          <select className="input" value={form.transmission} onChange={(event) => setForm({ ...form, transmission: event.target.value })}>
            <option>Manual</option><option>Automatic</option>
          </select>
          <input className="input" type="number" placeholder="Seats" value={form.seats} onChange={(event) => setForm({ ...form, seats: event.target.value })} />
          <input className="input" type="number" placeholder="Daily Rate" value={form.dailyRate} onChange={(event) => setForm({ ...form, dailyRate: event.target.value })} />
          <div>
            <input className="input" type="file" accept="image/*" onChange={chooseImage} />
            {imagePreview && <img src={imagePreview} alt="Vehicle preview" style={{ display: 'block', marginTop: 8, width: 96, height: 64, objectFit: 'cover', borderRadius: 6 }} />}
          </div>
          <button className="btn btn-primary" type="submit">{editingId ? 'Update Vehicle' : 'Save Vehicle'}</button>
        </form>
      )}

      <div className="grid" style={{ gap: 8 }}>
        {vehicles.map((vehicle) => {
          const image = vehicleImageUrl(vehicle.VehicleImages?.find((item) => item.isPrimary)?.imageUrl || vehicle.VehicleImages?.[0]?.imageUrl || vehicle.thumbnail, placeholderImage);
          const dailyRate = vehicle.VehiclePricings?.find((pricing) => pricing.pricingType === 'daily')?.dailyRate;
          return (
            <div key={vehicle.id} className="card flex-between">
              <div className="flex" style={{ gap: 12 }}>
                <img src={image} alt={vehicle.name} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 6 }} />
                <div>
                  <strong>{vehicle.name}</strong> ({vehicle.vehicleNumber}) - {vehicle.VehicleCategory?.name}
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>{dailyRate ? `Rs. ${dailyRate}/day` : 'No pricing set'}</p>
                </div>
              </div>
              <div className="flex" style={{ gap: 8 }}>
                <select className="input" value={vehicle.status} onChange={(event) => setStatus(vehicle.id, event.target.value)}>
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button className="btn btn-outline" onClick={() => startEdit(vehicle)}>Edit</button>
                <button className="btn btn-outline" onClick={() => remove(vehicle.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
