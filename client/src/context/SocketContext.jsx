import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [eventMessages, setEventMessages] = useState({});
  const { user } = useAuth();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketInstance = io(API_URL, {
      withCredentials: true,
      auth: { token: user.token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
      socketInstance.emit('join_user', user.id);
    });

    // Listen for all socket events
    socketInstance.on('newEvent', (event) => {
      console.log('New Event:', event);
    });

    socketInstance.on('eventUpdated', (event) => {
      console.log('Event Updated:', event);
    });

    socketInstance.on('eventDeleted', (eventId) => {
      console.log('Event Deleted:', eventId);
    });

    socketInstance.on('userJoinedEvent', (data) => {
      console.log('User Joined:', data);
    });

    socketInstance.on('userLeftEvent', (data) => {
      console.log('User Left:', data);
    });

    socketInstance.on('teamCreated', (data) => {
      console.log('Team Created:', data);
    });

    socketInstance.on('newRating', (data) => {
      console.log('New Rating:', data);
    });

    socketInstance.on('newMessage', (message) => {
      console.log('New Message:', message);
      // Update event messages
      setEventMessages(prev => {
        const eventId = message.eventId;
        const prevMessages = prev[eventId] || [];
        return {
          ...prev,
          [eventId]: [...prevMessages, message]
        };
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });

    socketInstance.on('error', (err) => {
      console.error('Socket error:', err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Join event room for real-time updates
  const joinEventRoom = useCallback((eventId) => {
    if (socket && connected) {
      socket.emit('join_event', eventId);
      console.log(`Joined event:${eventId}`);
    }
  }, [socket, connected]);

  // Leave event room
  const leaveEventRoom = useCallback((eventId) => {
    if (socket && connected) {
      socket.emit('leave_event', eventId);
      console.log(`Left event:${eventId}`);
    }
  }, [socket, connected]);

  // Send message in event chat
  const sendEventMessage = useCallback((eventId, message) => {
    if (socket && connected && user) {
      const messageData = {
        eventId,
        message,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        timestamp: new Date()
      };
      
      socket.emit('event_message', messageData);
      
      // Optimistically update local state
      setEventMessages(prev => {
        const prevMessages = prev[eventId] || [];
        return {
          ...prev,
          [eventId]: [...prevMessages, messageData]
        };
      });
      
      return true;
    }
    return false;
  }, [socket, connected, user]);

  // Get messages for a specific event
  const getEventMessages = useCallback((eventId) => {
    return eventMessages[eventId] || [];
  }, [eventMessages]);

  // Clear messages for a specific event
  const clearEventMessages = useCallback((eventId) => {
    setEventMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[eventId];
      return newMessages;
    });
  }, []);

  const value = {
    socket,
    connected,
    joinEventRoom,
    leaveEventRoom,
    sendEventMessage,
    getEventMessages,
    clearEventMessages,
    eventMessages
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
