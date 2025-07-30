import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiArrowRight, FiCheck, FiGlobe, FiSettings } = FiIcons;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '17:00',
    meetingTypes: [
      { name: 'Quick Chat', duration: 15, color: '#3B82F6' },
      { name: 'Standard Meeting', duration: 30, color: '#10B981' }
    ],
    connectCalendar: false
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDayToggle = (day) => {
    const currentDays = [...formData.availableDays];
    if (currentDays.includes(day)) {
      handleChange('availableDays', currentDays.filter(d => d !== day));
    } else {
      handleChange('availableDays', [...currentDays, day]);
    }
  };

  const handleMeetingTypeChange = (index, field, value) => {
    const updatedTypes = [...formData.meetingTypes];
    updatedTypes[index] = { ...updatedTypes[index], [field]: value };
    handleChange('meetingTypes', updatedTypes);
  };

  const addMeetingType = () => {
    const colorOptions = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];
    const newColor = colorOptions[formData.meetingTypes.length % colorOptions.length];
    handleChange('meetingTypes', [
      ...formData.meetingTypes,
      { name: '', duration: 30, color: newColor }
    ]);
  };

  const removeMeetingType = (index) => {
    handleChange('meetingTypes', formData.meetingTypes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found');
      }

      // Save availability rule
      const { error: ruleError } = await supabase
        .from('availability_rules_sched2025')
        .insert({
          user_id: user.id,
          name: 'Default Working Hours',
          type: 'availability',
          active: true,
          conditions: {
            days: formData.availableDays,
            timeRange: {
              start: formData.startTime,
              end: formData.endTime
            },
            timezone: formData.timezone
          }
        });

      if (ruleError) throw ruleError;

      // Save meeting types
      const meetingTypesToInsert = formData.meetingTypes
        .filter(mt => mt.name.trim())
        .map(mt => ({
          user_id: user.id,
          name: mt.name,
          slug: mt.name.toLowerCase().replace(/\s+/g, '-'),
          duration: mt.duration,
          color: mt.color,
          description: `${mt.duration}-minute meeting`,
          meeting_platform: 'google-meet',
          active: true
        }));

      if (meetingTypesToInsert.length > 0) {
        const { error: meetingTypeError } = await supabase
          .from('meeting_types_sched2025')
          .insert(meetingTypesToInsert);

        if (meetingTypeError) throw meetingTypeError;
      }

      // Update user profile with timezone
      const { error: profileError } = await supabase
        .from('user_profiles_sched2025')
        .update({
          timezone: formData.timezone,
          onboarding_completed: true
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Set your availability</h2>
            <p className="text-gray-600">
              Define when you're generally available for meetings. You can customize this further later.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Your timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Central European Time (CET)</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Available days</label>
              <div className="grid grid-cols-7 gap-2">
                {[
                  { id: 'monday', label: 'Mon' },
                  { id: 'tuesday', label: 'Tue' },
                  { id: 'wednesday', label: 'Wed' },
                  { id: 'thursday', label: 'Thu' },
                  { id: 'friday', label: 'Fri' },
                  { id: 'saturday', label: 'Sat' },
                  { id: 'sunday', label: 'Sun' }
                ].map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleDayToggle(day.id)}
                    className={`py-2 rounded-lg text-center transition-colors ${
                      formData.availableDays.includes(day.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Continue</span>
                <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Create meeting types</h2>
            <p className="text-gray-600">
              Define the types of meetings people can book with you. You can add more later.
            </p>

            <div className="space-y-4">
              {formData.meetingTypes.map((meetingType, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: meetingType.color }}
                      ></div>
                      <h3 className="font-medium">Meeting Type {index + 1}</h3>
                    </div>
                    {formData.meetingTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMeetingType(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <SafeIcon icon={FiIcons.FiTrash2} className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={meetingType.name}
                        onChange={(e) => handleMeetingTypeChange(index, 'name', e.target.value)}
                        placeholder="e.g., Quick Chat"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Duration (minutes)</label>
                      <select
                        value={meetingType.duration}
                        onChange={(e) => handleMeetingTypeChange(index, 'duration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="45">45</option>
                        <option value="60">60</option>
                        <option value="90">90</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Color</label>
                    <div className="flex space-x-2">
                      {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleMeetingTypeChange(index, 'color', color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            meetingType.color === color ? 'border-gray-400' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMeetingType}
                className="w-full flex items-center justify-center space-x-2 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <SafeIcon icon={FiIcons.FiPlus} className="w-4 h-4" />
                <span>Add another meeting type</span>
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(3)}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Continue</span>
                <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Almost done!</h2>
            <p className="text-gray-600">
              Review your settings and finish setting up your scheduling page.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiGlobe} className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Timezone</h3>
                  <p className="text-gray-600">{formData.timezone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiClock} className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Availability</h3>
                  <p className="text-gray-600">
                    {formData.availableDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                    <br />
                    {formData.startTime} - {formData.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiSettings} className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Meeting Types</h3>
                  <div className="space-y-2 mt-1">
                    {formData.meetingTypes.map((type, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        ></div>
                        <p className="text-gray-600">
                          {type.name || `Meeting Type ${index + 1}`} ({type.duration} min)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Connect your calendar</h3>
                  <p className="text-sm text-blue-700">
                    For more accurate availability, connect your calendar so we can check for conflicts.
                  </p>
                </div>
              </div>
              <div className="mt-3 ml-8">
                <button
                  type="button"
                  onClick={() => handleChange('connectCalendar', !formData.connectCalendar)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    formData.connectCalendar
                      ? 'bg-blue-600 text-white'
                      : 'border border-blue-300 text-blue-700'
                  }`}
                >
                  <SafeIcon icon={formData.connectCalendar ? FiCheck : FiCalendar} className="w-4 h-4" />
                  <span>{formData.connectCalendar ? 'Calendar will be connected' : 'Connect Calendar'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Setting up...' : 'Complete Setup'}</span>
                {!loading && <SafeIcon icon={FiCheck} className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiCalendar} className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-900">Set up your scheduling page</h1>
            <p className="text-center text-gray-600 mt-2">
              Just a few steps to customize your booking experience
            </p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div
                    className={`flex items-center space-x-2 ${
                      step === stepNumber ? 'text-blue-600' : step > stepNumber ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step === stepNumber
                          ? 'bg-blue-600 text-white'
                          : step > stepNumber
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {step > stepNumber ? <SafeIcon icon={FiCheck} className="w-5 h-5" /> : stepNumber}
                    </div>
                    <span className="text-sm font-medium hidden md:block">
                      {stepNumber === 1 ? 'Availability' : stepNumber === 2 ? 'Meeting Types' : 'Review'}
                    </span>
                  </div>
                  {stepNumber < 3 && <div className="w-12 h-0.5 bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {renderStep()}
        </motion.div>
      </div>
    </div>
  );
}

export default Onboarding;