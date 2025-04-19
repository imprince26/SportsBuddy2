import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return next(new Error("User not found"))
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user._id}`)

    // Join user's personal room
    socket.join(`user:${socket.user._id}`)

    // Handle user joining an event room
    socket.on("join_event", (eventId) => {
      socket.join(`event:${eventId}`)
      console.log(`${socket.user.name} joined event room: ${eventId}`)
    })

    // Handle user leaving an event room
    socket.on("leave_event", (eventId) => {
      socket.leave(`event:${eventId}`)
      console.log(`${socket.user.name} left event room: ${eventId}`)
    })

    // Handle event messages
    socket.on("event_message", (messageData) => {
      // Broadcast to all users in the event room
      io.to(`event:${messageData.eventId}`).emit("newMessage", {
        ...messageData,
        user: {
          id: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.avatar,
        },
        timestamp: new Date(),
      })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`)
    })
  })

  return io
}

// import { Server } from 'socket.io';

// const configureSocket = (httpServer) => {
//   const io = new Server(httpServer, {
//     cors: {
//       origin: process.env.CLIENT_URL || 'http://localhost:5173',
//       methods: ['GET', 'POST'],
//       credentials: true,
//     },
//   });

//   io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}`);

//     // Join user-specific room
//     socket.on('join_user', (userId) => {
//       socket.join(`user:${userId}`);
//       console.log(`Socket ${socket.id} joined user:${userId}`);
//     });

//     // Join event-specific room
//     socket.on('join_event', (eventId) => {
//       socket.join(`event:${eventId}`);
//       console.log(`Socket ${socket.id} joined event:${eventId}`);
//     });

//     // Leave event-specific room
//     socket.on('leave_event', (eventId) => {
//       socket.leave(`event:${eventId}`);
//       console.log(`Socket ${socket.id} left event:${eventId}`);
//     });

//     // Handle event chat messages
//     socket.on('event_message', (data) => {
//       io.to(`event:${data.eventId}`).emit('newMessage', {
//         user: data.user,
//         message: data.message,
//         timestamp: new Date(),
//       });
//       console.log(`Message sent to event:${data.eventId}: ${data.message}`);
//     });

//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.id}`);
//     });
//   });

//   return io;
// };

// export default configureSocket;