import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  AlertCircle,
  ImagePlus,
  X,
  ChevronLeft,
  Trash2
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Event validation schema (assuming it's imported from your validation utils)
import { eventSchema } from "@/utils/validation";

const EditEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, updateEvent, deleteEvent } = useEvents();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      category: "",
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
      eventType: "casual",
      registrationFee: 0,
      rules: [],
      equipment: []
    },
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await getEventById(id);
        if (!eventData) {
          toast.error("Event not found");
          navigate("/events");
          return;
        }

        // Check authorization
        setIsAuthorized(
          eventData.createdBy._id === user.id || user.role === "admin"
        );

        // Set existing images
        setExistingImages(eventData.images || []);

        // Reset form with event data
        form.reset({
          name: eventData.name,
          category: eventData.category,
          description: eventData.description,
          date: new Date(eventData.date).toISOString().split("T")[0],
          time: eventData.time,
          location: {
            address: eventData.location.address,
            city: eventData.location.city,
            state: eventData.location.state || "",
          },
          maxParticipants: eventData.maxParticipants,
          difficulty: eventData.difficulty,
          eventType: eventData.eventType,
          registrationFee: eventData.registrationFee || 0,
          rules: eventData.rules || [],
          equipment: eventData.equipment || []
        });
      } catch (error) {
        toast.error("Error fetching event details");
        navigate("/events");
      }
    };

    fetchEventDetails();
  }, [id, getEventById, navigate, user.id, user.role, form]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast.error(`${file.name} is not a supported image type`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length + existingImages.length + newImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setNewImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };
  const onSubmit = async (data) => {
    try {
      console.log("Submitting data:", data);
      setIsLoading(true);

      await updateEvent(id, data);

      toast.success("Event updated successfully!");
      navigate(`/events/${id}`);
    } catch (error) {
      toast.error(error.message || "Failed to update event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setIsLoading(true);
      await deleteEvent(id);
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <h2 className="mt-4 text-2xl font-semibold">Access Denied</h2>
              <p className="mt-2 text-muted-foreground">
                You are not authorized to edit this event.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/events")}
              >
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/events/${id}`)}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>

        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="flex items-center"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-2xl font-semibold">Edit Event</h1>
            <p className="text-sm text-muted-foreground">
              Update your event details below
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Basic Information</h2>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Category Select */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "Basketball",
                              "Football",
                              "Cricket",
                              "Tennis",
                              "Running",
                              "Cycling",
                              "Swimming",
                              "Volleyball",
                              "Other"
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

                  {/* Difficulty Select */}
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["Beginner", "Intermediate", "Advanced"].map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your event..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Date and Time</h2>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Event Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Location</h2>
                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
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
                        <FormLabel>State (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Event Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Participants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={2}
                            max={1000}
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
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
                        <FormLabel>Registration Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Event Images</h2>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={image.public_id} className="relative group">
                        <img
                          src={image.url}
                          alt={`Event ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Images Upload */}
                <div className="border-2 border-dashed rounded-lg p-4">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to upload new images
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Maximum 5 images (JPEG, PNG, or WebP)
                    </p>
                  </label>
                </div>

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/events/${id}`)}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and remove all data associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditEventForm;