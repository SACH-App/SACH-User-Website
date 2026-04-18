import React, { createContext, useContext, useState, useCallback } from 'react';
import { defaultProfile } from '../theme';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState({ ...defaultProfile });

  const saveEdits = useCallback(({ altPhone, email, address, district, city }) => {
    setProfile(prev => ({
      ...prev,
      altPhone: altPhone?.trim() || '',
      email: email?.trim() || '',
      address: address?.trim() || '',
      district: district || '',
      city: city?.trim() || '',
    }));
  }, []);

  return (
    <UserContext.Provider value={{ profile, saveEdits }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
};
