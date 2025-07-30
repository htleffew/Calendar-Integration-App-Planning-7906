import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiPhone, FiVideo, FiSun, FiMoon, FiCalendar, FiCheck, FiX } = FiIcons;

function FlexibleBookingForm({ onSubmit, onCancel }) {
  const [duration, setDuration] = useState({ hours: 0, minutes: 30 });
  const [meetingType, setMeetingType] = useState('google-meet');
  const [timePreference, setTimePreference] = useState('any');
  const [dayPreferences, setDayPreferences] = useState([]);
  const [showAllSlots, setShowAllSlots] = useState(true);
  const [nextAvailable, setNextAvailable] = useState(false);

  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ];

  const handleHoursChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setDuration({ ...duration, hours: value });
  };

  const handleMinutesChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setDuration({ ...duration, minutes: value });
  };

  const toggleDayPreference = (day) => {
    if (dayPreferences.includes(day)) {
      setDayPreferences(dayPreferences.filter(d => d !== day));
    } else {
      setDayPreferences([...dayPreferences, day]);
    }
    setShowAllSlots(false);
    setNextAvailable(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate total minutes
    const totalMinutes = (duration.hours * 60) + duration.minutes;
    
    onSubmit({
      duration: totalMinutes,
      meetingType,
      timePreference,
      dayPreferences: dayPreferences.length > 0 ? dayPreferences : null,
      showAllSlots,
      nextAvailable
    });
  };

  const handleNextAvailableToggle = () => {
    setNextAvailable(true);
    setShowAllSlots(false);
    setDayPreferences([]);
  };

  const handleShowAllToggle = () => {
    setShowAllSlots(true);
    setNextAvailable(false);
    setDayPreferences([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Customize Your Meeting</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meeting Duration */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              Meeting Duration
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={duration.hours}
                  onChange={handleHoursChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Minutes</label>
                <select
                  value={duration.minutes}
                  onChange={handleMinutesChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">0</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
            </div>
          </div>

          {/* Meeting Type */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              Meeting Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMeetingType('google-meet')}
                className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  meetingType === 'google-meet'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiVideo} className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Google Meet</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMeetingType('phone')}
                className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  meetingType === 'phone'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiPhone} className="w-6 h-6 text-green-600" />
                <span className="font-medium">Phone Call</span>
              </motion.button>
            </div>
          </div>

          {/* Time Preference */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              Time Preference
            </label>
            <div className="grid grid-cols-3 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTimePreference('any')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  timePreference === 'any'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiClock} className="w-6 h-6 mb-2 text-gray-600" />
                <span className="font-medium">Any Time</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTimePreference('morning')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  timePreference === 'morning'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiSun} className="w-6 h-6 mb-2 text-yellow-500" />
                <span className="font-medium">Morning</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTimePreference('afternoon')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  timePreference === 'afternoon'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiMoon} className="w-6 h-6 mb-2 text-indigo-500" />
                <span className="font-medium">Afternoon</span>
              </motion.button>
            </div>
          </div>

          {/* Day Preferences */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              Day Preferences
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <motion.button
                  key={day.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleDayPreference(day.id)}
                  className={`py-2 rounded-lg text-center transition-colors ${
                    dayPreferences.includes(day.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Slot Options */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-900">
              View Options
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleShowAllToggle}
                className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  showAllSlots
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiCalendar} className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Show All Available Slots</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNextAvailableToggle}
                className={`flex items-center justify-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  nextAvailable
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-600" />
                <span className="font-medium">Next Available Slot</span>
              </motion.button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find Available Times
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default FlexibleBookingForm;