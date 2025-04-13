import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

const EventChat = ({ eventId }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (socket && eventId) {
      // Join event chat room
      socket.emit("joinEventChat", eventId);

      // Load previous messages
      socket.emit("getEventMessages", eventId);
      
      // Listen for new messages
      socket.on("eventMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      // Receive previous messages
      socket.on("eventMessages", (previousMessages) => {
        setMessages(previousMessages);
      });

      return () => {
        socket.emit("leaveEventChat", eventId);
        socket.off("eventMessage");
        socket.off("eventMessages");
      };
    }
  }, [socket, eventId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      const messageData = {
        eventId,
        userId: user._id,
        text: newMessage.trim(),
        timestamp: new Date(),
      };
      
      socket.emit("sendEventMessage", messageData);
      setNewMessage("");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Event Chat</h3>
      </div>
      
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 ${
                message.userId === user._id ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <img
                  src={message.userAvatar || `https://ui-avatars.com/api/?name=${message.userName}`}
                  alt={message.userName}
                />
              </Avatar>
              
              <div
                className={`max-w-[70%] ${
                  message.userId === user._id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                } rounded-lg p-3`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {message.userName}
                  </span>
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t flex items-center gap-2"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default EventChat;