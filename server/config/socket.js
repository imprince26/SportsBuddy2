import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const parseCookieHeader = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=")
    if (!rawName || rawValue.length === 0) return cookies

    cookies[rawName] = decodeURIComponent(rawValue.join("="))
    return cookies
  }, {})
}

export default function setupSocket(server) {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://sports-buddy2.vercel.app",
    "https://sportsbuddy.princepatel.me",
    "http://localhost:3000",
    "http://localhost:5173",
  ].filter(Boolean);
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
      const cookies = parseCookieHeader(socket.handshake.headers.cookie)
      const token = cookies.SportsBuddyToken
      if (!token) return next(new Error("Authentication error"))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(decoded.id).select("-password")

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
