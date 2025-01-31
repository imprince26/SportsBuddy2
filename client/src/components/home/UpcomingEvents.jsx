import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ArrowRightIcon,
  StarIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/context/EventContext";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

const EventCardSkeleton = () => (
  <div className="bg-[#0F2C2C]/30 rounded-2xl p-6 space-y-4">
    <Skeleton className="h-6 w-3/4 bg-[#1D4E4E]" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full bg-[#1D4E4E]" />
      <Skeleton className="h-4 w-full bg-[#1D4E4E]" />
      <Skeleton className="h-4 w-1/2 bg-[#1D4E4E]" />
    </div>
  </div>
);

const UpcomingEvents = () => {
  const { events, fetchEvents, loading, error } = useEvents();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    if (events.length === 0) {
      fetchEvents();
    }
  }, [fetchEvents, events.length]);

  useEffect(() => {
    if (events.length > 0) {
      const today = new Date();
      const filteredEvents = events
        .filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate > today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

      setUpcomingEvents(filteredEvents);
    }
  }, [events]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const eventCardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Difficulty level color mapping
  const difficultyColors = {
    Beginner: "bg-green-500/20 border-green-500",
    Intermediate: "bg-yellow-500/20 border-yellow-500",
    Advanced: "bg-red-500/20 border-red-500",
  };

  // Render error state
  if (error) {
    return (
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-8">
          <AlertCircleIcon className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Unable to Load Events
          </h2>
          <p className="text-[#81C784] mb-6">
            {error.message ||
              "An unexpected error occurred while fetching events."}
          </p>
          <Button
            onClick={() => fetchEvents()}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="container mx-auto px-4 py-16 relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <motion.h2
        className="text-4xl font-bold text-center text-[#E0F2F1] mb-12 relative z-10"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Upcoming Events
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-[#4CAF50]"></div>
      </motion.h2>

      {/* Events Grid */}
      <div className="grid md:grid-cols-3 gap-8 relative z-10">
        {loading ? (
          <>
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </>
        ) : upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <motion.div
              key={event._id}
              className={`
                ${difficultyColors[event.difficulty]} 
                rounded-2xl p-6 
                border-l-4 
                transform transition-all duration-300 
                hover:shadow-2xl
                relative
                overflow-hidden
              `}
              variants={eventCardVariants}
              whileHover="hover"
            >
              {/* Difficulty Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div
                  className={`
                  px-3 py-1 rounded-full text-xs font-bold
                  ${
                    event.difficulty === "Beginner"
                      ? "bg-green-500 text-white"
                      : event.difficulty === "Intermediate"
                      ? "bg-yellow-500 text-black"
                      : "bg-red-500 text-white"
                  }
                `}
                >
                  {event.difficulty}
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#4CAF50] mb-2 flex items-center">
                  <StarIcon className="mr-2 text-yellow-500" size={24} />
                  {event.name}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center text-[#81C784]">
                    <CalendarIcon className="mr-2" size={18} />
                    <span>
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </span>
                  </div>

                  <div className="flex items-center text-[#81C784]">
                    <MapPinIcon className="mr-2" size={18} />
                    <span>
                      {event.location.city}, {event.location.state}
                    </span>
                  </div>

                  <div className="flex items-center text-[#81C784]">
                    <UsersIcon className="mr-2" size={18} />
                    <span>
                      {event.participants.length} / {event.maxParticipants}{" "}
                      Participants
                    </span>
                  </div>
                </div>

                {/* View Details Button */}
                <Button
                  onClick={() => navigate(`/events/${event._id}`)}
                  className="w-full mt-4 bg-[#4CAF50] text-white hover:bg-[#388E3C] group"
                >
                  View Details
                  <ArrowRightIcon
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                    size={18}
                  />
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 text-center text-[#81C784]">
            No upcoming events at the moment
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default UpcomingEvents;
