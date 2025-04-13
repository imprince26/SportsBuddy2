import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import EventChat from "./EventChat";
import { formatDate, formatTime } from "@/utils/formatters";
import { MapPin, Users, Calendar, Clock, Star } from "lucide-react";
import api from "@/utils/api";
import ImageGallery from "./ImageGallery";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinEventRoom, leaveEventRoom } = useSocket();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/api/events/${id}`);
        setEvent(response.data);
        // Join the event's socket room
        joinEventRoom(id);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    // Cleanup function to leave the event room
    return () => {
      leaveEventRoom(id);
    };
  }, [id, joinEventRoom, leaveEventRoom]);

  const handleJoinEvent = async () => {
    try {
      const response = await api.post(`/api/events/${id}/join`);
      setEvent(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error joining event");
    }
  };

  const handleLeaveEvent = async () => {
    try {
      const response = await api.post(`/api/events/${id}/leave`);
      setEvent(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error leaving event");
    }
  };

  const handleRateEvent = async (rating) => {
    try {
      const response = await api.post(`/api/events/${id}/ratings`, {
        rating,
      });
      setEvent(response.data);
      setUserRating(rating);
    } catch (err) {
      setError(err.response?.data?.message || "Error rating event");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate("/events")}>Back to Events</Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Event not found</p>
        <Button onClick={() => navigate("/events")}>Back to Events</Button>
      </div>
    );
  }

  const isParticipant = event.participants.some(
    (p) => p.user._id === user._id
  );
  const isOrganizer = event.createdBy._id === user._id;
  const averageRating =
    event.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
    event.ratings.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        {/* Image Gallery Section */}
        {event.images?.length > 0 && (
          <div className="mb-8">
            <ImageGallery images={event.images} />
          </div>
        )}

        <div className="p-6">
          {/* Event Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(event.time)}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {event.location}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {!isOrganizer && (
                <Button
                  onClick={isParticipant ? handleLeaveEvent : handleJoinEvent}
                  variant={isParticipant ? "destructive" : "default"}
                >
                  {isParticipant ? "Leave Event" : "Join Event"}
                </Button>
              )}
              {isOrganizer && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/events/edit/${id}`)}
                >
                  Edit Event
                </Button>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-2">About this event</h2>
                <p className="text-muted-foreground">{event.description}</p>
              </div>

              {/* Participants */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Participants</h2>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.participants.length}/{event.maxParticipants}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.participants.map((participant) => (
                    <div
                      key={participant.user._id}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-muted"
                    >
                      <Avatar>
                        <img
                          src={
                            participant.user.avatar ||
                            `https://ui-avatars.com/api/?name=${participant.user.name}`
                          }
                          alt={participant.user.name}
                        />
                      </Avatar>
                      <span>{participant.user.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Section */}
              {isParticipant && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Event Chat</h2>
                  <EventChat eventId={id} initialMessages={event.chat} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Organizer */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Organizer</h2>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted">
                  <Avatar>
                    <img
                      src={
                        event.createdBy.avatar ||
                        `https://ui-avatars.com/api/?name=${event.createdBy.name}`
                      }
                      alt={event.createdBy.name}
                    />
                  </Avatar>
                  <span>{event.createdBy.name}</span>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h2 className="text-xl font-semibold mb-2">Ratings</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Star
                    className={`w-6 h-6 ${
                      averageRating > 0
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                  <span>
                    {averageRating.toFixed(1)} ({event.ratings.length} reviews)
                  </span>
                </div>
                {isParticipant && !userRating && (
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRateEvent(rating)}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            rating <= userRating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventDetails;
