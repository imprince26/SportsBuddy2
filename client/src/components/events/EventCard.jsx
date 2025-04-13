/* eslint-disable react/prop-types */
import { formatDate, formatTime } from "@/utils/formatters";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Dumbbell,
  BadgeDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageGallery from "./ImageGallery";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { images = [] } = event;

  const difficultyColors = {
    Beginner: "bg-green-500/20 border-green-500",
    Intermediate: "bg-yellow-500/20 border-yellow-500",
    Advanced: "bg-red-500/20 border-red-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-[#0F2C2C]/70 rounded-xl p-6 hover:bg-[#0F2C2C]/90 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-[#2E7D32]/20"
    >
      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="mb-6">
          <ImageGallery images={images} />
        </div>
      )}

      {/* Event Header */}
      <div className="mb-4">
        <h3 className="text-2xl font-semibold text-[#E0F2F1] mb-2">
          {event.name}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm border",
              difficultyColors[event.difficulty]
            )}
          >
            {event.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-sm bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]">
            {event.category}
          </span>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2 text-[#81C784]">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#81C784]">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{formatTime(event.time)}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#81C784]">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">
            {event.location.city}
            {event.location.state && `, ${event.location.state}`}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[#81C784]">
          <Users className="h-4 w-4" />
          <span className="text-sm">
            {event.participants?.length || 0} / {event.maxParticipants} participants
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[#81C784]">
          <Dumbbell className="h-4 w-4" />
          <span className="text-sm">{event.difficulty}</span>
        </div>
        {event.registrationFee > 0 && (
          <div className="flex items-center space-x-2 text-[#81C784]">
            <BadgeDollarSign className="h-4 w-4" />
            <span className="text-sm">${event.registrationFee}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        onClick={() => navigate(`/events/${event._id}`)}
        className="w-full bg-[#4CAF50] text-white hover:bg-[#388E3C] transition duration-200"
      >
        View Details
      </Button>
    </motion.div>
  );
};

export default EventCard;
