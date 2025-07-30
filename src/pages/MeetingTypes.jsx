import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScheduling } from '../context/SchedulingContext';
import MeetingTypeForm from '../components/MeetingTypeForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit3, FiTrash2, FiClock, FiVideo, FiToggleLeft, FiToggleRight } = FiIcons;

function MeetingTypes() {
  const { meetingTypes, dispatch } = useScheduling();
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);

  // Check if form should be opened automatically from dashboard navigation
  useEffect(() => {
    const shouldOpenForm = sessionStorage.getItem('openMeetingTypeForm');
    if (shouldOpenForm === 'true') {
      setShowForm(true);
      sessionStorage.removeItem('openMeetingTypeForm');
    }
  }, []);

  const handleEdit = (meetingType) => {
    setEditingType(meetingType);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this meeting type?')) {
      dispatch({ type: 'DELETE_MEETING_TYPE', payload: id });
    }
  };

  const handleToggleActive = (meetingType) => {
    dispatch({
      type: 'UPDATE_MEETING_TYPE',
      payload: { ...meetingType, active: !meetingType.active }
    });
  };

  const handleFormSubmit = (data) => {
    if (editingType) {
      dispatch({ type: 'UPDATE_MEETING_TYPE', payload: { ...editingType, ...data } });
    } else {
      dispatch({ type: 'ADD_MEETING_TYPE', payload: data });
    }
    setShowForm(false);
    setEditingType(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meeting Types</h1>
            <p className="text-gray-600 mt-2">
              Configure different types of meetings with custom durations and rules.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Meeting Type</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetingTypes.map((meetingType, index) => (
            <motion.div
              key={meetingType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${
                meetingType.active ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: meetingType.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{meetingType.name}</h3>
                </div>
                <button
                  onClick={() => handleToggleActive(meetingType)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon
                    icon={meetingType.active ? FiToggleRight : FiToggleLeft}
                    className={`w-6 h-6 ${meetingType.active ? 'text-green-500' : 'text-gray-300'}`}
                  />
                </button>
              </div>
              <p className="text-gray-600 mb-4">{meetingType.description}</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <SafeIcon icon={FiClock} className="w-4 h-4" />
                  <span>{meetingType.duration} minutes</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <SafeIcon icon={FiVideo} className="w-4 h-4" />
                  <span className="capitalize">{meetingType.meetingPlatform.replace('-', ' ')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEdit(meetingType)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  <span>Edit</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(meetingType.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showForm && (
            <MeetingTypeForm
              meetingType={editingType}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingType(null);
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default MeetingTypes;