import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import api from '@/utils/api';

const EventContext = createContext();

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    location: '',
    radius: 10,
    startDate: '',
    endDate: '',
    sortBy: 'date:asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const { user } = useAuth();
  const { socket, joinEventRoom, leaveEventRoom } = useSocket();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    // Handle new event creation
    socket.on('newEvent', (event) => {
      setEvents(prev => [event, ...prev]);
      toast.success(`New event created: ${event.name}`);
    });

    // Handle event updates
    socket.on('eventUpdated', (updatedEvent) => {
      setEvents(prev => 
        prev.map(event => event._id === updatedEvent._id ? updatedEvent : event)
      );
      
      if (currentEvent && currentEvent._id === updatedEvent._id) {
        setCurrentEvent(updatedEvent);
      }
      
      toast.success(`Event updated: ${updatedEvent.name}`);
    });

    // Handle event deletion
    socket.on('eventDeleted', (eventId) => {
      setEvents(prev => prev.filter(event => event._id !== eventId));
      
      if (currentEvent && currentEvent._id === eventId) {
        setCurrentEvent(null);
      }
      
      toast.success('Event has been deleted');
    });

    // Handle user joining event
    socket.on('userJoinedEvent', ({ event, user }) => {
      if (currentEvent && currentEvent._id === event._id) {
        setCurrentEvent(event);
        toast.success(`${user.name} has joined the event`);
      }
    });

    // Handle user leaving event
    socket.on('userLeftEvent', ({ event, user }) => {
      if (currentEvent && currentEvent._id === event._id) {
        setCurrentEvent(event);
        toast.success(`${user.name} has left the event`);
      }
    });

    // Handle team creation
    socket.on('teamCreated', ({ event, team }) => {
      if (currentEvent && currentEvent._id === event._id) {
        setCurrentEvent(event);
        toast.success(`New team created: ${team.name}`);
      }
    });

    // Handle new rating
    socket.on('newRating', ({ event, rating }) => {
      if (currentEvent && currentEvent._id === event._id) {
        setCurrentEvent(event);
        toast.success(`New rating received: ${rating.rating}/5`);
      }
    });

    return () => {
      socket.off('newEvent');
      socket.off('eventUpdated');
      socket.off('eventDeleted');
      socket.off('userJoinedEvent');
      socket.off('userLeftEvent');
      socket.off('teamCreated');
      socket.off('newRating');
    };
  }, [socket, currentEvent]);

  // Get all events with filters and pagination
  const getEvents = async (newFilters = null, newPage = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update filters if new ones are provided
      const currentFilters = newFilters || filters;
      if (newFilters) {
        setFilters(newFilters);
      }
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      // Add pagination
      queryParams.append('page', newPage);
      queryParams.append('limit', pagination.limit);
      
      const response = await api.get(`/events?${queryParams.toString()}`);
      
      if (response.data.success) {
        setEvents(response.data.data);
        setPagination(response.data.pagination);
        return response.data.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch events';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Get user's events (created and participated)
  const getUserEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const response = await api.get('/events/user');
      
      if (response.data.success) {
        setUserEvents(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get event by ID
  const getEventById = async (eventId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/events/${eventId}`);
      
      if (response.data) {
        setCurrentEvent(response.data);
        
        // Join event room for real-time updates
        joinEventRoom(eventId);
        
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch event';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const createEvent = async (eventData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Handle FormData for file uploads
      const formData = new FormData();
      
      // Append all event data to FormData
      Object.entries(eventData).forEach(([key, value]) => {
        if (key === 'images') {
          // Handle multiple image files
          for (let i = 0; i < value.length; i++) {
            formData.append('images', value[i]);
          }
        } else if (key === 'location' && typeof value === 'object') {
          // Convert location object to string
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      
      const response = await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        // Add new event to events list
        setEvents(prev => [response.data, ...prev]);
        
        // Add to user events
        setUserEvents(prev => [response.data, ...prev]);
        
        toast.success('Event created successfully');
        return { success: true, event: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create event';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update event
  const updateEvent = async (eventId, eventData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Handle FormData for file uploads
      const formData = new FormData();
      
      // Append all event data to FormData
      Object.entries(eventData).forEach(([key, value]) => {
        if (key === 'images' && Array.isArray(value)) {
          // Handle multiple image files
          for (let i = 0; i < value.length; i++) {
            formData.append('images', value[i]);
          }
        } else if (key === 'location' && typeof value === 'object') {
          // Convert location object to string
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      
      const response = await api.put(`/events/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        // Update event in events list
        setEvents(prev => 
          prev.map(event => event._id === eventId ? response.data : event)
        );
        
        // Update in user events
        setUserEvents(prev => 
          prev.map(event => event._id === eventId ? response.data : event)
        );
        
        // Update current event if it's the one being edited
        if (currentEvent && currentEvent._id === eventId) {
          setCurrentEvent(response.data);
        }
        
        toast.success('Event updated successfully');
        return { success: true, event: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update event';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const deleteEvent = async (eventId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.delete(`/events/${eventId}`);
      
      if (response.data.success) {
        // Remove event from events list
        setEvents(prev => prev.filter(event => event._id !== eventId));
        
        // Remove from user events
        setUserEvents(prev => prev.filter(event => event._id !== eventId));
        
        // Clear current event if it's the one being deleted
        if (currentEvent && currentEvent._id === eventId) {
          setCurrentEvent(null);
          leaveEventRoom(eventId);
        }
        
        toast.success('Event deleted successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete event';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Join event
  const joinEvent = async (eventId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/events/${eventId}/join`);
      
      if (response.data) {
        // Update event in events list
        setEvents(prev => 
          prev.map(event => event._id === eventId ? response.data : event)
        );
        
        // Add to user events if not already there
        setUserEvents(prev => {
          const exists = prev.some(event => event._id === eventId);
          return exists ? prev.map(event => event._id === eventId ? response.data : event) : [...prev, response.data];
        });
        
        // Update current event if it's the one being joined
        if (currentEvent && currentEvent._id === eventId) {
          setCurrentEvent(response.data);
        }
        
        toast.success('Successfully joined event');
        return { success: true, event: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join event';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Leave event
  const leaveEvent = async (eventId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/events/${eventId}/leave`);
      
      if (response.data) {
        // Update event in events list
        setEvents(prev => 
          prev.map(event => event._id === eventId ? response.data : event)
        );
        
        // Update in user events
        setUserEvents(prev => 
          prev.map(event => event._id === eventId ? response.data : event)
        );
        
        // Update current event if it's the one being left
        if (currentEvent && currentEvent._id === eventId) {
          setCurrentEvent(response.data);
        }
        
        toast.success('Successfully left event');
        return { success: true, event: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave event';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Add team to event
  const addTeam = async (eventId, teamData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/events/${eventId}/teams`, teamData);
      
      if (response.data) {
        // Update current event
        if (currentEvent && currentEvent._id === eventId) {
          setCurrentEvent(response.data);
        }
        
        toast.success('Team created successfully');
        return { success: true, event: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create team';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Add rating to event
  const addRating = async (eventId, ratingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/events/${eventId}/ratings`, ratingData);
      
      if (response.data) {
        // Update current event
        if (currentEvent && currentEvent._id === eventId) {
          setCurrentEvent(response.data);
        }
        
        toast.success('Rating submitted successfully');
        return { success: true, event: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit rating';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Send chat message
  const sendMessage = async (eventId, message) => {
    try {
      const response = await api.post(`/events/${eventId}/messages`, { message });
      
      if (response.data) {
        return { success: true, message: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Search events
  const searchEvents = async (searchQuery) => {
    setLoading(true);
    
    try {
      const response = await api.get(`/events/search?q=${searchQuery}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error searching events:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get nearby events
  const getNearbyEvents = async (lat, lng, radius = 10) => {
    setLoading(true);
    
    try {
      const response = await api.get(`/events/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching nearby events:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (currentEvent) {
        leaveEventRoom(currentEvent._id);
      }
    };
  }, [currentEvent, leaveEventRoom]);

  const value = {
    events,
    userEvents,
    currentEvent,
    loading,
    error,
    filters,
    pagination,
    getEvents,
    getUserEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
    addTeam,
    addRating,
    sendMessage,
    searchEvents,
    getNearbyEvents,
    setFilters,
    setPagination
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}