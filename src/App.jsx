import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import DashboardPage from './components/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BusSearchPage from './components/BusSearchPage';
import BusSeatSelection from './components/BusSeatSelection';
import BusPassengerForm from './components/BusPassengerForm';
import PaymentSuccess from './components/PaymentSuccess';
import ReservationConfirmation from './components/ReservationConfirmation';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="bus/search" element={<BusSearchPage />} />
            <Route path="bus/seats/:tripId" element={<BusSeatSelection />} />
            <Route path="bus/passenger/:tripId/:seatId" element={<BusPassengerForm />} />
            <Route path="reservation/confirmation" element={<ReservationConfirmation />} />
            <Route path="validation" element={<PaymentSuccess />} />
            <Route path="shop/payment/validate" element={<PaymentSuccess />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;