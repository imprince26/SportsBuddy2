import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { useVenue } from '@/hooks/useVenue';
import {
  Building2, MapPin, Phone, Globe, Clock, Users, DollarSign, 
  Upload, X, Plus, CheckCircle, ArrowLeft, Image as ImageIcon, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const venueSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  sports: z.array(z.string()).min(1, 'Select at least one sport'),
  location: z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  }),
  contactInfo: z.object({
    phone: z.string().min(10, 'Valid phone number required'),
    email: z.string().email('Valid email required').optional(),
    website: z.string().url().optional().or(z.literal('')),
  }),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  pricePerHour: z.number().min(0, 'Price cannot be negative'),
  amenities: z.array(z.string()),
  availability: z.array(z.object({
    day: z.string(),
    openTime: z.string(),
    closeTime: z.string(),
    isOpen: z.boolean(),
  })),
});

const sportsOptions = [
  'Football', 'Basketball', 'Tennis', 'Cricket', 'Volleyball', 
  'Badminton', 'Swimming', 'Running', 'Cycling', 'Other'
];

const amenitiesOptions = [
  'Parking', 'Changing Rooms', 'Showers', 'First Aid', 
  'Refreshments', 'Wi-Fi', 'Equipment Rental', 'Lockers',
  'Air Conditioning', 'Floodlights', 'CCTV', 'Seating Area'
];

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const EditVenue = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getVenueById, updateVenue, loading } = useVenue();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [venueLoading, setVenueLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: '',
      description: '',
      sports: [],
      location: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      contactInfo: {
        phone: '',
        email: '',
        website: '',
      },
      capacity: 0,
      pricePerHour: 0,
      amenities: [],
      availability: daysOfWeek.map(day => ({
        day,
        openTime: '09:00',
        closeTime: '21:00',
        isOpen: true,
      })),
    },
  });

  // Fetch venue data on mount
  useEffect(() => {
    const loadVenue = async () => {
      const venueData = await getVenueById(id);
      
      if (venueData) {
        // Populate form with existing data
        form.reset({
          name: venueData.name || '',
          description: venueData.description || '',
          sports: venueData.sports || [],
          location: {
            address: venueData.location?.address || '',
            city: venueData.location?.city || '',
            state: venueData.location?.state || '',
            zipCode: venueData.location?.zipCode || '',
            coordinates: venueData.location?.coordinates || {},
          },
          contactInfo: {
            phone: venueData.contactInfo?.phone || '',
            email: venueData.contactInfo?.email || '',
            website: venueData.contactInfo?.website || '',
          },
          capacity: venueData.capacity || 0,
          pricePerHour: venueData.pricePerHour || 0,
          amenities: venueData.amenities || [],
          availability: venueData.availability || daysOfWeek.map(day => ({
            day,
            openTime: '09:00',
            closeTime: '21:00',
            isOpen: true,
          })),
        });

        // Set existing images
        if (venueData.images && venueData.images.length > 0) {
          setExistingImages(venueData.images.map(img => ({
            url: img.url || img,
            publicId: img.publicId || null
          })));
        }
      } else {
        toast.error('Venue not found');
        navigate('/admin/venues');
      }
      setVenueLoading(false);
    };

    loadVenue();
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length + existingImages.length - deletedImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;

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

    setImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setDeletedImages(prev => [...prev, imageToDelete.publicId || imageToDelete.url]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (existingImages.length + images.length === 0) {
      toast.error('Please have at least one image');
      return;
    }

    const formData = {
      ...data,
      images,
      deletedImages,
    };

    const result = await updateVenue(id, formData);
    
    if (result.success) {
      navigate('/admin/venues');
    }
  };

  if (venueLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading venue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/venues')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venues
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Venue</h1>
              <p className="text-muted-foreground">Update venue information</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter venue name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the venue, facilities, and features..." 
                          rows={5}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sports"
                  render={() => (
                    <FormItem>
                      <FormLabel>Sports Available *</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sportsOptions.map((sport) => (
                          <FormField
                            key={sport}
                            control={form.control}
                            name="sports"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(sport)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, sport])
                                        : field.onChange(field.value?.filter((value) => value !== sport))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {sport}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="location.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
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
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location.zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Zip code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="contactInfo.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="venue@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Capacity & Pricing */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Capacity & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Capacity *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="50" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Maximum number of people</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Hour *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Hourly rental price</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Amenities & Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {amenitiesOptions.map((amenity) => (
                          <FormField
                            key={amenity}
                            control={form.control}
                            name="amenities"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(amenity)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, amenity])
                                        : field.onChange(field.value?.filter((value) => value !== amenity))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {amenity}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  Venue Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Current Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="venue-images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="venue-images"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload new images (Max 10 total, 5MB each)
                    </p>
                  </label>
                </div>

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">New Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`New Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/venues')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Updating...' : 'Update Venue'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditVenue;
