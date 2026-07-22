import { Link } from 'react-router-dom';

export default function VehicleCard({ vehicle }) {
  const price = vehicle.VehiclePricing?.[0]?.dailyRate;
  const image = vehicle.VehicleImages?.[0]?.imageUrl || 'https://placehold.co/400x260?text=Vehicle';

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <img src={image} alt={vehicle.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
      <div style={{ padding: 14 }}>
        <div className="flex-between">
          <h3 style={{ margin: '0 0 4px' }}>{vehicle.name}</h3>
          <span className="badge badge-success">{vehicle.status}</span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0' }}>
          {vehicle.VehicleCategory?.name} · {vehicle.fuelType} · {vehicle.transmission} · {vehicle.seats} seats
        </p>
        <div className="flex-between" style={{ marginTop: 10 }}>
          <strong>{price ? `₹${price}/day` : 'Contact for price'}</strong>
          <Link to={`/vehicles/${vehicle.id}`} className="btn btn-primary">View Details</Link>
        </div>
      </div>
    </div>
  );
}
