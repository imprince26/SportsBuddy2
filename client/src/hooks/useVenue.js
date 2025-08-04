import { useContext } from 'react';
import { VenueContext } from '@/context/VenueContext';

export const useVenue = () => {
  const context = useContext(VenueContext);
  if (!context) {
    throw new Error('useVenue must be used within VenueProvider');
  }
  return context;
};