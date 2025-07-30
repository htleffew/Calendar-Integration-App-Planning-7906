import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SchedulingContext = createContext();

const initialState = {
  meetingTypes: [
    {
      id: '1',
      name: 'Quick Chat',
      duration: 15,
      description: 'Brief 15-minute conversation',
      color: '#3B82F6',
      meetingPlatform: 'google-meet',
      bufferTime: { before: 5, after: 5 },
      advanceNotice: 60,
      maxAdvanceBooking: 30,
      active: true,
      questions: []
    },
    {
      id: '2',
      name: 'Strategy Session',
      duration: 60,
      description: 'Deep dive strategy discussion',
      color: '#10B981',
      meetingPlatform: 'google-meet',
      bufferTime: { before: 10, after: 10 },
      advanceNotice: 120,
      maxAdvanceBooking: 60,
      active: true,
      questions: [
        {
          id: '1',
          question: 'What would you like to discuss?',
          required: true,
          type: 'textarea'
        }
      ]
    },
    {
      id: '3',
      name: 'Phone Consultation',
      duration: 30,
      description: 'Quick telephone consultation',
      color: '#F59E0B',
      meetingPlatform: 'phone',
      bufferTime: { before: 5, after: 5 },
      advanceNotice: 60,
      maxAdvanceBooking: 30,
      active: true,
      questions: [
        {
          id: '1',
          question: 'What topics would you like to cover?',
          required: true,
          type: 'textarea'
        }
      ]
    }
  ],
  rules: [
    {
      id: '1',
      name: 'Business Hours',
      type: 'availability',
      active: true,
      conditions: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeRange: { start: '09:00', end: '17:00' },
        timezone: 'America/New_York'
      }
    },
    {
      id: '2',
      name: 'No Back-to-Back Meetings',
      type: 'buffer',
      active: true,
      conditions: {
        minBuffer: 15,
        applyToMeetingTypes: ['all']
      }
    }
  ],
  bookings: [],
  settings: {
    timezone: 'America/New_York',
    googleCalendarConnected: false,
    defaultMeetingPlatform: 'google-meet',
    notifications: {
      email: true,
      sms: false
    }
  }
};

function schedulingReducer(state, action) {
  switch (action.type) {
    case 'ADD_MEETING_TYPE':
      return {
        ...state,
        meetingTypes: [...state.meetingTypes, { ...action.payload, id: uuidv4() }]
      };
    case 'UPDATE_MEETING_TYPE':
      return {
        ...state,
        meetingTypes: state.meetingTypes.map(mt =>
          mt.id === action.payload.id ? { ...mt, ...action.payload } : mt
        )
      };
    case 'DELETE_MEETING_TYPE':
      return {
        ...state,
        meetingTypes: state.meetingTypes.filter(mt => mt.id !== action.payload)
      };
    case 'ADD_RULE':
      return {
        ...state,
        rules: [...state.rules, { ...action.payload, id: uuidv4() }]
      };
    case 'UPDATE_RULE':
      return {
        ...state,
        rules: state.rules.map(rule =>
          rule.id === action.payload.id ? { ...rule, ...action.payload } : rule
        )
      };
    case 'DELETE_RULE':
      return {
        ...state,
        rules: state.rules.filter(rule => rule.id !== action.payload)
      };
    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [...state.bookings, { ...action.payload, id: uuidv4() }]
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    default:
      return state;
  }
}

export function SchedulingProvider({ children }) {
  const [state, dispatch] = useReducer(schedulingReducer, initialState);

  // Google Calendar Integration Functions
  const connectGoogleCalendar = async () => {
    try {
      // Simulate Google Calendar OAuth flow
      console.log('Connecting to Google Calendar...');
      dispatch({ type: 'UPDATE_SETTINGS', payload: { googleCalendarConnected: true } });
      return true;
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
      return false;
    }
  };

  const createGoogleMeetLink = async (booking) => {
    try {
      // Simulate Google Meet link creation
      const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;
      return meetLink;
    } catch (error) {
      console.error('Failed to create Google Meet link:', error);
      return null;
    }
  };

  const checkAvailability = (date, duration, meetingTypeId) => {
    // Complex availability checking logic
    const rules = state.rules.filter(rule => rule.active);
    const meetingType = state.meetingTypes.find(mt => mt.id === meetingTypeId);

    // Check business hours
    const businessHoursRule = rules.find(rule => rule.type === 'availability');
    if (businessHoursRule) {
      const dayOfWeek = date.toLocaleLowerCase();
      if (!businessHoursRule.conditions.days.includes(dayOfWeek)) {
        return false;
      }
    }

    // Check buffer times
    const bufferRule = rules.find(rule => rule.type === 'buffer');
    if (bufferRule && meetingType) {
      // Check for conflicts with existing bookings
      const conflicts = state.bookings.filter(booking => {
        const bookingDate = new Date(booking.startTime);
        const timeDiff = Math.abs(date - bookingDate) / (1000 * 60); // minutes
        return timeDiff < (bufferRule.conditions.minBuffer + duration);
      });

      if (conflicts.length > 0) {
        return false;
      }
    }

    return true;
  };

  const value = {
    ...state,
    dispatch,
    connectGoogleCalendar,
    createGoogleMeetLink,
    checkAvailability
  };

  return (
    <SchedulingContext.Provider value={value}>
      {children}
    </SchedulingContext.Provider>
  );
}

export function useScheduling() {
  const context = useContext(SchedulingContext);
  if (!context) {
    throw new Error('useScheduling must be used within a SchedulingProvider');
  }
  return context;
}