import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiSettings, FiGrid, FiList, FiBarChart3 } = FiIcons;

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiBarChart3 },
  { name: 'Meeting Types', href: '/meeting-types', icon: FiGrid },
  { name: 'Rules', href: '/rules', icon: FiSettings },
  { name: 'Calendar', href: '/calendar', icon: FiCalendar },
  { name: 'Bookings', href: '/bookings', icon: FiList },
  { name: 'Settings', href: '/settings', icon: FiClock }
];

function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900">SchedulePro</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <SafeIcon icon={item.icon} className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Share Link
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;