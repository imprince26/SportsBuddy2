import { Server } from "socket.io"
import User from "../models/userModel.js"

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

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
    console.log(`✅ Socket connected: ${socket.user.name} (${socket.user._id})`)

    socket.join(`user:${socket.user._id}`)

    socket.on("join_event", (eventId) => {
      socket.join(`event:${eventId}`)
      console.log(`${socket.user.name} joined event:${eventId}`)
    })

    socket.on("leave_event", (eventId) => {
      socket.leave(`event:${eventId}`)
      console.log(`${socket.user.name} left event:${eventId}`)
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
      console.log(`❌ Socket disconnected: ${socket.user.name}`)
    })
  })

  return io
}