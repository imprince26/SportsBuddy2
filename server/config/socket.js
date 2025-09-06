import { Server } from "socket.io"
import User from "../models/userModel.js"

export default function setupSocket(server) {
  const allowedOrigins = [process.env.CLIENT_URL, "https://sports-buddy2.vercel.app", "http://localhost:5173"].filter(Boolean);
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId
      if (!userId) return next(new Error("Authentication error"))

      const user = await User.findById(userId).select("-password")

      if (!user) return next(new Error("User not found"))

      socket.user = user
      next()
    } catch (err) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user._id}`)

    socket.on("join_event", (eventId) => {
      socket.join(`event:${eventId}`)
    })

    socket.on("leave_event", (eventId) => {
      socket.leave(`event:${eventId}`)
    })

    socket.on("joinEventChat", ({ eventId, userId }) => {
      socket.join(`eventChat:${eventId}`)

      // Notify other participants that user joined
      socket.to(`eventChat:${eventId}`).emit("userJoinedChat", {
        userId: socket.user._id,
        name: socket.user.name,
        avatar: socket.user.avatar
      })
    })

    socket.on("leaveEventChat", ({ eventId, userId }) => {
      socket.leave(`eventChat:${eventId}`)

      // Notify other participants that user left
      socket.to(`eventChat:${eventId}`).emit("userLeftChat", {
        userId: socket.user._id,
        name: socket.user.name
      })
    })

    socket.on("sendEventMessage", (messageData) => {
      const message = {
        ...messageData,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.avatar,
          role: socket.user.role
        },
        timestamp: new Date().toISOString()
      }

      // Emit to all users in the event chat room
      io.to(`eventChat:${messageData.eventId}`).emit("newEventMessage", message)
    })

    socket.on("userTyping", ({ eventId, userId, name }) => {
      socket.to(`eventChat:${eventId}`).emit("userTyping", { userId, name })
    })

    socket.on("userStoppedTyping", ({ eventId, userId }) => {
      socket.to(`eventChat:${eventId}`).emit("userStoppedTyping", { userId })
    })

    socket.on("event_message", (messageData) => {
      const message = {
        ...messageData,
        user: {
          id: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.avatar,
        },
        timestamp: new Date(),
      }

      io.to(`event:${messageData.eventId}`).emit("newMessage", message)
    })

    socket.on("disconnect", () => {

    })
  })

  return io
}
