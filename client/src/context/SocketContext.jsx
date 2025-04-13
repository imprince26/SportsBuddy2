import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
        withCredentials: true
      });

      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from socket server');
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
    }
  };

  const leaveEventRoom = (eventId) => {
    if (socket) {
      socket.emit('leave_event', eventId);
    }
  };

  const value = {
    socket,
    joinEventRoom,
    leaveEventRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};