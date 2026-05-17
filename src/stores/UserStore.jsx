import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/v1/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveEdits = useCallback(async (updates) => {
    try {
      const res = await fetchWithAuth('/api/v1/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        return { success: true };
      }
      const errData = await res.json();
      return { success: false, error: errData.detail || 'Failed to update profile' };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetchWithAuth('/api/v1/user/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      localStorage.removeItem('sach_access_token');
      localStorage.removeItem('sach_refresh_token');
      setProfile(null);
    }
  }, []);

  // Fetch on mount if token exists
  useEffect(() => {
    if (localStorage.getItem('sach_access_token')) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  return (
    <UserContext.Provider value={{ profile, loading, saveEdits, logout, fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
};
