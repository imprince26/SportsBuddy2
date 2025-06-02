import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { useEvents } from "@/hooks/useEvents";
import {
  Calendar,
  CalendarIcon,
  Users,
  DollarSign,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ImageIcon,
  X,
  Plus
} from "lucide-react";
import { 
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Card,
  CardHeader,
  CardContent
} from "@/components/ui";

// Event validation schema
const eventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
  date: z.string().refine(date => new Date(date) > new Date(), {
    message: "Event date must be in the future"
  }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional()
  }),
  maxParticipants: z.number().min(2).max(1000),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  eventType: z.enum(["casual", "competitive", "training"]),
  registrationFee: z.number().min(0),
  rules: z.array(z.string()).optional(),
  equipment: z.array(z.object({
    item: z.string(),
    required: z.boolean()
  })).optional()
});

const CreateEventForm = () => {
  const navigate = useNavigate();
  const { createEvent } = useEvents();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
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
        state: ""
      },
      maxParticipants: 10,
      difficulty: "Beginner",
      eventType: "casual",
      registrationFee: 0,
      rules: [],
      equipment: []
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Append form data
      Object.keys(data).forEach(key => {
        if (key === 'location') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Append images
      images.forEach(image => {
        formData.append('images', image);
      });

      const result = await createEvent(formData);

      if (result.success) {
        toast.success("Event created successfully!");
        navigate(`/events/${result.event._id}`);
      } else {
        throw new Error(result.message || "Failed to create event");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

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

    if (validFiles.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreview[index]);
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          to="/events"
          className="inline-flex items-center text-primary hover:underline"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Events
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold">Create New Event</h1>
            <p className="text-muted-foreground mt-2">
              Fill in the details for your upcoming sports event
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              "Volleyball",
                              "Badminton",
                              "Running",
                              "Cycling",
                              "Swimming",
                              "Yoga",
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

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <h2 className="text-xl font-semibold">Date and Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h2 className="text-xl font-semibold">Location</h2>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h2 className="text-xl font-semibold">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h2 className="text-xl font-semibold">Event Images</h2>
                <div className="border-2 border-dashed rounded-lg p-6">
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
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drop images here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (Max 5 images, up to 5MB each)
                    </p>
                  </label>
                </div>

                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {imagePreview.map((src, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⭕</span>
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEventForm;