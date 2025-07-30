import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MeetingTypes from './pages/MeetingTypes';
import Rules from './pages/Rules';
import Calendar from './pages/Calendar';
import Bookings from './pages/Bookings';
import Settings from './pages/Settings';
import BookingPage from './pages/BookingPage';
import PublicBookingPage from './pages/PublicBookingPage';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import { SchedulingProvider } from './context/SchedulingContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('sb-auth-token');
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SchedulingProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Auth />} />
              <Route path="/schedule/:username" element={<PublicBookingPage />} />
              <Route path="/book/:meetingTypeId" element={<BookingPage />} />
              
              {/* Protected routes */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              
              {/* Protected routes with header */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Header />
                  <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="pt-16"
                  >
                    <Dashboard />
                  </motion.main>
                </ProtectedRoute>
              } />
              
              <Route path="/meeting-types" element={
                <ProtectedRoute>
                  <Header />
                  <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="pt-16"
                  >
                    <MeetingTypes />
                  </motion.main>
                </ProtectedRoute>
              } />
              
              <Route path="/rules" element={
                <ProtectedRoute>
                  <Header />
                  <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="pt-16"
                  >
                    <Rules />
                  </motion.main>
                </ProtectedRoute>
              } />
              
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Header />
                  <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="pt-16"
                  >
                    <Calendar />
                  </motion.main>
                </ProtectedRoute>
              } />
              
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <Header />
                  <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="pt-16"
                  >
                    <Bookings />
                  </motion.main>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Header />
                  <motion.main
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="pt-16"
                  >
                    <Settings />
                  </motion.main>
                </ProtectedRoute>
              } />
              
              {/* Redirect to dashboard if authenticated, otherwise to login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SchedulingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;