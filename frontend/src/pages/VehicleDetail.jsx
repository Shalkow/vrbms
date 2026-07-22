import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { vehicleImageUrl } from '../utils/vehicleImage';

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { api.get(`/vehicles/${id}`).then((res) => setVehicle(res.data)); }, [id]);

  if (!vehicle) return <div className="container" style={{ padding: 40 }}>Loading...</div>;

  const price = vehicle.VehiclePricing?.[0]?.dailyRate;
  const image = vehicleImageUrl(vehicle.VehicleImages?.[0]?.imageUrl, 'https://placehold.co/700x400?text=Vehicle');
  let features = [];
  try { features = JSON.parse(vehicle.features || '[]'); } catch { /* ignore */ }

  const handleBookNow = () => {
    if (!user) return navigate('/login', { state: { from: `/book/${vehicle.id}` } });
    navigate(`/book/${vehicle.id}`);
  };

  return (
    <div className="container" style={{ padding: '30px 0', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
      <div>
        <img src={image} alt={vehicle.name} style={{ width: '100%', borderRadius: 12, height: 360, objectFit: 'cover' }} />
        <h2 style={{ marginTop: 16 }}>{vehicle.name}</h2>
        <p style={{ color: 'var(--muted)' }}>
          {vehicle.VehicleCategory?.name} · {vehicle.fuelType} · {vehicle.transmission} · {vehicle.seats} seats · {vehicle.luggageCapacity} bags
        </p>
        <h3>Features</h3>
        <ul>{features.map((f) => <li key={f}>{f}</li>)}</ul>
        <h3>Rental Policies</h3>
        <p>Security Deposit: ₹{vehicle.securityDeposit}</p>
        <p>Fuel Policy: Return with same fuel level as pickup.</p>
        <p>Cancellation: Free cancellation up to 24 hrs before pickup (configurable by admin).</p>
      </div>

      <div className="card" style={{ height: 'fit-content' }}>
        <h3>{price ? `₹${price} / day` : 'Contact for price'}</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          Location: {vehicle.Location?.city}
        </p>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={handleBookNow}>
          Book Now
        </button>
      </div>
    </div>
  );
}
