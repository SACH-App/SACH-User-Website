import React, { createContext, useContext, useState, useCallback } from 'react';
import { generateBlockchainHash } from '../theme';

const FirContext = createContext();

const makeMockFirs = () => [
  {
    id: 'FIR-2026-00128',
    title: 'Theft / Robbery',
    date: '12 Jul 2026',
    status: 'Investigating',
    address: 'Block 14, F.B. Area',
    city: 'Karachi',
    district: 'Karachi Central',
    description: 'Motorcycle snatched at gunpoint near F.B. Area market. Two armed suspects on another bike intercepted me near the market alley.',
    incidentDate: '10 Jul 2026, 09:35 PM',
    category: 'Theft / Robbery',
    blockchainHash: generateBlockchainHash(),
  },
  {
    id: 'FIR-2026-00127',
    title: 'Cybercrime',
    date: '05 Jul 2026',
    status: 'Pending',
    address: 'Gulshan-e-Iqbal Block 3',
    city: 'Karachi',
    district: 'Karachi East',
    description: 'Fraudulent transaction of PKR 35,000 from my debit card through a phishing link received via SMS.',
    incidentDate: '04 Jul 2026, 02:10 PM',
    category: 'Fraud / Scam',
    blockchainHash: generateBlockchainHash(),
  },
  {
    id: 'FIR-2026-00099',
    title: 'Vehicle Accident',
    date: '28 Jun 2026',
    status: 'Resolved',
    address: 'Shahrah-e-Faisal',
    city: 'Karachi',
    district: 'Karachi South',
    description: 'Hit and run incident on Shahrah-e-Faisal near PIDC. The offending vehicle was a white Toyota Corolla.',
    incidentDate: '27 Jun 2026, 06:45 PM',
    category: 'Vehicle Accident',
    blockchainHash: generateBlockchainHash(),
  },
  {
    id: 'FIR-2026-00072',
    title: 'Property Dispute',
    date: '15 Jun 2026',
    status: 'Under Review',
    address: 'Model Colony, Malir',
    city: 'Karachi',
    district: 'Malir',
    description: 'Unauthorized construction on a residential plot owned by me in Model Colony.',
    incidentDate: '14 Jun 2026, 11:00 AM',
    category: 'Property Dispute',
    blockchainHash: generateBlockchainHash(),
  },
  {
    id: 'FIR-2026-00041',
    title: 'Missing Person',
    date: '01 Jun 2026',
    status: 'Closed',
    address: 'Orangi Town',
    city: 'Karachi',
    district: 'Karachi West',
    description: 'My cousin went missing from Orangi Town area after his workplace shift. He was found safe later at a relative\'s house.',
    incidentDate: '31 May 2026, 08:00 PM',
    category: 'Missing Person',
    blockchainHash: generateBlockchainHash(),
  },
];

export const FirProvider = ({ children }) => {
  const [firs, setFirs] = useState(makeMockFirs);

  const addFir = useCallback((fir) => {
    setFirs(prev => [fir, ...prev]);
  }, []);

  const getFirById = useCallback((id) => {
    return firs.find(f => f.id === id);
  }, [firs]);

  const stats = {
    total: firs.length,
    pending: firs.filter(f => f.status === 'Pending').length,
    investigating: firs.filter(f => f.status === 'Investigating').length,
    resolved: firs.filter(f => f.status === 'Resolved').length,
    underReview: firs.filter(f => f.status === 'Under Review').length,
    closed: firs.filter(f => f.status === 'Closed').length,
  };

  return (
    <FirContext.Provider value={{ firs, addFir, getFirById, getFir: getFirById, stats }}>
      {children}
    </FirContext.Provider>
  );
};

export const useFirs = () => {
  const ctx = useContext(FirContext);
  if (!ctx) throw new Error('useFirs must be used inside FirProvider');
  return ctx;
};
