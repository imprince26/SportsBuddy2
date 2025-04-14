import { Server } from 'socket.io';

const configureSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join_user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user:${userId}`);
    });

    // Join event-specific room
    socket.on('join_event', (eventId) => {
      socket.join(`event:${eventId}`);
      console.log(`Socket ${socket.id} joined event:${eventId}`);
    });

    // Leave event-specific room
    socket.on('leave_event', (eventId) => {
      socket.leave(`event:${eventId}`);
      console.log(`Socket ${socket.id} left event:${eventId}`);
    });

    // Handle event chat messages
    socket.on('event_message', (data) => {
      io.to(`event:${data.eventId}`).emit('newMessage', {
        user: data.user,
        message: data.message,
        timestamp: new Date(),
      });
      console.log(`Message sent to event:${data.eventId}: ${data.message}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default configureSocket;