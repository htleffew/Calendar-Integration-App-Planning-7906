import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useScheduling } from '../context/SchedulingContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiClock, FiGlobe, FiMail, FiSmartphone, FiVideo, FiCalendar, FiLink } = FiIcons;

function Settings() {
  const { settings, dispatch, connectGoogleCalendar } = useScheduling();
  const [activeTab, setActiveTab] = useState('general');
  const [isConnecting, setIsConnecting] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: FiClock },
    { id: 'calendar', name: 'Calendar', icon: FiCalendar },
    { id: 'notifications', name: 'Notifications', icon: FiMail },
    { id: 'integrations', name: 'Integrations', icon: FiLink }
  ];

  const handleSettingChange = (key, value) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { [key]: value }
    });
  };

  const handleNestedSettingChange = (parent, key, value) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: {
        [parent]: {
          ...settings[parent],
          [key]: value
        }
      }
    });
  };

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      await connectGoogleCalendar();
    } catch (error) {
      console.error('Failed to connect calendar:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Default Timezone
        </label>
        <select
          value={settings.timezone}
          onChange={(e) => handleSettingChange('timezone', e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="UTC">Coordinated Universal Time (UTC)</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">
          This timezone will be used for all meeting times and availability windows.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Default Meeting Platform
        </label>
        <select
          value={settings.defaultMeetingPlatform}
          onChange={(e) => handleSettingChange('defaultMeetingPlatform', e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="google-meet">Google Meet</option>
          <option value="zoom">Zoom</option>
          <option value="teams">Microsoft Teams</option>
          <option value="phone">Phone Call</option>
          <option value="in-person">In Person</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Date Format
        </label>
        <select
          value={settings.dateFormat || 'MM/dd/yyyy'}
          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
          <option value="dd/MM/yyyy">DD/MM/YYYY (EU)</option>
          <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Time Format
        </label>
        <select
          value={settings.timeFormat || '12h'}
          onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="12h">12-hour (AM/PM)</option>
          <option value="24h">24-hour</option>
        </select>
      </div>
    </div>
  );

  const renderCalendarSettings = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              settings.googleCalendarConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <SafeIcon 
                icon={settings.googleCalendarConnected ? FiCheck : FiCalendar} 
                className={`w-6 h-6 ${
                  settings.googleCalendarConnected ? 'text-green-600' : 'text-gray-400'
                }`} 
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Google Calendar</h3>
              <p className="text-sm text-gray-500">
                {settings.googleCalendarConnected 
                  ? 'Connected and syncing' 
                  : 'Connect to sync meetings with your Google Calendar'
                }
              </p>
            </div>
          </div>
          
          {settings.googleCalendarConnected ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSettingChange('googleCalendarConnected', false)}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
              <span>Disconnect</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConnectCalendar}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiCalendar} className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
            </motion.button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Calendar Sync Options
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.syncToCalendar !== false}
              onChange={(e) => handleSettingChange('syncToCalendar', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Automatically create calendar events for new bookings
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.checkConflicts !== false}
              onChange={(e) => handleSettingChange('checkConflicts', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Check for conflicts with existing calendar events
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.updateAvailability !== false}
              onChange={(e) => handleSettingChange('updateAvailability', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Update availability based on calendar events
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">New booking confirmations</span>
            <input
              type="checkbox"
              checked={settings.notifications?.email !== false}
              onChange={(e) => handleNestedSettingChange('notifications', 'email', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Booking cancellations</span>
            <input
              type="checkbox"
              checked={settings.notifications?.cancellations !== false}
              onChange={(e) => handleNestedSettingChange('notifications', 'cancellations', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Meeting reminders (24h before)</span>
            <input
              type="checkbox"
              checked={settings.notifications?.reminders24h !== false}
              onChange={(e) => handleNestedSettingChange('notifications', 'reminders24h', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Meeting reminders (1h before)</span>
            <input
              type="checkbox"
              checked={settings.notifications?.reminders1h !== false}
              onChange={(e) => handleNestedSettingChange('notifications', 'reminders1h', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Enable SMS notifications</span>
            <input
              type="checkbox"
              checked={settings.notifications?.sms === true}
              onChange={(e) => handleNestedSettingChange('notifications', 'sms', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
          {settings.notifications?.sms && (
            <div className="ml-4 space-y-2">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Booking confirmations</span>
                <input
                  type="checkbox"
                  checked={settings.notifications?.smsBookings !== false}
                  onChange={(e) => handleNestedSettingChange('notifications', 'smsBookings', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Meeting reminders</span>
                <input
                  type="checkbox"
                  checked={settings.notifications?.smsReminders !== false}
                  onChange={(e) => handleNestedSettingChange('notifications', 'smsReminders', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Meet */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon icon={FiVideo} className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Google Meet</h3>
              <p className="text-sm text-gray-500">Video conferencing integration</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">Connected</span>
            <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {/* Zoom */}
        <div className="border border-gray-200 rounded-lg p-6 opacity-60">
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon icon={FiVideo} className="w-8 h-8 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Zoom</h3>
              <p className="text-sm text-gray-500">Video conferencing integration</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Connect
          </motion.button>
        </div>

        {/* Microsoft Teams */}
        <div className="border border-gray-200 rounded-lg p-6 opacity-60">
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon icon={FiVideo} className="w-8 h-8 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Microsoft Teams</h3>
              <p className="text-sm text-gray-500">Video conferencing integration</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Connect
          </motion.button>
        </div>

        {/* Slack */}
        <div className="border border-gray-200 rounded-lg p-6 opacity-60">
          <div className="flex items-center space-x-3 mb-4">
            <SafeIcon icon={FiMail} className="w-8 h-8 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Slack</h3>
              <p className="text-sm text-gray-500">Team communication integration</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Connect
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'calendar':
        return renderCalendarSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'integrations':
        return renderIntegrationSettings();
      default:
        return renderGeneralSettings();
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your scheduling preferences and integrations.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <SafeIcon icon={tab.icon} className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Settings;