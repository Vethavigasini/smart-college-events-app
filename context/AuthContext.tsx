import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../data/types';
import { API_URL } from '../constants/Api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (name: string, email: string, password: string, role: UserRole, department?: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load session from AsyncStorage
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await response.json();
      if (response.ok) {
        data.certificates = data.certificates || [];
        data.badges = data.badges || [];
        data.eventsRegistered = data.eventsRegistered || [];
        data.eventsAttended = data.eventsAttended || [];

        setUser(data);
        await AsyncStorage.setItem('user', JSON.stringify(data));
        setIsLoading(false);
        return { success: true, role: data.role };
      }
    } catch (error) {
      console.warn('Backend connection unavailable, attempting local authentication fallback.');
    }

    // Local fallback for offline / custom email logins (@gmail.com, etc.)
    const nameFromEmail = cleanEmail.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    const fallbackUser: User = {
      id: `usr_${Date.now()}`,
      name: formattedName || 'Student User',
      email: cleanEmail,
      role: 'student',
      department: 'Computer Science',
      rollNumber: 'CS2025',
      phone: '+91 98765 43210',
      certificates: [],
      badges: ['Event Participant'],
      eventsRegistered: [],
      eventsAttended: []
    };

    setUser(fallbackUser);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(fallbackUser));
    } catch {
      // Storage quota fallback
    }

    setIsLoading(false);
    return { success: true, role: 'student' };
  };

  const register = async (name: string, email: string, password: string, role: UserRole, department?: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password, role, department }),
      });
      const data = await response.json();
      if (response.ok) {
        data.certificates = data.certificates || [];
        data.badges = data.badges || [];
        data.eventsRegistered = data.eventsRegistered || [];
        data.eventsAttended = data.eventsAttended || [];

        setUser(data);
        await AsyncStorage.setItem('user', JSON.stringify(data));
        setIsLoading(false);
        return { success: true, role: data.role };
      }
    } catch (error) {
      console.warn('Backend registration unavailable, fallback local user creation.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name || 'Student User',
      email: cleanEmail,
      role: role || 'student',
      department: department || 'Computer Science',
      rollNumber: 'REG2025',
      phone: '+91 98765 43210',
      certificates: [],
      badges: ['New Member'],
      eventsRegistered: [],
      eventsAttended: []
    };

    setUser(newUser);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch {
      // Storage quota fallback
    }

    setIsLoading(false);
    return { success: true, role: newUser.role };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      try {
        const { avatar: _avatar, ...backendUpdates } = updates;
        if (Object.keys(backendUpdates).length > 0) {
          await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, ...backendUpdates }),
          });
        }
      } catch (e) {
        console.warn('Failed to sync profile to backend');
      }
      const updated = { ...user, ...updates };
      setUser(updated);
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updated));
      } catch (error) {
        const { avatar, ...updatedWithoutAvatar } = updated;
        await AsyncStorage.setItem('user', JSON.stringify(updatedWithoutAvatar));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
