import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/context/EventContext";
import { CalendarIcon, AlertCircleIcon } from "lucide-react";

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

const CreateEventForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createEvent } = useEvents();
  const navigate = useNavigate();

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
      const validatedData = eventSchema.parse(data);

      await createEvent(validatedData);
      toast.success("Event created successfully!", {
        icon: "🎉",
        style: {
          background: "#0F2C2C",
          color: "#E0F2F1",
          border: "1px solid #4CAF50",
        },
      });
      navigate("/events");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message);
        toast.error(errorMessages[0], {
          icon: <AlertCircleIcon className="text-red-500" />,
          style: {
            background: "#2C3E50",
            color: "#ECF0F1",
          },
        });
      } else {
        const errorMessage =
          error.response?.data?.message || "Failed to create event";
        toast.error(errorMessage, {
          icon: <AlertCircleIcon className="text-red-500" />,
          style: {
            background: "#2C3E50",
            color: "#ECF0F1",
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A] p-4">
      <div className="w-full max-w-2xl bg-[#0F2C2C]/70 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <CalendarIcon
            className="mx-auto h-16 w-16 text-[#4CAF50] mb-4 animate-pulse"
            strokeWidth={1.5}
          />
          <h2 className="text-4xl font-bold text-[#E0F2F1]">
            Create New Event
          </h2>
          <p className="text-[#81C784] mt-2">
            Fill in the details for your upcoming sports event
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">Event Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter event name"
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                      focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5252]" />
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
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1D4E4E] border-[#2E7D32]/30 text-[#E0F2F1]">
                        {[
                          "Cricket",
                          "Football",
                          "Basketball",
                          "Tennis",
                          "Running",
                          "Cycling",
                          "Swimming",
                          "Volleyball",
                          "Other",
                        ].map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[#FF5252]" />
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
                          <SelectValue placeholder="Select difficulty" />
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
                    <FormMessage className="text-[#FF5252]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">Description</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter event description"
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                      focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5252]" />
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
                    <FormLabel className="text-[#B0BEC5]">Event Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50 "
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5252]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">Event Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5252]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter event address"
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                      focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5252]" />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter city"
                        className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5252]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#B0BEC5]">
                      State (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter state"
                        className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                        focus:ring-2 focus:ring-[#4CAF50]/50"
                      />
                    </FormControl>
                    <FormMessage className="text-[#FF5252]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Max Participants */}
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
                      placeholder="Enter max participants"
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                      focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5252]" />
                </FormItem>
              )}
            />

            {/* Registration Fee */}
            <FormField
              control={form.control}
              name="registrationFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#B0BEC5]">
                    Registration Fee (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      placeholder="Enter registration fee"
                      className="bg-[#1D4E4E]/30 border-[#2E7D32]/30 text-[#E0F2F1] 
                      focus:ring-2 focus:ring-[#4CAF50]/50"
                    />
                  </FormControl>
                  <FormMessage className="text-[#FF5252]" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4CAF50] text-[#E0F2F1] hover:bg-[#388E3C] transition duration-200"
            >
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateEventForm;
