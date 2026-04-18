import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

const makeMockAlerts = () => [
  {
    id: 'a1',
    icon: 'clipboard',
    titleEn: 'FIR-2026-00128 Status Update',
    titleUr: 'FIR-2026-00128 حیثیت کی تبدیلی',
    subtitleEn: 'Your complaint is now being actively investigated by the assigned officer.',
    subtitleUr: 'آپ کی شکایت پر متعلقہ افسر تفتیش کر رہے ہیں۔',
    time: '2 hours ago',
    isUnread: true,
  },
  {
    id: 'a2',
    icon: 'bell',
    titleEn: 'Officer Assigned',
    titleUr: 'آفیسر تعینات',
    subtitleEn: 'Inspector Muhammad Asif has been assigned to case FIR-2026-00128.',
    subtitleUr: 'انسپکٹر محمد آصف کو FIR-2026-00128 کیس تفویض کیا گیا۔',
    time: '5 hours ago',
    isUnread: true,
  },
  {
    id: 'a3',
    icon: 'check',
    titleEn: 'FIR-2026-00099 Resolved',
    titleUr: 'FIR-2026-00099 حل ہو گئی',
    subtitleEn: 'Your vehicle accident complaint has been resolved successfully.',
    subtitleUr: 'آپ کی گاڑی حادثے کی شکایت کامیابی سے حل ہو گئی ہے۔',
    time: '1 day ago',
    isUnread: false,
  },
  {
    id: 'a4',
    icon: 'alert',
    titleEn: 'Security Alert',
    titleUr: 'سیکورٹی الرٹ',
    subtitleEn: 'A new login was detected on your account from Karachi, Sindh.',
    subtitleUr: 'آپ کے اکاؤنٹ پر کراچی، سندھ سے نئی لاگ ان کا پتہ چلا۔',
    time: '2 days ago',
    isUnread: false,
  },
  {
    id: 'a5',
    icon: 'refresh',
    titleEn: 'FIR-2026-00072 Under Review',
    titleUr: 'FIR-2026-00072 جائزہ میں',
    subtitleEn: 'Your property dispute case is now under review by the district magistrate.',
    subtitleUr: 'آپ کا جائیداد تنازعہ کیس اب ضلعی مجسٹریٹ کے زیر جائزہ ہے۔',
    time: '3 days ago',
    isUnread: false,
  },
];

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState(makeMockAlerts);

  const unreadCount = alerts.filter(a => a.isUnread).length;

  const markAllRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, isUnread: false })));
  }, []);

  const markRead = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isUnread: false } : a));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, markAllRead, markRead, clearAll }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used inside AlertProvider');
  return ctx;
};
