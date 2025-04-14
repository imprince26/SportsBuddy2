import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from './SocketContext';
import * as api from '@/utils/api';

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const { socket, joinEventRoom } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('newEvent', (event) => {
        setEvents((prev) => [event, ...prev]);
        toast({
          title: 'New Event',
          description: `${event.name} has been created!`,
        });
      });

      socket.on('eventUpdated', (updatedEvent) => {
        setEvents((prev) =>
          prev.map((event) => (event._id === updatedEvent._id ? updatedEvent : event))
        );
      });

      socket.on('eventDeleted', (eventId) => {
        setEvents((prev) => prev.filter((event) => event._id !== eventId));
        toast({
          title: 'Event Deleted',
          description: 'An event has been deleted.',
        });
      });

      socket.on('userJoinedEvent', (data) => {
        setEvents((prev) =>
          prev.map((event) =>
            event._id === data.event._id ? data.event : event
          )
        );
      });

      socket.on('userLeftEvent', (data) => {
        setEvents((prev) =>
          prev.map((event) =>
            event._id === data.event._id ? data.event : event
          )
        );
      });

      socket.on('teamCreated', (data) => {
        setEvents((prev) =>
          prev.map((event) =>
            event._id === data.event._id ? data.event : event
          )
        );
      });

      socket.on('newRating', (data) => {
        setEvents((prev) =>
          prev.map((event) =>
            event._id === data.event._id ? data.event : event
          )
        );
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
    }
  }, [socket, toast]);

  const fetchEvents = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const response = await api.get('/events', { params: filters });
      setEvents(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching events');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch events',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createEvent = async (eventData, images) => {
    try {
      setLoading(true);
      let imageUrls = [];
      if (images?.length > 0) {
        const formData = new FormData();
        images.forEach((image) => formData.append('eventImages', image));
        const uploadRes = await api.post('/upload/event', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrls = uploadRes.data.fileUrls.map((file) => ({
          url: file.url,
          public_id: file.public_id,
        }));
      }

      const response = await api.post('/events', {
        ...eventData,
        images: imageUrls,
      });

      setEvents((prev) => [response.data, ...prev]);
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      return response.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create event',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId, eventData, newImages) => {
    try {
      setLoading(true);
      let imageUrls = eventData.images || [];
      if (newImages?.length > 0) {
        const formData = new FormData();
        newImages.forEach((image) => formData.append('eventImages', image));
        const uploadRes = await api.post('/upload/event', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrls = [
          ...imageUrls,
          ...uploadRes.data.fileUrls.map((file) => ({
            url: file.url,
            public_id: file.public_id,
          })),
        ];
      }

      const response = await api.put(`/events/${eventId}`, {
        ...eventData,
        images: imageUrls,
      });

      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? response.data : event))
      );
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      return response.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update event',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete event',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId) => {
    try {
      setLoading(true);
      const response = await api.post(`/events/${eventId}/join`);
      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? response.data : event))
      );
      joinEventRoom(eventId); // Join socket room
      toast({
        title: 'Success',
        description: 'Successfully joined the event',
      });
      return response.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to join event',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const leaveEvent = async (eventId) => {
    try {
      setLoading(true);
      const response = await api.post(`/events/${eventId}/leave`);
      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? response.data : event))
      );
      toast({
        title: 'Success',
        description: 'Successfully left the event',
      });
      return response.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to leave event',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (eventId, teamData) => {
    try {
      setLoading(true);
      const response = await api.post(`/events/${eventId}/teams`, teamData);
      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? response.data : event))
      );
      toast({
        title: 'Success',
        description: 'Team added successfully',
      });
      return response.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add team',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addRating = async (eventId, ratingData) => {
    try {
      setLoading(true);
      const response = await api.post(`/events/${eventId}/ratings`, ratingData);
      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? response.data : event))
      );
      toast({
        title: 'Success',
        description: 'Rating added successfully',
      });
      return response.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add rating',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (eventId, message) => {
    try {
      const response = await api.post(`/events/${eventId}/chat`, { message });
      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId
            ? { ...event, chat: [...event.chat, response.data] }
            : event
        )
      );
      return response.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to send message',
      });
      throw err;
    }
  };

  const getUserEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/user');
      return response.data.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to fetch user events',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (eventId) => {
    try {
      setLoading(true);
      const response = await api.put(`/events/${eventId}/approve`);
      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? response.data : event))
      );
      toast({
        title: 'Success',
        description: 'Event approved successfully',
      });
      return response.data;
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to approve event',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
    addTeam,
    addRating,
    sendMessage,
    getUserEvents,
    approveEvent,
    getEventById: useCallback(
      async (id) => {
        try {
          const response = await api.get(`/events/${id}`);
          return response.data;
        } catch (err) {
          throw new Error(err.response?.data?.message || 'Failed to fetch event');
        }
      },
      []
    ),
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};