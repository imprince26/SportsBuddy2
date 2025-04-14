import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        withCredentials: true,
        auth: { token: localStorage.getItem('token') }, // For JWT auth if enabled
      });

      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
        socketInstance.emit('join_user', user.id); // Join user room
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
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      socketInstance.on('error', (err) => {
        console.error('Socket error:', err);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

  const joinEventRoom = (eventId) => {
    if (socket) {
      socket.emit('join_event', eventId);
      console.log(`Joined event:${eventId}`);
    }
  };

  const leaveEventRoom = (eventId) => {
    if (socket) {
      socket.emit('leave_event', eventId);
      console.log(`Left event:${eventId}`);
    }
  };

  const sendEventMessage = (eventId, message, user) => {
    if (socket) {
      socket.emit('event_message', { eventId, message, user });
    }
  };

  const value = {
    socket,
    joinEventRoom,
    leaveEventRoom,
    sendEventMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};