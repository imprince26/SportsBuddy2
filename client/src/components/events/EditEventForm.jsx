/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { AlertCircleIcon, PencilRuler } from "lucide-react";

const eventSchema = z.object({
  name: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(100, "Event name cannot exceed 100 characters"),
  category: z.enum([
    "Football",
    "Basketball",
    "Tennis",
    "Running",
    "Cycling",
    "Swimming",
    "Volleyball",
    "Cricket",
    "Other",
  ]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  date: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Event date must be in the future",
  }),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  location: z.object({
    address: z.string().min(3, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
  }),
  maxParticipants: z.coerce
    .number()
    .int("Must be a whole number")
    .min(1, "At least 1 participant required")
    .max(1000, "Maximum 1000 participants allowed"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  registrationFee: z.coerce
    .number()
    .min(0, "Fee cannot be negative")
    .optional(),
});

const EditEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, updateEvent } = useEvents();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const fetchedEvent = await getEventById(id);
        if (!fetchedEvent) {
          navigate("/events");
          return;
        }

        // Check if user is creator or admin
        setIsAuthorized(
          fetchedEvent.createdBy === user.id || user.role === "admin"
        );

        setEvent(fetchedEvent);
        form.reset({
          name: fetchedEvent.name,
          category: fetchedEvent.category,
          description: fetchedEvent.description,
          date: new Date(fetchedEvent.date).toISOString().split("T")[0],
          time: fetchedEvent.time,
          location: {
            address: fetchedEvent.location.address,
            city: fetchedEvent.location.city,
            state: fetchedEvent.location.state || "",
          },
          maxParticipants: fetchedEvent.maxParticipants,
          difficulty: fetchedEvent.difficulty,
          registrationFee: fetchedEvent.registrationFee || 0,
        });
      } catch (error) {
        navigate("/events");
      }
    };
    fetchEvent();
  }, [id, getEventById, navigate, user]);

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      category: "Other",
      description: "",
      date: "",
      time: "",
      location: {
        address: "",
        city: "",
        state: "",
      },
      maxParticipants: 10,
      difficulty: "Beginner",
      registrationFee: 0,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateEvent(id, data);
      toast.success("Event updated successfully!", {
        icon: "🎉",
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
          border: "1px solid #4CAF50",
        },
      });
      navigate(`/events/${id}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update event";
      toast.error(errorMessage, {
        icon: <AlertCircleIcon className="text-red-500" />,
        style: {
          background: "#2C3E50",
          color: "#ECF0F1",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A]">
        <div className="text-center text-[#E0F2F1]">
          <AlertCircleIcon className="mx-auto text-[#FF5252] mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
          <p className="text-[#81C784] mb-6">
            You are not authorized to edit this event.
          </p>
          <Button
            onClick={() => navigate("/events")}
            className="bg-[#4CAF50] hover:bg-[#388E3C]"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A] p-4">
      <div className="w-full max-w-2xl bg-[#0F2C2C]/70 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <PencilRuler
            className="mx-auto h-16 w-16 text-[#4CAF50] mb-4 animate-pulse"
            strokeWidth={1.5}
          />
          <h2 className="text-4xl font-bold text-[#E0F2F1]">Update Event</h2>
          <p className="text-[#81C784] mt-2">
            Edit the details of your event below.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">Event Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Event Name"
                      {...field}
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Difficulty Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 
                            text-[#E0F2F1] focus:ring-2 focus:ring-[#4CAF50]/50"
                        >
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1D4E4E] border-[#2E7D32]/30 text-[#E0F2F1]">
                        {[
                          "Football",
                          "Basketball",
                          "Tennis",
                          "Running",
                          "Cycling",
                          "Swimming",
                          "Volleyball",
                          "Cricket",
                          "Other",
                        ].map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Difficulty */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">Difficulty</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 
                            text-[#E0F2F1] focus:ring-2 focus:ring-[#4CAF50]/50"
                        >
                          <SelectValue placeholder="Select Difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1D4E4E] border-[#2E7D32]/30 text-[#E0F2F1]">
                        {["Beginner", "Intermediate", "Advanced"].map(
                          (level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Event Description"
                      {...field}
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Address"
                      {...field}
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City"
                        {...field}
                        className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">State</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="State"
                        {...field}
                        className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">
                    Max Participants
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">
                    Registration Fee
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                className="w-full bg-[#4CAF50] text-[#E0F2F1] hover:bg-[#388E3C] transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Event"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditEventForm;
