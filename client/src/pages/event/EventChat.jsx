import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Send, 
  Users, 
  ArrowLeft,
  Crown,
  Shield,
  MapPin,
  Calendar,
  Hash,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useEvents } from '@/hooks/useEvents';
import api from '@/utils/api';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Message Bubble Component
const MessageBubble = ({ message, isOwn }) => {
  return (
    <div
      className={cn(
        "flex gap-2 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isOwn && (
        <Avatar className="w-7 h-7 mt-1 flex-shrink-0">
          <AvatarImage src={message.user?.avatar} />
          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
            {message.user?.name?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-foreground">
              {message.user?.name}
            </span>
            {message.user?.role === 'admin' && (
              <Crown className="h-3 w-3 text-yellow-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
          </div>
        )}

        <div
          className={cn(
            "rounded-xl px-3 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border rounded-bl-sm"
          )}
        >
          <div className={cn(
            "break-words",
            !isOwn && "text-card-foreground"
          )}>
            {message.content || message.message}
          </div>
        </div>

        {isOwn && (
          <span className="text-xs text-muted-foreground mt-1">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
};

// Participants Sidebar Component
const ParticipantsSidebar = ({ participants, eventCreator, onlineUsers, isOpen, onClose }) => {
  const isOnline = (userId) => onlineUsers.includes(userId);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed md:relative top-0 right-0 h-full w-72 bg-card border-l border-border z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">
            Participants ({participants?.length || 0})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden p-1 h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Event Creator */}
          {eventCreator && (
            <>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={eventCreator.avatar} />
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                      {eventCreator.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline(eventCreator._id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {eventCreator.name}
                    </p>
                    <Crown className="h-3 w-3 text-amber-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Organizer</p>
                </div>
              </div>
              <div className="border-b border-border my-2"></div>
            </>
          )}

          {/* Participants */}
          {participants?.map((participant) => (
            <div
              key={participant._id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.user?.avatar} />
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    {participant.user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOnline(participant.user?._id) && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {participant.user?.name}
                  </p>
                  {participant.user?.role === 'admin' && (
                    <Shield className="h-3 w-3 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isOnline(participant.user?._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Main Event Chat Component
const EventChat = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { getEventById } = useEvents();

  // State management
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isTyping, setIsTyping] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Load event and messages
  useEffect(() => {
    loadEventData();
  }, [eventId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !eventId || !user?.id) return;

    console.log('Setting up socket listeners for event:', eventId);

    // Join event chat room
    socket.emit('joinEventChat', { eventId, userId: user.id });

    // Listen for messages
    const handleNewMessage = (newMessage) => {
      console.log('New message received:', newMessage);
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        if (prev.some(msg => msg._id === newMessage._id || 
            (msg.content === newMessage.content && msg.timestamp === newMessage.timestamp))) {
          return prev;
        }
        return [...prev, newMessage];
      });
      
      // Only show toast for messages from other users
      if (newMessage.user._id !== user.id) {
        toast.success(`${newMessage.user.name}: ${newMessage.content.substring(0, 30)}...`);
      }
    };

    const handleUserJoined = (userData) => {
      toast.success(`${userData.name} joined the chat`);
    };

    const handleUserLeft = (userData) => {
      toast(`${userData.name} left the chat`);
    };

    const handleUserTyping = (userData) => {
      if (userData.userId !== user.id) {
        setIsTyping(prev => {
          if (!prev.includes(userData.userId)) {
            return [...prev, userData.userId];
          }
          return prev;
        });
      }
    };

    const handleUserStoppedTyping = (userData) => {
      setIsTyping(prev => prev.filter(id => id !== userData.userId));
    };

    const handleOnlineUsersUpdate = (users) => {
      setOnlineUsers(users);
    };

    // Add event listeners
    socket.on('newEventMessage', handleNewMessage);
    socket.on('userJoinedChat', handleUserJoined);
    socket.on('userLeftChat', handleUserLeft);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);
    socket.on('onlineUsersUpdate', handleOnlineUsersUpdate);

    return () => {
      console.log('Cleaning up socket listeners');
      socket.emit('leaveEventChat', { eventId, userId: user.id });
      socket.off('newEventMessage', handleNewMessage);
      socket.off('userJoinedChat', handleUserJoined);
      socket.off('userLeftChat', handleUserLeft);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
      socket.off('onlineUsersUpdate', handleOnlineUsersUpdate);
    };
  }, [socket, eventId, user?.id]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load event data
  const loadEventData = async () => {
    try {
      setIsLoading(true);
      const res = await getEventById(eventId);
      const eventData = res.data;
      
      if (!eventData) {
        toast.error('Event not found');
        navigate('/events');
        return;
      }

      // Check if user is participant or creator
      const isParticipant = eventData.participants?.some(p => p.user._id === user.id);
      const isCreator = eventData.createdBy._id === user.id;

      if (!isParticipant && !isCreator) {
        toast.error('You must be a participant to access the chat');
        navigate(`/events/${eventId}`);
        return;
      }

      setEvent(eventData);
      
      // Load existing messages
      try {
        const messagesRes = await api.get(`/events/${eventId}/messages`);
        if (messagesRes.data.success) {
          setMessages(messagesRes.data.data || []);
        }
      } catch (error) {
        console.log('No existing messages or error loading:', error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('Failed to load event data');
      navigate('/events');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (socket && user?.id) {
      socket.emit('userTyping', { eventId, userId: user.id, name: user.name });
      
      // Clear existing timeout
      clearTimeout(typingTimeoutRef.current);
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('userStoppedTyping', { eventId, userId: user.id });
      }, 1000);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending || !socket) return;

    setIsSending(true);
    
    try {
      const messageData = {
        _id: Date.now().toString(), // Temporary ID
        eventId,
        content: message.trim(),
        user: {
          _id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        },
        timestamp: new Date().toISOString()
      };

      console.log('Sending message:', messageData);

      // Add message to local state immediately for instant feedback
      setMessages(prev => [...prev, messageData]);
      
      // Clear input immediately
      setMessage('');
      
      // Emit to socket for real-time delivery to others
      socket.emit('sendEventMessage', messageData);

      // Save to database in background
      try {
        await api.post(`/events/${eventId}/messages`, {
          message: message.trim()
        });
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
        // Don't show error to user as message was sent via socket
      }

      // Stop typing indicator
      socket.emit('userStoppedTyping', { eventId, userId: user.id });
      
      // Focus input for next message
      messageInputRef.current?.focus();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the message from local state if it failed
      setMessages(prev => prev.filter(msg => msg._id !== messageData._id));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Chat Header */}
        <div className="bg-card/90 backdrop-blur-sm border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/events/${eventId}`)}
                className="p-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Hash className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-foreground truncate">
                    {event?.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {event?.date && format(new Date(event.date), 'MMM dd')}
                    <span>•</span>
                    <MapPin className="h-3 w-3" />
                    {event?.location?.city}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs border-green-500/20">
                {onlineUsers.length} online
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowParticipants(!showParticipants)}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-background">
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-1"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hash className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Start the conversation
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Be the first to send a message in this chat
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <MessageBubble
                    key={msg._id || `${msg.timestamp}-${index}`}
                    message={msg}
                    isOwn={msg.user?._id === user?.id}
                  />
                ))}
              </>
            )}

            {/* Typing Indicators */}
            {isTyping.length > 0 && (
              <div
                className="flex items-center gap-2 text-muted-foreground text-sm px-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>Someone is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-card/90 backdrop-blur-sm border-t border-border p-4 flex-shrink-0">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type your message..."
                  className="bg-muted border-input focus:border-primary rounded-lg text-foreground placeholder:text-muted-foreground"
                  disabled={isSending}
                />
              </div>

              <Button
                type="submit"
                disabled={!message.trim() || isSending}
                size="icon"
                className="h-10 w-10"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      <ParticipantsSidebar
        participants={event?.participants}
        eventCreator={event?.createdBy}
        onlineUsers={onlineUsers}
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
      />
    </div>
  );
};

export default EventChat;

