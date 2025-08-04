import { useContext } from 'react';
import { AthletesContext } from '@/context/AthletesContext';

export const useAthletes = () => {
  const context = useContext(AthletesContext);
  if (!context) {
    throw new Error('useAthletes must be used within AthletesProvider');
  }
  return context;
};