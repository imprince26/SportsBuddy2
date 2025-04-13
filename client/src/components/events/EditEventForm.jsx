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
import { CalendarIcon, AlertCircleIcon } from "lucide-react";
import { eventSchema } from "@/utils/validation";
import ImageUpload from "@/components/ui/image-upload";

const EditEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, updateEvent } = useEvents();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const fetchedEvent = await getEventById(id);
        if (!fetchedEvent) {
          navigate("/events");
          return;
        }

        setIsAuthorized(
          fetchedEvent.createdBy._id === user.id || user.role === "admin"
        );

        // Initialize uploaded images with existing ones
        setUploadedImages(fetchedEvent.images || []);

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
      } catch {
        toast.error("Failed to fetch event details", {
          icon: <AlertCircleIcon className="text-red-500" />,
          style: {
            background: "#2C3E50",
            color: "#ECF0F1",
          },
        });
        navigate("/events");
      }
    };
    fetchEvent();
  }, [id, getEventById, navigate, user, form]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const validatedData = eventSchema.parse({
        ...data,
        images: uploadedImages,
      });
      await updateEvent(id, validatedData);
      
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
          error.response?.data?.message || "Failed to update event";
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1A1A] via-[#0F2C2C] to-[#0A1A1A]">
        <div className="text-center text-[#E0F2F1]">
          <AlertCircleIcon className="mx-auto h-16 w-16 text-[#FF5252] mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-[#81C784] mb-4">
            You are not authorized to edit this event.
          </p>
          <Button
            onClick={() => navigate("/events")}
            className="bg-[#4CAF50] text-white hover:bg-[#388E3C]"
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
          <CalendarIcon
            className="mx-auto h-16 w-16 text-[#4CAF50] mb-4 animate-pulse"
            strokeWidth={1.5}
          />
          <h2 className="text-4xl font-bold text-[#E0F2F1]">Edit Event</h2>
          <p className="text-[#81C784] mt-2">Update your event details</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Form fields - same as CreateEventForm */}
            {/* ... Event Name ... */}
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

            {/* ... Category and Difficulty ... */}
            <div className="grid md:grid-cols-2 gap-6">
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

            {/* ... Description ... */}
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

            {/* ... Date and Time ... */}
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
                        focus:ring-2 focus:ring-[#4CAF50]/50"
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

            {/* ... Location Fields ... */}
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

            {/* ... Max Participants and Registration Fee ... */}
            <div className="grid md:grid-cols-2 gap-6">
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
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="text-[#B0BEC5] block">Event Images</label>
              <ImageUpload
                maxFiles={5}
                maxSize={5}
                existingImages={uploadedImages}
                onChange={() => {}} // We handle this through onUploadComplete
                onUploadComplete={(urls) => {
                  setUploadedImages(prev => [...prev, ...urls]);
                }}
                onRemove={(index) => {
                  setUploadedImages(prev => prev.filter((_, i) => i !== index));
                }}
                className="mt-1"
              />
              <p className="text-xs text-[#81C784]">
                Upload up to 5 images (max 5MB each)
              </p>
            </div>

            {/* ... Submit Button ... */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/events/${id}`)}
                className="flex-1 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50]/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#4CAF50] text-[#E0F2F1] hover:bg-[#388E3C]"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditEventForm;
