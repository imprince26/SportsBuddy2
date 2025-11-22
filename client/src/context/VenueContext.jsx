import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

const VenueContext = createContext();

export const VenueProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  // State management
  const [venues, setVenues] = useState([]);
  const [currentVenue, setCurrentVenue] = useState(null);
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [favoriteVenues, setFavoriteVenues] = useState([]);
  const [venueBookings, setVenueBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false,
    limit: 12
  });
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    sport: 'all',
    capacity: '',
    priceRange: '',
    verified: false,
    sortBy: 'createdAt:desc'
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleVenueBooking = (data) => {
      toast.success(`Venue "${data.venueName}" has been booked!`);
      // Update venue availability if it's the current venue
      if (currentVenue?._id === data.venueId) {
        setCurrentVenue(prev => ({
          ...prev,
          totalBookings: prev.totalBookings + 1
        }));
      }
    };

    const handleVenueReview = (data) => {
      if (currentVenue?._id === data.venueId) {
        setCurrentVenue(prev => ({
          ...prev,
          totalReviews: prev.totalReviews + 1,
          averageRating: data.newAverageRating
        }));
      }
    };

    // Socket listeners
    socket.on('venueBooked', handleVenueBooking);
    socket.on('venueReviewed', handleVenueReview);

    return () => {
      socket.off('venueBooked');
      socket.off('venueReviewed');
    };
  }, [socket, currentVenue]);

  // Get all venues with filters and pagination
  const getVenues = async (newFilters = null, newPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const currentFilters = newFilters || filters;
      if (newFilters) {
        setFilters(newFilters);
      }

      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          queryParams.append(key, value);
        }
      });

      queryParams.append('page', newPage);
      queryParams.append('limit', pagination.limit);

      const response = await api.get(`/venues?${queryParams}`);

      if (response.data.success) {
        if (newPage === 1) {
          setVenues(response.data.data);
        } else {
          setVenues(prev => [...prev, ...response.data.data]);
        }
        setPagination(response.data.pagination);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch venues';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get single venue by ID
  const getVenueById = async (venueId) => {
    setLoading(true);

    try {
      const response = await api.get(`/venues/${venueId}`);

      if (response.data.success) {
        setCurrentVenue(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch venue';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create new venue (admin only)
  const createVenue = async (venueData) => {
    setLoading(true);
    const toastId = toast.loading('Creating venue...');

    try {
      const formData = new FormData();
      
      Object.entries(venueData).forEach(([key, value]) => {
        if (key === 'images' && value) {
          Array.from(value).forEach((file) => {
            formData.append('images', file);
          });
        } else if (key === 'amenities' && Array.isArray(value)) {
          // Amenities are already in the correct format {name, available}
          formData.append(key, JSON.stringify(value));
        } else if (key === 'pricing' && typeof value === 'object') {
          // Pricing object with hourlyRate, dayRate, currency
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      const response = await api.post('/venues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setVenues(prev => [response.data.data, ...prev]);
        toast.success('Venue created successfully!', { id: toastId });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create venue';
      toast.error(message, { id: toastId });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update venue (admin/owner only)
  const updateVenue = async (venueId, updateData) => {
    setLoading(true);
    const toastId = toast.loading('Updating venue...');

    try {
      const formData = new FormData();
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'images' && value) {
          Array.from(value).forEach((file) => {
            formData.append('images', file);
          });
        } else if (key === 'amenities' && Array.isArray(value)) {
          // Amenities are already in the correct format {name, available}
          formData.append(key, JSON.stringify(value));
        } else if (key === 'pricing' && typeof value === 'object') {
          // Pricing object with hourlyRate, dayRate, currency
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      const response = await api.put(`/venues/${venueId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const updatedVenue = response.data.data;
        setVenues(prev => prev.map(venue => 
          venue._id === venueId ? updatedVenue : venue
        ));
        if (currentVenue?._id === venueId) {
          setCurrentVenue(updatedVenue);
        }
        toast.success('Venue updated successfully!', { id: toastId });
        return { success: true, data: updatedVenue };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update venue';
      toast.error(message, { id: toastId });
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Delete venue (admin only)
  const deleteVenue = async (venueId) => {
    const toastId = toast.loading('Deleting venue...');

    try {
      const response = await api.delete(`/venues/${venueId}`);

      if (response.data.success) {
        setVenues(prev => prev.filter(venue => venue._id !== venueId));
        if (currentVenue?._id === venueId) {
          setCurrentVenue(null);
        }
        toast.success('Venue deleted successfully!', { id: toastId });
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete venue';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Get nearby venues
  const getNearbyVenues = async (lat, lng, radius = 10) => {
    setLoading(true);

    try {
      const response = await api.get(`/venues/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);

      if (response.data.success) {
        setNearbyVenues(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch nearby venues';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search venues
  const searchVenues = async (query, limit = 20) => {
    if (!query || query.trim().length < 2) {
      toast.error('Search query must be at least 2 characters');
      return [];
    }

    setLoading(true);

    try {
      const response = await api.get(`/venues/search?q=${encodeURIComponent(query)}&limit=${limit}`);

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search venues';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get venues by category
  const getVenuesByCategory = async (category, page = 1, limit = 20) => {
    setLoading(true);

    try {
      const response = await api.get(`/venues/category/${category}?page=${page}&limit=${limit}`);

      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch venues by category';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add venue review
  const addVenueReview = async (venueId, rating, review) => {
    const toastId = toast.loading('Adding review...');

    try {
      const response = await api.post(`/venues/${venueId}/reviews`, {
        rating,
        review
      });

      if (response.data.success) {
        // Invalidate cache by refetching the venue
        await getVenueById(venueId);
        toast.success('Review added successfully!', { id: toastId });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add review';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Get venue reviews
  const getVenueReviews = async (venueId, page = 1, limit = 10, sortBy = 'date:desc') => {
    setLoading(true);

    try {
      const response = await api.get(`/venues/${venueId}/reviews?page=${page}&limit=${limit}&sortBy=${sortBy}`);

      if (response.data.success) {
        return {
          reviews: response.data.data,
          stats: response.data.stats,
          pagination: response.data.pagination
        };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch reviews';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Book venue
  const bookVenue = async (venueId, bookingData) => {
    const toastId = toast.loading('Booking venue...');

    try {
      const response = await api.post(`/venues/${venueId}/book`, bookingData);

      if (response.data.success) {
        toast.success('Venue booked successfully!', { id: toastId });
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book venue';
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  };

  // Get venue bookings (owner/admin only)
  const getVenueBookings = async (venueId, status = 'all', startDate = null, endDate = null) => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();
      if (status !== 'all') queryParams.append('status', status);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await api.get(`/venues/${venueId}/bookings?${queryParams}`);

      if (response.data.success) {
        setVenueBookings(response.data.data);
        return {
          bookings: response.data.data,
          stats: response.data.stats
        };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch bookings';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Toggle venue favorite
  const toggleVenueFavorite = async (venueId) => {
    try {
      const response = await api.post(`/venues/${venueId}/favorite`);

      if (response.data.success) {
        const { isFavorite } = response.data;
        
        if (isFavorite) {
          setFavoriteVenues(prev => [...prev, venueId]);
          toast.success('Added to favorites');
        } else {
          setFavoriteVenues(prev => prev.filter(id => id !== venueId));
          toast.success('Removed from favorites');
        }

        return { success: true, isFavorite };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update favorite';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Clear current venue
  const clearCurrentVenue = () => {
    setCurrentVenue(null);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      city: '',
      sport: 'all',
      capacity: '',
      priceRange: '',
      verified: false,
      sortBy: 'createdAt:desc'
    });
  };

  const value = {
    // State
    venues,
    currentVenue,
    nearbyVenues,
    favoriteVenues,
    venueBookings,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    getVenues,
    getVenueById,
    createVenue,
    updateVenue,
    deleteVenue,
    getNearbyVenues,
    searchVenues,
    getVenuesByCategory,
    addVenueReview,
    getVenueReviews,
    bookVenue,
    getVenueBookings,
    toggleVenueFavorite,
    clearCurrentVenue,
    resetFilters,
    setFilters
  };

  return (
    <VenueContext.Provider value={value}>
      {children}
    </VenueContext.Provider>
  );
};

export { VenueContext };