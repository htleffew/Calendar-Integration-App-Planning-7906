import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { useScheduling } from '../context/SchedulingContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser, FiVideo } = FiIcons;

function Calendar() {
  const { bookings, meetingTypes } = useScheduling();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;

  // Generate calendar days
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      // Get bookings for this day
      const dayBookings = bookings.filter(booking => 
        isSameDay(new Date(booking.startTime), day)
      );

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
            !isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : 'bg-white'
          } ${
            isSameDay(day, selectedDate) ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setSelectedDate(cloneDay)}
        >
          <div className={`text-sm font-medium mb-2 ${
            isToday(day) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
          }`}>
            {formattedDate}
          </div>
          
          <div className="space-y-1">
            {dayBookings.slice(0, 3).map((booking, index) => {
              const meetingType = meetingTypes.find(mt => mt.id === booking.meetingTypeId);
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-xs p-1 rounded truncate"
                  style={{ backgroundColor: meetingType?.color + '20', color: meetingType?.color }}
                >
                  {booking.guestName}
                </motion.div>
              );
            })}
            {dayBookings.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayBookings.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day} className="grid grid-cols-7">
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => {
    setCurrentDate(addDays(currentDate, 30));
  };

  const prevMonth = () => {
    setCurrentDate(addDays(currentDate, -30));
  };

  const selectedDateBookings = bookings.filter(booking => 
    isSameDay(new Date(booking.startTime), selectedDate)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">View and manage your scheduled meetings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiChevronLeft} className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Today
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiChevronRight} className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div>{rows}</div>
          </div>

          {/* Selected Date Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
              </div>

              {selectedDateBookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateBookings.map((booking, index) => {
                    const meetingType = meetingTypes.find(mt => mt.id === booking.meetingTypeId);
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{booking.guestName}</h4>
                          <span 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: meetingType?.color }}
                          />
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiClock} className="w-4 h-4" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiUser} className="w-4 h-4" />
                            <span>{meetingType?.name}</span>
                          </div>
                          {booking.meetLink && (
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiVideo} className="w-4 h-4" />
                              <a 
                                href={booking.meetLink}
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Join Meeting
                              </a>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No meetings scheduled</p>
                </div>
              )}
            </div>

            {/* Meeting Types Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Types</h3>
              <div className="space-y-3">
                {meetingTypes.filter(mt => mt.active).map(meetingType => (
                  <div key={meetingType.id} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: meetingType.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{meetingType.name}</p>
                      <p className="text-sm text-gray-500">{meetingType.duration} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Calendar;