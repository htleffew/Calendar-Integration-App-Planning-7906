import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useScheduling } from '../context/SchedulingContext';
import { format, addDays } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiUsers, FiPlus, FiExternalLink, FiTrendingUp, FiSettings } = FiIcons;

const Dashboard = () => {
  const { meetingTypes, events, loading } = useScheduling();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const upcomingEvents = events
    .filter(event => new Date(event.start) > new Date())
    .slice(0, 5);

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  const stats = [
    {
      label: 'Today\'s Meetings',
      value: todayEvents.length,
      icon: FiCalendar,
      color: 'bg-blue-500',
    },
    {
      label: 'This Week',
      value: events.filter(event => {
        const eventDate = new Date(event.start);
        const weekStart = new Date();
        const weekEnd = addDays(weekStart, 7);
        return eventDate >= weekStart && eventDate <= weekEnd;
      }).length,
      icon: FiTrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Meeting Types',
      value: meetingTypes.length,
      icon: FiUsers,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Events',
      value: events.length,
      icon: FiClock,
      color: 'bg-orange-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Manage your sophisticated scheduling system with advanced availability rules
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Meeting Types */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Meeting Types</h2>
            <Link
              to="/settings"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
            >
              <span>Manage</span>
              <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {meetingTypes.map((type) => (
              <div
                key={type.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: type.color }}
                    ></div>
                    <h3 className="font-semibold text-gray-900">{type.name}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{type.duration} min</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                <Link
                  to={`/book/${type.id}`}
                  className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span>Book Meeting</span>
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
            <Link
              to="/calendar"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.start), 'MMM d, yyyy')} at{' '}
                        {format(new Date(event.start), 'h:mm a')}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-2">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <SafeIcon icon={FiClock} className="w-4 h-4" />
                      <span>
                        {Math.round(
                          (new Date(event.end) - new Date(event.start)) / (1000 * 60)
                        )}{' '}
                        min
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming events</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white"
      >
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/calendar"
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
          >
            <SafeIcon icon={FiCalendar} className="w-8 h-8 mb-2" />
            <h3 className="font-semibold mb-1">View Calendar</h3>
            <p className="text-sm opacity-90">See all your scheduled events</p>
          </Link>

          <Link
            to="/settings"
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
          >
            <SafeIcon icon={FiSettings} className="w-8 h-8 mb-2" />
            <h3 className="font-semibold mb-1">Manage Settings</h3>
            <p className="text-sm opacity-90">Configure meeting types and rules</p>
          </Link>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <SafeIcon icon={FiUsers} className="w-8 h-8 mb-2" />
            <h3 className="font-semibold mb-1">Share Your Link</h3>
            <p className="text-sm opacity-90">Let others book time with you</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;