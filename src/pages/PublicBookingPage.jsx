import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfDay, isSameDay, isBefore } from 'date-fns';
import supabase from '../lib/supabase';
import { useScheduling } from '../context/SchedulingContext';
import SafeIcon from '../common/SafeIcon';
import FlexibleBookingForm from '../components/FlexibleBookingForm';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiVideo, FiCheck, FiSliders } = FiIcons;

function PublicBookingPage() {
  const { username } = useParams();
  const { meetingTypes, dispatch, createGoogleMeetLink } = useScheduling();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userMeetingTypes, setUserMeetingTypes] = useState([]);
  const [availabilityRules, setAvailabilityRules] = useState([]);
  const [selectedMeetingType, setSelectedMeetingType] = useState(null);
  const [showFlexibleBooking, setShowFlexibleBooking] = useState(false);
  const [customDuration, setCustomDuration] = useState(30);
  const [customMeetingType, setCustomMeetingType] = useState('google-meet');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    const fetchProfileAndMeetingTypes = async () => {
      try {
        setLoading(true);

        // Fetch user profile by username
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles_sched2025')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error('User not found');

        setProfileData(profile);

        // Fetch user's meeting types
        const { data: meetingTypes, error: meetingTypesError } = await supabase
          .from('meeting_types_sched2025')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('active', true);

        if (meetingTypesError) throw meetingTypesError;
        setUserMeetingTypes(meetingTypes || []);

        // Fetch user's availability rules
        const { data: rules, error: rulesError } = await supabase
          .from('availability_rules_sched2025')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('active', true);

        if (rulesError) throw rulesError;
        setAvailabilityRules(rules || []);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndMeetingTypes();
  }, [username]);

  const handleMeetingTypeSelect = (meetingType) => {
    setSelectedMeetingType(meetingType);
  };

  const handleFlexibleBookingSubmit = (data) => {
    setCustomDuration(data.duration);
    setCustomMeetingType(data.meetingType);

    // Create custom meeting type
    const customType = {
      id: 'custom',
      name: 'Custom Meeting',
      duration: data.duration,
      description: 'Customized meeting based on your preferences',
      color: '#3B82F6',
      meeting_platform: data.meetingType,
      buffer_time_before: 5,
      buffer_time_after: 5,
      advance_notice: 60,
      max_advance_booking: 30,
      active: true,
      questions: []
    };

    setSelectedMeetingType(customType);
    setShowFlexibleBooking(false);
  };

  const handleBookingSuccess = (details) => {
    setBookingDetails(details);
    setShowConfirmation(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <SafeIcon icon={FiIcons.FiAlertTriangle} className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h2>
          <p className="text-gray-600 mb-6">
            {error === 'User not found' 
              ? `We couldn't find a scheduling page for @${username}` 
              : 'Something went wrong while loading this scheduling page'
            }
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedMeetingType && !showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* User Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <div className="flex items-center space-x-4">
                {profileData.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt={profileData.full_name}
                    className="w-20 h-20 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiUser} className="w-10 h-10 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{profileData.full_name}</h1>
                  <p className="text-blue-100">{profileData.title}</p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl">{profileData.bio}</p>
            </div>

            {/* Meeting Type Selection */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select a meeting type</h2>
              
              <div className="space-y-4">
                {userMeetingTypes.length > 0 ? (
                  userMeetingTypes.map((meetingType) => (
                    <motion.button
                      key={meetingType.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMeetingTypeSelect(meetingType)}
                      className="w-full text-left border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: meetingType.color }}
                          ></div>
                          <h3 className="text-lg font-semibold text-gray-900">{meetingType.name}</h3>
                        </div>
                        <span className="text-gray-500">{meetingType.duration} min</span>
                      </div>
                      <p className="text-gray-600 mt-2">{meetingType.description}</p>
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <SafeIcon 
                          icon={meetingType.meeting_platform === 'phone' ? FiPhone : FiVideo} 
                          className="w-4 h-4 mr-1" 
                        />
                        <span className="capitalize">
                          {meetingType.meeting_platform === 'phone' 
                            ? 'Phone Call' 
                            : meetingType.meeting_platform.replace('-', ' ')
                          }
                        </span>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No meeting types available</p>
                )}

                {/* Custom Meeting Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFlexibleBooking(true)}
                  className="w-full text-left border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiSliders} className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Custom Meeting</h3>
                  </div>
                  <p className="text-gray-600 mt-2">Create a meeting with custom duration and preferences</p>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {selectedMeetingType && !showConfirmation && (
          <BookingFlow
            meetingType={selectedMeetingType}
            userProfile={profileData}
            availabilityRules={availabilityRules}
            onBack={() => setSelectedMeetingType(null)}
            onSuccess={handleBookingSuccess}
            customMeetingType={customMeetingType}
          />
        )}

        {showConfirmation && (
          <ConfirmationScreen
            bookingDetails={bookingDetails}
            meetingType={selectedMeetingType}
            userProfile={profileData}
            customMeetingType={customMeetingType}
            onDone={() => {
              setShowConfirmation(false);
              setSelectedMeetingType(null);
            }}
          />
        )}

        <AnimatePresence>
          {showFlexibleBooking && (
            <FlexibleBookingForm
              onSubmit={handleFlexibleBookingSubmit}
              onCancel={() => setShowFlexibleBooking(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BookingFlow({ meetingType, userProfile, availabilityRules, onBack, onSuccess, customMeetingType }) {
  const { checkAvailability, createGoogleMeetLink, dispatch } = useScheduling();
  const [step, setStep] = useState('datetime');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(startOfDay(new Date()));
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    notes: '',
    answers: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to check if a time slot is available based on availability rules
  const isTimeSlotAvailable = (date, duration) => {
    // Get the day of week
    const dayOfWeek = format(date, 'EEEE').toLowerCase();

    // Find availability rule for this day
    const availabilityRule = availabilityRules.find(rule => 
      rule.type === 'availability' && 
      rule.conditions.days.includes(dayOfWeek)
    );

    if (!availabilityRule) return false;

    // Check if time is within allowed hours
    const timeRange = availabilityRule.conditions.timeRange;
    const startHour = parseInt(timeRange.start.split(':')[0]);
    const startMinute = parseInt(timeRange.start.split(':')[1]);
    const endHour = parseInt(timeRange.end.split(':')[0]);
    const endMinute = parseInt(timeRange.end.split(':')[1]);

    const slotHour = date.getHours();
    const slotMinute = date.getMinutes();

    // Convert to minutes for easier comparison
    const slotTotalMinutes = slotHour * 60 + slotMinute;
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Check if slot starts within allowed hours
    if (slotTotalMinutes < startTotalMinutes || slotTotalMinutes >= endTotalMinutes) {
      return false;
    }

    // Check if slot ends within allowed hours
    const slotEndTotalMinutes = slotTotalMinutes + duration;
    if (slotEndTotalMinutes > endTotalMinutes) {
      return false;
    }

    // Check buffer rules
    const bufferRule = availabilityRules.find(rule => rule.type === 'buffer');
    if (bufferRule) {
      // In a real app, we would check for conflicts with existing bookings
      // For this demo, we'll assume no conflicts
    }

    return true;
  };

  // Generate available time slots
  const generateTimeSlots = (date) => {
    const slots = [];
    const startTime = 9; // 9 AM
    const endTime = 17; // 5 PM
    const duration = meetingType.duration;
    const interval = 15; // 15-minute intervals

    for (let hour = startTime; hour < endTime; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        // Check if slot fits within business hours
        const slotEnd = new Date(slotTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);

        if (slotEnd.getHours() <= endTime) {
          // Use our availability function
          const isAvailable = isTimeSlotAvailable(slotTime, duration);
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

  const nextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const prevWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create meeting link based on the meeting type
      let meetLink = '';
      if (customMeetingType === 'google-meet' || meetingType.meeting_platform === 'google-meet') {
        meetLink = await createGoogleMeetLink({
          title: `${meetingType.name} with ${formData.guestName}`,
          startTime: selectedTime,
          duration: meetingType.duration
        });
      }

      // Save booking to database
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings_sched2025')
        .insert({
          meeting_type_id: meetingType.id === 'custom' ? null : meetingType.id,
          host_user_id: userProfile.user_id,
          guest_name: formData.guestName,
          guest_email: formData.guestEmail,
          guest_phone: formData.guestPhone,
          start_time: selectedTime.toISOString(),
          end_time: new Date(selectedTime.getTime() + meetingType.duration * 60000).toISOString(),
          status: 'confirmed',
          meeting_link: meetLink,
          notes: formData.notes,
          answers: Object.entries(formData.answers).map(([questionId, answer]) => {
            const question = meetingType.questions?.find(q => q.id === questionId);
            return {
              question: question?.question || '',
              answer
            };
          })
        })
        .select();

      if (bookingError) throw bookingError;

      // Also store in context for the current session
      dispatch({
        type: 'ADD_BOOKING',
        payload: {
          id: bookingData[0].id,
          meetingTypeId: meetingType.id,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          startTime: selectedTime.toISOString(),
          date: format(selectedTime, 'yyyy-MM-dd'),
          time: format(selectedTime, 'h:mm a'),
          duration: meetingType.duration,
          meetLink,
          meetingPlatform: customMeetingType || meetingType.meeting_platform,
          notes: formData.notes,
          status: 'confirmed',
          answers: Object.entries(formData.answers).map(([questionId, answer]) => {
            const question = meetingType.questions?.find(q => q.id === questionId);
            return {
              question: question?.question || '',
              answer
            };
          })
        }
      });

      // Pass booking details to parent component
      onSuccess({
        ...bookingData[0],
        selectedDate,
        selectedTime
      });
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentWeek, i);
    return { date: day, enabled: true };
  });

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <SafeIcon icon={FiIcons.FiArrowLeft} className="w-4 h-4 mr-1" />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: meetingType.color || '#3B82F6' }}
          />
          <span className="text-sm font-medium text-gray-700">{meetingType.name}</span>
          <span className="text-sm text-gray-500">({meetingType.duration} min)</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${step === 'datetime' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'datetime' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm font-medium">Date & Time</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200" />
          <div className={`flex items-center space-x-2 ${step === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm font-medium">Your Details</span>
          </div>
        </div>
      </div>

      {step === 'datetime' && (
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
              <SafeIcon icon={FiIcons.FiChevronLeft} className="w-5 h-5" />
            </motion.button>
            <h3 className="text-lg font-semibold text-gray-900">{format(currentWeek, 'MMMM yyyy')}</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiIcons.FiChevronRight} className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(({ date, enabled }, index) => {
              const isDisabled = isBefore(date, startOfDay(new Date())) || !enabled;
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              return (
                <motion.button
                  key={date.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: enabled ? 1 : 0.4, y: 0 }}
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
      )}

      {step === 'details' && (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">{meetingType.name}</p>
                <p className="text-sm text-blue-700">
                  {format(selectedDate, 'EEEE, MMMM d')} at {format(selectedTime, 'h:mm a')} (
                  {meetingType.duration} minutes)
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Via{' '}
                  {customMeetingType === 'phone' || meetingType.meeting_platform === 'phone'
                    ? 'Phone Call'
                    : 'Google Meet'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.guestName}
                onChange={(e) => handleFormChange('guestName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
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
              Phone Number{' '}
              {(customMeetingType === 'phone' || meetingType.meeting_platform === 'phone') ? '*' : ''}
            </label>
            <input
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => handleFormChange('guestPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required={customMeetingType === 'phone' || meetingType.meeting_platform === 'phone'}
            />
            {(customMeetingType === 'phone' || meetingType.meeting_platform === 'phone') && (
              <p className="text-sm text-gray-500 mt-1">
                Required for phone meetings. You will receive a call at this number at the scheduled time.
              </p>
            )}
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
                      onChange={(e) => handleFormChange('answers', { ...formData.answers, [question.id]: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={question.required}
                    />
                  ) : (
                    <input
                      type={question.type}
                      value={formData.answers[question.id] || ''}
                      onChange={(e) => handleFormChange('answers', { ...formData.answers, [question.id]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={question.required}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
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
              disabled={
                !formData.guestName ||
                !formData.guestEmail ||
                ((customMeetingType === 'phone' || meetingType.meeting_platform === 'phone') && !formData.guestPhone) ||
                isSubmitting
              }
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ConfirmationScreen({ bookingDetails, meetingType, userProfile, customMeetingType, onDone }) {
  if (!bookingDetails) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-8 text-center"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <SafeIcon icon={FiCheck} className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Meeting Scheduled!</h2>
      <p className="text-gray-600 mb-8">Your meeting has been successfully booked.</p>

      <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Meeting Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-500" />
            <span>With {userProfile.full_name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiCalendar} className="w-4 h-4 text-gray-500" />
            <span>{format(bookingDetails.selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-500" />
            <span>
              {format(bookingDetails.selectedTime, 'h:mm a')} ({meetingType.duration} minutes)
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiMail} className="w-4 h-4 text-gray-500" />
            <span>{bookingDetails.guest_email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <SafeIcon 
              icon={customMeetingType === 'phone' || meetingType.meeting_platform === 'phone' ? FiPhone : FiVideo} 
              className="w-4 h-4 text-gray-500" 
            />
            <span>
              {customMeetingType === 'phone' || meetingType.meeting_platform === 'phone'
                ? 'Phone Call'
                : 'Google Meet'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-2 mb-8">
        <p>📧 A confirmation email has been sent to {bookingDetails.guest_email}</p>
        <p>📅 The meeting has been added to both of your calendars</p>
        {customMeetingType === 'phone' || meetingType.meeting_platform === 'phone' ? (
          <p>📞 You will receive a phone call at the scheduled time</p>
        ) : (
          <p>🔗 Meeting link is included in the confirmation email</p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDone}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Done
      </motion.button>
    </motion.div>
  );
}

export default PublicBookingPage;