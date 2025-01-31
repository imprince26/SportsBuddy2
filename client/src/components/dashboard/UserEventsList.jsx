/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  TrashIcon,
  EditIcon,
  PlusCircleIcon,
  SearchIcon,
  FilterIcon,
} from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { useEvents } from "@/context/EventContext";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SportsBuddyLoader from "../layout/Loader";

const UserEventsList = ({ events, loading, onRefresh }) => {
  const navigate = useNavigate();
  const { deleteEvent } = useEvents();

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    event: null,
  });

  // Categories for filtering
  const categories = [
    "ALL",
    "Football",
    "Basketball",
    "Tennis",
    "Running",
    "Cycling",
    "Swimming",
    "Volleyball",
    "Cricket",
    "Other",
  ];

  // Filtering and Sorting Logic
  const filteredAndSortedEvents = useMemo(() => {
    let result = events.filter((event) => {
      // Search filter
      const matchesSearch = event.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        categoryFilter === "ALL" || event.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [events, searchTerm, categoryFilter, sortBy, sortOrder]);

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredAndSortedEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  const totalPages = Math.ceil(filteredAndSortedEvents.length / eventsPerPage);

  // Delete Event Handler
  const handleDelete = async () => {
    if (!deleteConfirmation.event) {
      toast.error("No event selected for deletion", {
        style: {
          background: "#2C3E50",
          color: "#ECF0F1",
        },
      });
      return;
    }

    try {
      await deleteEvent(deleteConfirmation.event._id);
      toast.success("Event deleted successfully!", {
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
        },
      });
      onRefresh(false);
      setDeleteConfirmation({ isOpen: false, event: null });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete event";
      toast.error(errorMessage, {
        style: {
          background: "#2C3E50",
          color: "#ECF0F1",
        },
      });
    }
  };

  // Pagination Handlers
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Open Delete Confirmation
  const openDeleteConfirmation = (event) => {
    setDeleteConfirmation({
      isOpen: true,
      event: event,
    });
  };

  if (loading) {
    return <SportsBuddyLoader />;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1D4E4E]/30 rounded-lg">
        <CalendarIcon
          className="mx-auto mb-4 text-[#4CAF50] opacity-50"
          size={64}
        />
        <p className="text-[#81C784] text-xl mb-6">
          You haven&apos;t created any events yet
        </p>
        <Button
          onClick={() => navigate("/events/create")}
          className="bg-[#4CAF50] hover:bg-[#388E3C] group"
        >
          <PlusCircleIcon className="mr-2 group-hover:rotate-180 transition-transform" />
          Create First Event
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4CAF50]" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1]"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1]">
            <SelectValue placeholder="Select Category">
              {categoryFilter === "ALL" ? "All Categories" : categoryFilter}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-[#1D4E4E] border-[#2E7D32]/30 text-[#E0F2F1]">
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Dropdown */}
        <div className="flex space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1]">
              <SelectValue placeholder="Sort By">
                {sortBy === "date"
                  ? "Date"
                  : sortBy === "name"
                  ? "Name"
                  : "Category"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#1D4E4E] border-[#2E7D32]/30 text-[#E0F2F1]">
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setSortOrder(sortOrder === " asc" ? "desc" : "asc")}
            className="bg-[#1D4E4E]/30 hover:bg-[#1D4E4E]/60 border-[#2E7D32]/30 text-[#E0F2F1]"
          >
            <FilterIcon />
          </Button>
        </div>
      </div>

      {/* Event List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {currentEvents.length === 0 ? (
          <div className="text-center lg:col-span-3 md:col-span-2 col-span-1 py-12 bg-[#1D4E4E]/30 rounded-lg">
            <CalendarIcon
              className="mx-auto mb-4 text-[#4CAF50] opacity-50"
              size={64}
            />
            <p className="text-[#81C784] text-xl mb-6">
              No events found matching your search criteria
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              className="bg-[#4CAF50] hover:bg-[#388E3C] group"
            >
              <FilterIcon className="mr-2 group-hover:rotate-180 transition-transform" />
              Clear Search
            </Button>
          </div>
        ) : (
          currentEvents.map((event) => (
            <div
              key={event._id}
              className="p-4 bg-[#1D4E4E]/30 rounded-lg flex flex-col justify-between space-y-4 "
            >
              <div className="">
                <h3 className="text-lg font-bold text-[#E0F2F1]">
                  {event.name}
                </h3>
                <p className="text-sm text-[#B2DFDB]">
                  {formatDate(event.date)}
                </p>
                <p className="text-sm text-[#B2DFDB]">{event.category}</p>
              </div>
              <div className="flex justify-between">
                <Button
                  onClick={() => navigate(`/events/edit/${event._id}`)}
                  className="bg-[#4CAF50] hover:bg-[#388E3C]"
                >
                  <EditIcon className="mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => openDeleteConfirmation(event)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <TrashIcon className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="bg-[#4CAF50] hover:bg-[#388E3C]"
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="bg-[#4CAF50] hover:bg-[#388E3C]"
        >
          Next
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <Dialog
          open={deleteConfirmation.isOpen}
          onOpenChange={() =>
            setDeleteConfirmation({ isOpen: false, event: null })
          }
        >
          <DialogContent className="bg-[#1D4E4E] border-[#2E7D32]/30 rounded-xl text-[#E0F2F1]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the event &quot;
              {deleteConfirmation.event?.name}&quot;?
            </p>
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirm
              </Button>
              <Button
                onClick={() =>
                  setDeleteConfirmation({ isOpen: false, event: null })
                }
                className="ml-2 bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserEventsList;