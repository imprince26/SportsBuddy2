import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { useEvents } from "@/hooks/useEvents";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ImagePlus,
  X,
  ChevronLeft,
  Trash2,
  AlertTriangle,
  Loader2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Event validation schema
const eventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  date: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Event date must be in the future",
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
  }),
  maxParticipants: z.number().min(2, "Minimum 2 participants").max(1000, "Maximum 1000 participants"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  eventType: z.enum(["casual", "tournament", "training"]),
  registrationFee: z.number().min(0, "Registration fee cannot be negative"),
  rules: z.array(z.string()).optional(),
  equipment: z.array(
    z.object({
      item: z.string(),
      required: z.boolean(),
    })
  ).optional(),
});

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, updateEvent, deleteEvent, loading } = useEvents();
  const [pageLoading, setPageLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newRule, setNewRule] = useState("");
  const [newEquipment, setNewEquipment] = useState({ item: "", required: false });

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
      equipment: [],
    },
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventData = await getEventById(id);
        if (eventData) {
          form.reset({
            name: eventData.name || "",
            category: eventData.category || "",
            description: eventData.description || "",
            date: eventData.date ? format(new Date(eventData.date), "yyyy-MM-dd") : "",
            time: eventData.time || "",
            location: eventData.location || {
              address: "",
              city: "",
              state: "",
            },
            maxParticipants: eventData.maxParticipants || 10,
            difficulty: eventData.difficulty || "Beginner",
            eventType: eventData.eventType || "casual",
            registrationFee: eventData.registrationFee || 0,
            rules: eventData.rules || [],
            equipment: eventData.equipment || [],
          });
          setExistingImages(eventData.images || []);
        } else {
          toast.error("Event not found");
        }
      } catch (error) {
        toast.error("Error fetching event details");
      } finally {
        setPageLoading(false);
      }
    };

    fetchEventDetails();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate total number of images
    if (files.length + newImages.length + existingImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
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

    setNewImages((prev) => [...prev, ...validFiles]);

    // Create preview URLs
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreview((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreview[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    setDeletedImages((prev) => [...prev, imageToRemove.public_id]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addRule = () => {
    if (newRule.trim()) {
      form.setValue("rules", [...form.getValues("rules"), newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (index) => {
    const updatedRules = form.getValues("rules").filter((_, i) => i !== index);
    form.setValue("rules", updatedRules);
  };

  const addEquipment = () => {
    if (newEquipment.item.trim()) {
      form.setValue("equipment", [
        ...form.getValues("equipment"),
        { item: newEquipment.item.trim(), required: newEquipment.required },
      ]);
      setNewEquipment({ item: "", required: false });
    }
  };

  const removeEquipment = (index) => {
    const updatedEquipment = form.getValues("equipment").filter((_, i) => i !== index);
    form.setValue("equipment", updatedEquipment);
  };

  const onSubmit = async (formData) => {
    try {
      const eventFormData = new FormData();

      // Append regular form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "location" || key === "rules" || key === "equipment") {
          eventFormData.append(key, JSON.stringify(value));
        } else {
          eventFormData.append(key, value);
        }
      });

      // Append existing images that weren't deleted
      if (existingImages.length > 0) {
        eventFormData.append('existingImages', JSON.stringify(existingImages));
      }

      // Append deleted image IDs
      if (deletedImages.length > 0) {
        eventFormData.append('deletedImages', JSON.stringify(deletedImages));
      }

      // Append new images
      if (newImages.length > 0) {
        newImages.forEach(image => {
          eventFormData.append('images', image);
        });
      }

      const result = await updateEvent(id, eventFormData);

      if (result.success) {
        toast.success('Event updated successfully');
        navigate(`/events/${id}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async () => {
    try {
      const result = await deleteEvent(id);
      if (result.success) {
        toast.success("Event deleted successfully");
        navigate("/events");
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-light dark:text-primary-dark" />
          <p className="mt-4 text-foreground-light dark:text-foreground-dark">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!form.getValues("name")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-card-light dark:bg-card-dark rounded-lg shadow-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive-light dark:text-destructive-dark mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
              Event Not Found
            </h2>
            <p className="text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
              The event you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <Link
              to="/events"
              className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-md hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
            >
              Back to Events
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center text-primary-light dark:text-primary-dark hover:underline"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Event
        </Link>
      </div>

      <Card className="bg-card-light dark:bg-card-dark rounded-lg shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
              Edit Event
            </h1>
            <Button
              variant="destructive"
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-2"
            >
              <Trash2 size={18} />
              <span>Delete Event</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter event name"
                            {...field}
                            className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Football">Football</SelectItem>
                            <SelectItem value="Basketball">Basketball</SelectItem>
                            <SelectItem value="Tennis">Tennis</SelectItem>
                            <SelectItem value="Running">Running</SelectItem>
                            <SelectItem value="Cycling">Cycling</SelectItem>
                            <SelectItem value="Swimming">Swimming</SelectItem>
                            <SelectItem value="Volleyball">Volleyball</SelectItem>
                            <SelectItem value="Cricket">Cricket</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your event"
                            rows={4}
                            {...field}
                            className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div>
                <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Date and Time
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date*</FormLabel>
                        <div className="relative">
                          <Calendar
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                            size={16}
                          />
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="pl-10 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time*</FormLabel>
                        <div className="relative">
                          <Clock
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                            size={16}
                          />
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="pl-10 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Location
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="location.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address*</FormLabel>
                        <div className="relative">
                          <MapPin
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                            size={16}
                          />
                          <FormControl>
                            <Input
                              placeholder="Enter address"
                              {...field}
                              className="pl-10 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter city"
                              {...field}
                              className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter state (optional)"
                              {...field}
                              className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div>
                <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Event Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Participants</FormLabel>
                        <div className="relative">
                          <Users
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground-light dark:text-muted-foreground-dark"
                            size={16}
                          />
                          <FormControl>
                            <Input
                              type="number"
                              min={2}
                              max={1000}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="pl-10 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="tournament">Tournament</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                          </SelectContent>
                        </Select>
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
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Event Images
                </h2>
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-md font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      Current Images
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Event ${index}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-destructive-light/90 dark:bg-destructive-dark/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-2 border-dashed border-input-light dark:border-input-dark rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground-light dark:text-muted-foreground-dark" />
                    <p className="mt-2 text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                      Drag and drop new images here, or click to select files
                    </p>
                    <p className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors cursor-pointer"
                  >
                    <ImagePlus size={16} className="mr-2" />
                    <span>Add Images</span>
                  </label>
                </div>
                {imagePreview.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-md font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      New Images to Add
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreview.map((src, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={src}
                            alt={`Preview ${index}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-destructive-light/90 dark:bg-destructive-dark/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rules */}
              <div>
                <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Rules (Optional)
                </h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Add a rule"
                    className="flex-1 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  />
                  <Button
                    type="button"
                    onClick={addRule}
                    disabled={!newRule.trim()}
                    className={`${!newRule.trim()
                        ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                        : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                      }`}
                  >
                    Add
                  </Button>
                </div>
                {form.getValues("rules")?.length > 0 ? (
                  <ul className="space-y-2">
                    {form.getValues("rules").map((rule, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md bg-background-light dark:bg-background-dark"
                      >
                        <span className="text-foreground-light dark:text-foreground-dark">{rule}</span>
                        <button
                          type="button"
                          onClick={() => removeRule(index)}
                          className="p-1 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-destructive-light dark:hover:text-destructive-dark transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                    No rules added yet
                  </p>
                )}
              </div>

              {/* Equipment */}
              <div>
                <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-4">
                  Equipment (Optional)
                </h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newEquipment.item}
                    onChange={(e) =>
                      setNewEquipment((prev) => ({ ...prev, item: e.target.value }))
                    }
                    placeholder="Add equipment"
                    className="flex-1 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="equipment-required"
                      checked={newEquipment.required}
                      onChange={(e) =>
                        setNewEquipment((prev) => ({ ...prev, required: e.target.checked }))
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor="equipment-required"
                      className="text-sm text-foreground-light dark:text-foreground-dark"
                    >
                      Required
                    </label>
                  </div>
                  <Button
                    type="button"
                    onClick={addEquipment}
                    disabled={!newEquipment.item.trim()}
                    className={`${!newEquipment.item.trim()
                        ? "bg-muted-light dark:bg-muted-dark text-muted-foreground-light dark:text-muted-foreground-dark cursor-not-allowed"
                        : "bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90"
                      }`}
                  >
                    Add
                  </Button>
                </div>
                {form.getValues("equipment")?.length > 0 ? (
                  <ul className="space-y-2">
                    {form.getValues("equipment").map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md bg-background-light dark:bg-background-dark"
                      >
                        <div className="flex items-center">
                          <span className="text-foreground-light dark:text-foreground-dark">
                            {item.item}
                          </span>
                          {item.required && (
                            <span className="ml-2 text-xs bg-destructive-light/20 dark:bg-destructive-dark/20 text-destructive-light dark:text-destructive-dark px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEquipment(index)}
                          className="p-1 text-muted-foreground-light dark:text-muted-foreground-dark hover:text-destructive-light dark:hover:text-destructive-dark transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                    No equipment added yet
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white mr-2"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Update Event"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="bg-card-light dark:bg-card-dark">
          <DialogHeader>
            <DialogTitle className="flex items-center text-foreground-light dark:text-foreground-dark">
              <AlertTriangle className="mr-2 text-destructive-light dark:text-destructive-dark" size={24} />
              Delete Event
            </DialogTitle>
            <DialogDescription className="text-foreground-light dark:text-foreground-dark">
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDelete(false)}
              className="border-input-light dark:border-input-dark text-foreground-light dark:text-foreground-dark hover:bg-muted-light dark:hover:bg-muted-dark"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditEvent;