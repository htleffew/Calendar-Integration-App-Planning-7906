import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MeetingTypes from './pages/MeetingTypes';
import Rules from './pages/Rules';
import Calendar from './pages/Calendar';
import Bookings from './pages/Bookings';
import Settings from './pages/Settings';
import BookingPage from './pages/BookingPage';
import { SchedulingProvider } from './context/SchedulingContext';
import './App.css';

function App() {
  return (
    <SchedulingProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="pt-16"
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/meeting-types" element={<MeetingTypes />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/book/:meetingTypeId" element={<BookingPage />} />
            </Routes>
          </motion.main>
        </div>
      </Router>
    </SchedulingProvider>
  );
}

export default App;