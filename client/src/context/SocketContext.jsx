import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/hooks/useAuth'

const SocketContext = createContext()

// export const useSocket = () => {
//   const context = useContext(SocketContext)
//   if (!context) throw new Error("useSocket must be used within a SocketProvider")
//   return context
// }

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [eventMessages, setEventMessages] = useState({})

  const API_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
      return
    }

    const socketInstance = io(API_URL, {
      withCredentials: true,
      auth: {
        userId: user.id,
      },
    })

    socketInstance.on("connect", () => {
      // console.log("✅ Connected to socket server")
      setConnected(true)
      socketInstance.emit("join_user", user.id)
    })

    socketInstance.on("newMessage", (message) => {
      // console.log("📩 New Message:", message)
      setEventMessages(prev => {
        const eventId = message.eventId
        const prevMsgs = prev[eventId] || []
        return {
          ...prev,
          [eventId]: [...prevMsgs, message],
        }
      })
    })

    socketInstance.on("disconnect", () => {
      // console.log("❌ Disconnected from socket")
      setConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("🚫 Socket connect error:", err.message)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  const joinEventRoom = useCallback((eventId) => {
    if (socket && connected) {
      socket.emit("join_event", eventId)
    }
  }, [socket, connected])

  const leaveEventRoom = useCallback((eventId) => {
    if (socket && connected) {
      socket.emit("leave_event", eventId)
    }
  }, [socket, connected])

  const sendEventMessage = useCallback((eventId, message) => {
    if (!socket || !connected || !user) return false

    const msg = {
      eventId,
      message,
    }

    socket.emit("event_message", msg)
    return true
  }, [socket, connected, user])

  const getEventMessages = useCallback((eventId) => {
    return eventMessages[eventId] || []
  }, [eventMessages])

  const clearEventMessages = useCallback((eventId) => {
    setEventMessages(prev => {
      const updated = { ...prev }
      delete updated[eventId]
      return updated
    })
  }, [])

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinEventRoom,
        leaveEventRoom,
        sendEventMessage,
        getEventMessages,
        clearEventMessages,
        eventMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export { SocketContext }