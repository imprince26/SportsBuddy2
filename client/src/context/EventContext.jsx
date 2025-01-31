import { createContext, useState, useContext, useCallback } from "react";
import api from "@/utils/api";
import { redirect } from "react-router-dom";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(response.data.data);
    } catch (error) {
      console.error("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      const response = await api.post("/events", eventData);
      setEvents((prev) => [...prev, response.data.data]);
      return response.data;
    } catch (error) {
      console.error("Error creating event", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      setLoading(true);
      const response = await api.put(`/events/${eventId}`, eventData);
      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? response.data.data : event
        )
      );
      return response.data;
    } catch (error) {
      console.error("Error updating event", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      setLoading(true);
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch (error) {
      console.error("Error deleting event", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getEventById = async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}`);
      if (!response.data.data) {
        return null;
      }
      return response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      } else {
        throw error;
      }
    }
  };
  const getUserEvents = useCallback(async () => {
    try {
      const response = await api.get("/events/user/my-events");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user events", error);
      throw error;
    }
  }, []);
  const participateInEvent = async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/participate`);

      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? response.data.data : event
        )
      );

      return response.data;
    } catch (error) {
      console.error("Error participating in event", error);
      throw error;
    }
  };

  const leaveEvent = async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}/leave`);

      // Update local events state
      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? response.data.data : event
        )
      );

      return response.data;
    } catch (error) {
      console.error("Error leaving event", error);
      throw error;
    }
  };
  const contextValue = {
    events,
    selectedEvent,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getUserEvents,
    participateInEvent,
    leaveEvent,
    getEventById,
    setSelectedEvent,
  };
  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};
