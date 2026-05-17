import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api';
import { useUser } from './UserStore';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const { profile } = useUser(); // to only fetch if logged in

  const fetchAlerts = useCallback(async () => {
    if (!profile) return;
    try {
      const res = await fetchWithAuth('/api/v1/user/notifications?page=1&page_size=100');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [profile]);

  useEffect(() => {
    fetchAlerts();
    // Poll every 10 seconds to simulate real-time notifications for Phase 3
    const intId = setInterval(fetchAlerts, 10000);
    return () => clearInterval(intId);
  }, [fetchAlerts]);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const markAllRead = useCallback(async () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    try {
      const res = await fetchWithAuth('/api/v1/user/notifications/read-all', { method: 'PUT' });
      if (!res.ok) fetchAlerts(); // Revert on failure
    } catch (err) {
      fetchAlerts(); // Revert on failure
    }
  }, [fetchAlerts]);

  const markRead = useCallback(async (id) => {
    const alert = alerts.find(a => a.id === id);
    if (alert && alert.is_read) return;
    
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    try {
      const res = await fetchWithAuth(`/api/v1/user/notifications/${id}/read`, { method: 'PUT' });
      if (!res.ok) {
        // Revert on failure
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: false } : a));
      }
    } catch (err) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: false } : a));
    }
  }, [alerts]);

  const clearAll = useCallback(() => {
    // Backend doesn't support delete right now, so we just clear locally for UI
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, markAllRead, markRead, clearAll, refreshAlerts: fetchAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used inside AlertProvider');
  return ctx;
};
