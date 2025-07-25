import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useScheduling } from '../context/SchedulingContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiUser, FiVideo, FiMail, FiPhone, FiFilter, FiSearch, FiMoreHorizontal } = FiIcons;

function Bookings() {
  const { bookings, meetingTypes } = useScheduling();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Sample bookings data (in real app, this would come from the context)
  const sampleBookings = [
    {
      id: '1',
      guestName: 'John Smith',
      guestEmail: 'john@example.com',
      guestPhone: '+1 (555) 123-4567',
      meetingTypeId: '1',
      date: '2024-01-15',
      time: '10:00 AM',
      startTime: '2024-01-15T10:00:00',
      duration: 15,
      status: 'confirmed',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      notes: 'Discussing project requirements',
      answers: []
    },
    {
      id: '2',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah@company.com',
      guestPhone: '+1 (555) 987-6543',
      meetingTypeId: '2',
      date: '2024-01-16',
      time: '2:00 PM',
      startTime: '2024-01-16T14:00:00',
      duration: 60,
      status: 'confirmed',
      meetLink: 'https://meet.google.com/xyz-uvwx-123',
      notes: 'Strategy planning session',
      answers: [
        { question: 'What would you like to discuss?', answer: 'Q1 planning and budget allocation' }
      ]
    },
    {
      id: '3',
      guestName: 'Mike Wilson',
      guestEmail: 'mike@startup.io',
      guestPhone: '',
      meetingTypeId: '1',
      date: '2024-01-17',
      time: '11:30 AM',
      startTime: '2024-01-17T11:30:00',
      duration: 15,
      status: 'pending',
      meetLink: '',
      notes: 'Quick intro call',
      answers: []
    }
  ];

  const allBookings = [...bookings, ...sampleBookings];

  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.startTime) - new Date(b.startTime);
      case 'name':
        return a.guestName.localeCompare(b.guestName);
      case 'type':
        const aType = meetingTypes.find(mt => mt.id === a.meetingTypeId)?.name || '';
        const bType = meetingTypes.find(mt => mt.id === b.meetingTypeId)?.name || '';
        return aType.localeCompare(bType);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-2">Manage all your scheduled meetings and appointments.</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {sortedBookings.length} booking{sortedBookings.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {sortedBookings.map((booking, index) => {
            const meetingType = meetingTypes.find(mt => mt.id === booking.meetingTypeId);
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.guestName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiClock} className="w-4 h-4" />
                          <span>{booking.time} ({booking.duration}min)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiMail} className="w-4 h-4" />
                          <span className="truncate">{booking.guestEmail}</span>
                        </div>
                        {booking.guestPhone && (
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiPhone} className="w-4 h-4" />
                            <span>{booking.guestPhone}</span>
                          </div>
                        )}
                      </div>
                      
                      {meetingType && (
                        <div className="flex items-center space-x-2 mt-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: meetingType.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{meetingType.name}</span>
                        </div>
                      )}
                      
                      {booking.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{booking.notes}"</p>
                      )}
                      
                      {booking.answers && booking.answers.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Guest Responses:</h4>
                          {booking.answers.map((answer, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{answer.question}</span>
                              <p className="text-gray-600 ml-2">{answer.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {booking.meetLink && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={booking.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <SafeIcon icon={FiVideo} className="w-4 h-4" />
                        <span>Join</span>
                      </motion.a>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiMoreHorizontal} className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {sortedBookings.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <SafeIcon icon={FiCalendar} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Your scheduled meetings will appear here'
                }
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Bookings;