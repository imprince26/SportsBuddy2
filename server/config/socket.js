import { Server } from "socket.io";

const configureSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_event", (eventId) => {
      socket.join(`event_${eventId}`);
    });

    socket.on("leave_event", (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    socket.on("event_message", (data) => {
      io.to(`event_${data.eventId}`).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default configureSocket;