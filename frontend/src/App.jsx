import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Search from './pages/Search';
import VehicleDetail from './pages/VehicleDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';

import MyBookings from './pages/customer/MyBookings';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminVehicles from './pages/admin/Vehicles';
import AdminBookings from './pages/admin/Bookings';
import AdminCoupons from './pages/admin/Coupons';
import AdminLocations from './pages/admin/Locations';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/book/:vehicleId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<AdminVehicles />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="locations" element={<AdminLocations />} />
        </Route>

        <Route path="*" element={<div className="container" style={{ padding: 60 }}>404 - Page not found</div>} />
      </Routes>
    </>
  );
}
