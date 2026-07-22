import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Implements SRS steps 2-10: dates -> locations -> price calc -> coupon -> customer details -> payment -> confirmation
export default function Booking() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [locations, setLocations] = useState([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    pickupDateTime: '', returnDateTime: '', pickupLocationId: '', dropLocationId: '',
    rentalType: 'self_drive', couponCode: '', distanceKm: 0,
  });
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get(`/vehicles/${vehicleId}`).then((res) => setVehicle(res.data));
    api.get('/locations').then((res) => setLocations(res.data));
  }, [vehicleId]);

  const getQuote = async () => {
    setError('');
    try {
      const res = await api.post('/bookings/quote', {
        vehicleId, pickupDateTime: form.pickupDateTime, returnDateTime: form.returnDateTime,
        distanceKm: Number(form.distanceKm) || 0, couponCode: form.couponCode || undefined,
      });
      setQuote(res.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not calculate price');
    }
  };

  const confirmBooking = async () => {
    setProcessing(true);
    setError('');
    try {
      const res = await api.post('/bookings', {
        vehicleId, ...form, distanceKm: Number(form.distanceKm) || 0,
      });
      setBooking(res.data);

      // Initiate mock payment, then verify (see README for real gateway wiring)
      const pay = await api.post('/payments/initiate', { bookingId: res.data.id, method: 'upi' });
      await api.post('/payments/verify', { paymentId: pay.data.payment.id, success: true });

      setStep(5);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!vehicle) return <div className="container" style={{ padding: 40 }}>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: 600, padding: '30px 0' }}>
      <h2>Book: {vehicle.name}</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {step === 1 && (
        <div className="card">
          <h3>Step 1-2: Dates, Locations & Rental Type</h3>
          <label>Pickup Date & Time</label>
          <input className="input" type="datetime-local" value={form.pickupDateTime}
            onChange={(e) => setForm({ ...form, pickupDateTime: e.target.value })} style={{ marginBottom: 10 }} />
          <label>Return Date & Time</label>
          <input className="input" type="datetime-local" value={form.returnDateTime}
            onChange={(e) => setForm({ ...form, returnDateTime: e.target.value })} style={{ marginBottom: 10 }} />
          <label>Pickup Location</label>
          <select className="input" value={form.pickupLocationId}
            onChange={(e) => setForm({ ...form, pickupLocationId: e.target.value })} style={{ marginBottom: 10 }}>
            <option value="">Select</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.city} - {l.branchName}</option>)}
          </select>
          <label>Drop Location</label>
          <select className="input" value={form.dropLocationId}
            onChange={(e) => setForm({ ...form, dropLocationId: e.target.value })} style={{ marginBottom: 10 }}>
            <option value="">Select</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.city} - {l.branchName}</option>)}
          </select>
          <label>Rental Type</label>
          <select className="input" value={form.rentalType}
            onChange={(e) => setForm({ ...form, rentalType: e.target.value })} style={{ marginBottom: 10 }}>
            <option value="self_drive">Self Drive</option>
            {vehicle.driverIncludedAvailable && <option value="driver_included">Driver Included</option>}
          </select>
          <label>Estimated Distance (km) — for per-km pricing</label>
          <input className="input" type="number" value={form.distanceKm}
            onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} style={{ marginBottom: 14 }} />
          <button className="btn btn-primary" onClick={() => setStep(2)}
            disabled={!form.pickupDateTime || !form.returnDateTime}>
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h3>Step 3: Apply Coupon (optional)</h3>
          <input className="input" placeholder="Coupon code" value={form.couponCode}
            onChange={(e) => setForm({ ...form, couponCode: e.target.value })} style={{ marginBottom: 14 }} />
          <button className="btn btn-outline" onClick={() => setStep(1)} style={{ marginRight: 10 }}>Back</button>
          <button className="btn btn-primary" onClick={getQuote}>Calculate Price</button>
        </div>
      )}

      {step === 3 && quote && (
        <div className="card">
          <h3>Step 4: Price Breakdown</h3>
          {quote.breakdown.map((b, i) => (
            <div key={i} className="flex-between"><span>{b.label}</span><span>₹{b.amount.toFixed(2)}</span></div>
          ))}
          {quote.discountAmount > 0 && (
            <div className="flex-between" style={{ color: 'green' }}><span>Discount</span><span>-₹{quote.discountAmount.toFixed(2)}</span></div>
          )}
          {quote.couponError && <p style={{ color: 'crimson', fontSize: 13 }}>{quote.couponError}</p>}
          <div className="flex-between"><span>Tax</span><span>₹{quote.taxAmount.toFixed(2)}</span></div>
          <hr />
          <div className="flex-between"><strong>Total</strong><strong>₹{quote.totalAmount.toFixed(2)}</strong></div>
          <button className="btn btn-outline" onClick={() => setStep(2)} style={{ marginTop: 14, marginRight: 10 }}>Back</button>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setStep(4)}>Continue to Payment</button>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <h3>Step 8-9: Confirm & Pay</h3>
          <p>Total payable: <strong>₹{quote.totalAmount.toFixed(2)}</strong></p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Payment is currently mocked for demo purposes. Wire a real gateway (Razorpay/Stripe/Cashfree)
            in paymentController.js before going live.
          </p>
          <button className="btn btn-primary" disabled={processing} onClick={confirmBooking}>
            {processing ? 'Processing...' : 'Pay & Confirm Booking'}
          </button>
        </div>
      )}

      {step === 5 && booking && (
        <div className="card">
          <h3>✅ Step 10: Booking Confirmed!</h3>
          <p>Booking Code: <strong>{booking.bookingCode}</strong></p>
          <p>Status: {booking.status}</p>
          <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
        </div>
      )}
    </div>
  );
}
