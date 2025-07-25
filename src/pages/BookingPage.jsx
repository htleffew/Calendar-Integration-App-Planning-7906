import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfDay, isSameDay, isAfter, isBefore } from 'date-fns';
import { useScheduling } from '../context/SchedulingContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiMessageSquare, FiCheck, FiChevronLeft, FiChevronRight } = FiIcons;

function BookingPage() {
  const { meetingTypeId } = useParams();
  const { meetingTypes, dispatch, createGoogleMeetLink, checkAvailability } = useScheduling();
  const [step, setStep] = useState('datetime');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    notes: '',
    answers: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(startOfDay(new Date()));

  const meetingType = meetingTypes.find(mt => mt.id === meetingTypeId);

  if (!meetingType || !meetingType.active) {
    return <Navigate to="/" replace />;
  }

  // Generate available time slots
  const generateTimeSlots = (date) => {
    const slots = [];
    const startTime = 9; // 9 AM
    const endTime = 17; // 5 PM
    const duration = meetingType.duration;
    const interval = 30; // 30-minute intervals

    for (let hour = startTime; hour < endTime; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Check if slot fits within business hours
        const slotEnd = new Date(slotTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);
        
        if (slotEnd.getHours() <= endTime) {
          const isAvailable = checkAvailability(slotTime, duration, meetingTypeId);
          
          slots.push({
            time: slotTime,
            available: isAvailable,
            display: format(slotTime, 'h:mm a')
          });
        }
      }
    }
    
    return slots;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswerChange = (questionId, answer) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create Google Meet link
      const meetLink = await createGoogleMeetLink({
        title: `${meetingType.name} with ${formData.guestName}`,
        startTime: selectedTime,
        duration: meetingType.duration
      });

      // Create booking
      const booking = {
        meetingTypeId,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        startTime: selectedTime.toISOString(),
        date: format(selectedTime, 'yyyy-MM-dd'),
        time: format(selectedTime, 'h:mm a'),
        duration: meetingType.duration,
        meetLink,
        notes: formData.notes,
        status: 'confirmed',
        answers: Object.entries(formData.answers).map(([questionId, answer]) => {
          const question = meetingType.questions.find(q => q.id === questionId);
          return {
            question: question?.question || '',
            answer
          };
        })
      };

      dispatch({ type: 'ADD_BOOKING', payload: booking });
      setStep('confirmation');
    } catch (error) {
      console.error('Failed to create booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const prevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const renderDateTimeStep = () => (
    <div className="space-y-8">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isBefore(addDays(currentWeek, -7), startOfDay(new Date()))}
        >
          <SafeIcon icon={FiChevronLeft} className="w-5 h-5" />
        </motion.button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentWeek, 'MMMM yyyy')}
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <SafeIcon icon={FiChevronRight} className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const isDisabled = isBefore(date, startOfDay(new Date()));
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          
          return (
            <motion.button
              key={date.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !isDisabled && handleDateSelect(date)}
              disabled={isDisabled}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="text-sm font-medium">{format(date, 'EEE')}</div>
              <div className="text-lg font-bold">{format(date, 'd')}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-gray-900">
            Available times for {format(selectedDate, 'EEEE, MMMM d')}
          </h4>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {timeSlots.map((slot, index) => (
              <motion.button
                key={slot.time.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => slot.available && handleTimeSelect(slot.time)}
                disabled={!slot.available}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedTime && selectedTime.getTime() === slot.time.getTime()
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : slot.available
                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {slot.display}
              </motion.button>
            ))}
          </div>
          
          {timeSlots.filter(slot => slot.available).length === 0 && (
            <div className="text-center py-8">
              <SafeIcon icon={FiClock} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No available times for this date</p>
            </div>
          )}
        </motion.div>
      )}

      {selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep('details')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue
          </motion.button>
        </motion.div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">{meetingType.name}</p>
            <p className="text-sm text-blue-700">
              {format(selectedDate, 'EEEE, MMMM d')} at {format(selectedTime, 'h:mm a')} ({meetingType.duration} minutes)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.guestName}
            onChange={(e) => handleFormChange('guestName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.guestEmail}
            onChange={(e) => handleFormChange('guestEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.guestPhone}
          onChange={(e) => handleFormChange('guestPhone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Custom Questions */}
      {meetingType.questions && meetingType.questions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
          {meetingType.questions.map(question => (
            <div key={question.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {question.question} {question.required && '*'}
              </label>
              {question.type === 'textarea' ? (
                <textarea
                  value={formData.answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={question.required}
                />
              ) : (
                <input
                  type={question.type}
                  value={formData.answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={question.required}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleFormChange('notes', e.target.value)}
          rows="3"
          placeholder="Anything you'd like to share before the meeting?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep('datetime')}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!formData.guestName || !formData.guestEmail || isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
        </motion.button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <SafeIcon icon={FiCheck} className="w-10 h-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Meeting Scheduled!</h2>
        <p className="text-gray-600">Your meeting has been successfully scheduled.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Meeting Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-500" />
            <span>{meetingType.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-500" />
            <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-500" />
            <span>{format(selectedTime, 'h:mm a')} ({meetingType.duration} minutes)</span>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiMail} className="w-4 h-4 text-gray-500" />
            <span>{formData.guestEmail}</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <p>📧 A confirmation email has been sent to {formData.guestEmail}</p>
        <p>📅 The meeting has been added to your calendar</p>
        <p>🔗 Meeting link will be included in the confirmation email</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href = '/'}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Done
      </motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: meetingType.color }}
              />
              <h1 className="text-2xl font-bold text-gray-900">{meetingType.name}</h1>
            </div>
            <p className="text-gray-600">{meetingType.description}</p>
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiClock} className="w-4 h-4" />
                <span>{meetingType.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                <span className="capitalize">{meetingType.meetingPlatform.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {step !== 'confirmation' && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${
                  step === 'datetime' ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'datetime' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="text-sm font-medium">Date & Time</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-200" />
                <div className={`flex items-center space-x-2 ${
                  step === 'details' ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="text-sm font-medium">Your Details</span>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 'datetime' && renderDateTimeStep()}
              {step === 'details' && renderDetailsStep()}
              {step === 'confirmation' && renderConfirmationStep()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default BookingPage;