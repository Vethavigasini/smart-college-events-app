import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Event, Registration } from '../data/types';
import { API_URL } from '../constants/Api';

import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  getEvent: (id: string) => Event | undefined;
  registerForEvent: (eventId: string, userId: string, userData: Partial<Registration>) => Promise<{ success: boolean; error?: string }>;
  cancelRegistration: (eventId: string, userId: string) => Promise<void>;
  isUserRegistered: (eventId: string, userId: string) => boolean;
  createEvent: (event: Omit<Event, 'id' | 'registrations' | 'attendees' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  markAttendance: (eventId: string, userId: string) => Promise<void>;
  getFeaturedEvents: () => Event[];
  getUpcomingEvents: () => Event[];
  getEventsByCategory: (category: string) => Event[];
  searchEvents: (query: string) => Event[];
  fetchEventById: (id: string) => Promise<Event | undefined>;
}

const DEFAULT_FALLBACK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'National Tech Symposium 2025',
    description: 'A grand gathering of technology enthusiasts, industry leaders, and innovative minds featuring keynote speeches, paper presentations, and hands-on workshops on AI & Cloud Computing.',
    shortDescription: 'Grand tech gathering featuring AI, Cloud & Innovation.',
    category: 'Technology',
    status: 'upcoming',
    date: '2025-07-15T09:00:00.000Z',
    endDate: '2025-07-16T17:00:00.000Z',
    registrationDeadline: '2025-07-10T23:59:59.000Z',
    venue: 'Main Auditorium, Block A',
    building: 'Block A',
    room: 'Main Hall',
    organizer: 'Department of Computer Science',
    organizerContact: 'techsymposium@college.edu',
    organizerPhone: '+91 98765 43210',
    capacity: 500,
    registeredCount: 342,
    price: 0,
    isFree: true,
    tags: ['AI', 'Cloud', 'Hackathon', 'Innovation'],
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    featured: true,
    rules: [
      'Carry valid college ID card.',
      'Registration confirmation QR required for entry.',
      'Laptops required for hands-on sessions.'
    ],
    schedule: [
      { time: '09:00 AM', title: 'Inauguration & Keynote', speaker: 'Dr. S. Ramanujam' },
      { time: '11:00 AM', title: 'AI & ML Workshop', speaker: 'Prof. Anjali Desai' },
      { time: '02:00 PM', title: 'Paper Presentations', speaker: 'Track Chairs' }
    ],
    registrations: [],
    attendees: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'e2',
    title: 'Annual Cultural Fest - Tarang 2025',
    description: 'Experience 3 days of vibrant music, dance, drama, and artistic performances celebrating college talent across multiple stages.',
    shortDescription: '3-day mega cultural festival with music, dance & arts.',
    category: 'Cultural',
    status: 'upcoming',
    date: '2025-08-20T10:00:00.000Z',
    endDate: '2025-08-22T22:00:00.000Z',
    registrationDeadline: '2025-08-18T23:59:59.000Z',
    venue: 'Open Air Theatre (OAT)',
    building: 'Campus OAT Ground',
    room: 'Main Stage',
    organizer: 'Student Cultural Committee',
    organizerContact: 'tarang@college.edu',
    organizerPhone: '+91 98765 00000',
    capacity: 2000,
    registeredCount: 1250,
    price: 0,
    isFree: true,
    tags: ['Music', 'Dance', 'Drama', 'Cultural'],
    bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    featured: true,
    rules: [
      'College ID card mandatory.',
      'No sharp or prohibited items allowed.'
    ],
    schedule: [
      { time: '10:00 AM', title: 'Battle of the Bands', speaker: 'Guest Judges' },
      { time: '04:00 PM', title: 'Choreography Night', speaker: 'Dance Club' }
    ],
    registrations: [],
    attendees: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
];

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEventsState] = useState<Event[]>(DEFAULT_FALLBACK_EVENTS);
  const { user, updateUser: updateAuthUser } = useAuth();

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setEventsState(data);
        }
      }
    } catch (e) {
      console.warn('Backend server fetch unavailable, operating in local fallback mode:', e);
      // Keep DEFAULT_FALLBACK_EVENTS so app functions offline cleanly
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEventById = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/events/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Fetch event by id fallback', e);
    }
    return events.find(e => e.id === id);
  };

  const getEvent = (id: string) => events.find(e => e.id === id);

  const registerForEvent = async (eventId: string, userId: string, userData: Partial<Registration>) => {
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...userData }),
      });
      if (res.ok) {
        const data = await res.json();
        setEventsState(prev => prev.map(e => e.id === eventId ? (data.event || e) : e));
        if (user) {
          updateAuthUser({ eventsRegistered: [...user.eventsRegistered, eventId] });
        }
        return { success: true };
      }
    } catch (error) {
      // Offline fallback handling
    }

    // Local state fallback registration update
    setEventsState(prev => prev.map(e => {
      if (e.id === eventId) {
        const newReg: Registration = {
          id: `reg_${Date.now()}`,
          eventId,
          userId,
          userName: userData.userName || user?.name || 'Student',
          userEmail: userData.userEmail || user?.email || 'student@college.edu',
          userRole: userData.userRole || 'STUDENT',
          rollNumber: userData.rollNumber || user?.rollNumber || '',
          phone: userData.phone || user?.phone || '',
          registeredAt: new Date().toISOString(),
          status: 'confirmed'
        };
        return {
          ...e,
          registrations: [...e.registrations, newReg],
          registeredCount: e.registeredCount + 1
        };
      }
      return e;
    }));

    if (user && !user.eventsRegistered.includes(eventId)) {
      updateAuthUser({ eventsRegistered: [...user.eventsRegistered, eventId] });
    }

    return { success: true };
  };

  const cancelRegistration = async (eventId: string, userId: string) => {
    try {
      await fetch(`${API_URL}/events/${eventId}/register/${userId}`, { method: 'DELETE' });
    } catch (error) {
      // Offline fallback
    }

    setEventsState(prev => prev.map(e =>
      e.id === eventId
        ? {
            ...e,
            registrations: e.registrations.filter(r => r.userId !== userId),
            registeredCount: Math.max(0, e.registeredCount - 1),
          }
        : e
    ));

    if (user) {
      updateAuthUser({ eventsRegistered: user.eventsRegistered.filter(id => id !== eventId) });
    }
  };

  const isUserRegistered = (eventId: string, userId: string) => {
    const event = events.find(e => e.id === eventId);
    return !!event?.registrations.find(r => r.userId === userId);
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'registrations' | 'attendees' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        const newEvent = await res.json();
        setEventsState(prev => [newEvent, ...prev]);
        return;
      }
    } catch (error) {
      // Offline fallback
    }

    const localNewEvent: Event = {
      ...eventData,
      id: `evt_${Date.now()}`,
      registrations: [],
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEventsState(prev => [localNewEvent, ...prev]);
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // Offline fallback
    }

    setEventsState(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = async (id: string) => {
    try {
      await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
    } catch (error) {
      // Offline fallback
    }

    setEventsState(prev => prev.filter(e => e.id !== id));
  };

  const markAttendance = async (eventId: string, userId: string) => {
    try {
      await fetch(`${API_URL}/events/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      // Offline fallback
    }

    setEventsState(prev => prev.map(e => {
      if (e.id === eventId) {
        const attendees = e.attendees || [];
        return {
          ...e,
          attendees: attendees.includes(userId) ? attendees : [...attendees, userId]
        };
      }
      return e;
    }));
  };

  const getFeaturedEvents = () => events.filter(e => e.featured && e.status !== 'completed');
  const getUpcomingEvents = () => events.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const getEventsByCategory = (category: string) => events.filter(e => e.category === category);
  const searchEvents = (query: string) => {
    const q = query.toLowerCase();
    return events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
  };

  return (
    <EventContext.Provider value={{ events, getEvent, registerForEvent, cancelRegistration, isUserRegistered, createEvent, updateEvent, deleteEvent, markAttendance, getFeaturedEvents, getUpcomingEvents, getEventsByCategory, searchEvents, fetchEventById }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvents must be used within EventProvider');
  return ctx;
}
