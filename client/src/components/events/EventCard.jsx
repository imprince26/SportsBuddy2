/* eslint-disable react/prop-types */
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0F2C2C]/50 rounded-xl p-6 hover:bg-[#0F2C2C]/70 transition-all">
      <h3 className="text-xl font-semibold text-[#4CAF50] mb-2">
        {event.name}
      </h3>
      <p className="text-[#81C784] mb-4">{event.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-[#B2DFDB]">
          <CalendarIcon className="mr-2" size={16} />
          {new Date(event.date).toLocaleDateString()}
        </div>
        <div className="flex items-center text-[#B2DFDB]">
          <MapPinIcon className="mr-2" size={16} />
          {event.location.city}, {event.location.state}
        </div>
      </div>

      <Button
        onClick={() => navigate(`/events/${event._id}`)}
        className="w-full bg-[#4CAF50] hover:bg-[#388E3C]"
      >
        View Details
      </Button>
    </div>
  );
};

export default EventCard;
