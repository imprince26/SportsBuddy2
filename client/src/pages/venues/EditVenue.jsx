import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Building2,
  Camera,
  CheckCircle,
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  Save,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useVenue } from '@/hooks/useVenue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const SPORTS = [
  'Football',
  'Basketball',
  'Tennis',
  'Running',
  'Cycling',
  'Swimming',
  'Volleyball',
  'Cricket',
  'Hockey',
  'Athletics',
  'Badminton',
  'Gymnastics',
  'Other',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_AMENITIES = ['Parking', 'Changing Rooms', 'Showers', 'Floodlights', 'First Aid', 'Cafeteria'];

const emptyForm = {
  name: '',
  description: '',
  location: {
    address: '',
    city: '',
    state: '',
    country: 'India',
    coordinates: {
      type: 'Point',
      coordinates: [0, 0],
    },
  },
  sports: [],
  amenities: DEFAULT_AMENITIES.map((name) => ({ name, available: false })),
  capacity: '',
  pricing: {
    hourlyRate: '',
    dayRate: '',
    currency: 'INR',
  },
  availability: DAYS.map((day) => ({ day, openTime: '06:00', closeTime: '22:00', isOpen: true })),
  contactInfo: {
    phone: '',
    email: '',
    website: '',
  },
  isActive: true,
};

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentVenue, getVenueById, updateVenue, loading } = useVenue();

  const [formData, setFormData] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const imagePreviewsRef = useRef([]);
  const [initializing, setInitializing] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const canManage = useMemo(() => {
    const userId = user?._id || user?.id;
    const ownerId = currentVenue?.owner?._id || currentVenue?.owner;
    return Boolean(userId && currentVenue && (user?.role === 'admin' || ownerId === userId));
  }, [currentVenue, user]);

  useEffect(() => {
    const loadVenue = async () => {
      const venue = await getVenueById(id);
      if (!venue) {
        toast.error('Venue not found');
        navigate('/venues');
        return;
      }

      const knownAmenities = [...new Set([...DEFAULT_AMENITIES, ...(venue.amenities || []).map((item) => item.name).filter(Boolean)])];
      const existingAvailability = venue.availability || [];

      setFormData({
        name: venue.name || '',
        description: venue.description || '',
        location: {
          address: venue.location?.address || '',
          city: venue.location?.city || '',
          state: venue.location?.state || '',
          country: venue.location?.country || 'India',
          coordinates: venue.location?.coordinates || emptyForm.location.coordinates,
        },
        sports: venue.sports || [],
        amenities: knownAmenities.map((name) => ({
          name,
          available: Boolean(venue.amenities?.find((item) => item.name === name)?.available),
        })),
        capacity: venue.capacity || '',
        pricing: {
          hourlyRate: venue.pricing?.hourlyRate ?? '',
          dayRate: venue.pricing?.dayRate ?? '',
          currency: venue.pricing?.currency || 'INR',
        },
        availability: DAYS.map((day) => {
          const saved = existingAvailability.find((item) => item.day === day);
          return saved || { day, openTime: '06:00', closeTime: '22:00', isOpen: true };
        }),
        contactInfo: {
          phone: venue.contactInfo?.phone || '',
          email: venue.contactInfo?.email || '',
          website: venue.contactInfo?.website || '',
        },
        isActive: venue.isActive !== false,
      });
      setExistingImages(venue.images || []);
      setInitializing(false);
    };

    loadVenue();
  }, [id]);

  useEffect(() => {
    if (!initializing && currentVenue && !canManage) {
      toast.error('You are not authorized to edit this venue');
      navigate(`/venues/${id}`);
    }
  }, [canManage, currentVenue, id, initializing, navigate]);

  useEffect(() => {
    imagePreviewsRef.current = imagePreviews;
  }, [imagePreviews]);

  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const toggleSport = (sport) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter((item) => item !== sport)
        : [...prev.sports, sport],
    }));
  };

  const toggleAmenity = (name, available) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.map((item) => (item.name === name ? { ...item, available } : item)),
    }));
  };

  const updateAvailability = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.map((item) => (item.day === day ? { ...item, [field]: value } : item)),
    }));
  };

  const handleFiles = (files) => {
    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      toast.error('Maximum 5 venue images allowed');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} must be a JPG, PNG, or WebP image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    setNewImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))]);
  };

  const handleImageChange = (event) => {
    handleFiles(Array.from(event.target.files || []));
    event.target.value = '';
  };

  const removeExistingImage = (image) => {
    setExistingImages((prev) => prev.filter((item) => item.url !== image.url));
    setDeletedImages((prev) => [...prev, image.url]);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setNewImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    setImagePreviews((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(event.dataTransfer.files || []));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Venue name is required';
    if (!formData.description.trim()) return 'Venue description is required';
    if (!formData.location.address.trim()) return 'Address is required';
    if (!formData.location.city.trim()) return 'City is required';
    if (!formData.location.country.trim()) return 'Country is required';
    if (formData.sports.length === 0) return 'Select at least one sport';
    if (Number(formData.capacity) < 1) return 'Capacity must be at least 1';
    if (Number(formData.pricing.hourlyRate) < 0 || Number(formData.pricing.dayRate) < 0) return 'Rates cannot be negative';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      pricing: {
        ...formData.pricing,
        hourlyRate: Number(formData.pricing.hourlyRate) || 0,
        dayRate: Number(formData.pricing.dayRate) || 0,
      },
      amenities: formData.amenities.filter((item) => item.name.trim()),
      images: newImages,
      deletedImages,
    };

    const result = await updateVenue(id, payload);
    if (result.success) {
      navigate(`/venues/${id}`);
    }
  };

  if (initializing || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading venue editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/15 via-background to-blue-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.14),transparent_35%)]" />
        <div className="container relative mx-auto px-4 py-10 lg:py-14">
          <Button variant="ghost" asChild className="mb-6 gap-2">
            <Link to={`/venues/${id}`}>
              <ArrowLeft className="h-4 w-4" /> Back to venue
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Badge className="w-fit gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary hover:bg-primary/10">
                <Shield className="h-4 w-4" /> Owner controls
              </Badge>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">Edit Venue</h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Keep the listing accurate for bookings, events, and venue discovery.
                </p>
              </div>
            </motion.div>

            <Card className="rounded-3xl border-border/60 bg-card/80 shadow-xl backdrop-blur">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Editing</p>
                  <p className="font-semibold text-foreground">{currentVenue?.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Venue basics</CardTitle>
              <CardDescription>Name, description, location, and booking rates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Venue name</Label>
                  <Input id="name" value={formData.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Stadium or turf name" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(event) => updateField('description', event.target.value)} rows={5} placeholder="Describe surfaces, stands, lighting, and match-day experience" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.location.address} onChange={(event) => updateNestedField('location', 'address', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.location.city} onChange={(event) => updateNestedField('location', 'city', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={formData.location.state} onChange={(event) => updateNestedField('location', 'state', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={formData.location.country} onChange={(event) => updateNestedField('location', 'country', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" min="1" value={formData.capacity} onChange={(event) => updateField('capacity', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly rate</Label>
                  <Input id="hourlyRate" type="number" min="0" value={formData.pricing.hourlyRate} onChange={(event) => updateNestedField('pricing', 'hourlyRate', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayRate">Day rate</Label>
                  <Input id="dayRate" type="number" min="0" value={formData.pricing.dayRate} onChange={(event) => updateNestedField('pricing', 'dayRate', event.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Sports and amenities</CardTitle>
              <CardDescription>Choose what athletes can play and what facilities are available.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Supported sports</Label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.map((sport) => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => toggleSport(sport)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                        formData.sports.includes(sport)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:bg-secondary'
                      )}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {formData.amenities.map((amenity) => (
                  <label key={amenity.name} className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
                    <span className="text-sm font-medium">{amenity.name}</span>
                    <Checkbox checked={amenity.available} onCheckedChange={(checked) => toggleAmenity(amenity.name, Boolean(checked))} />
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Weekly availability</CardTitle>
              <CardDescription>Set the normal booking window for each day.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.availability.map((day) => (
                <div key={day.day} className="grid gap-3 rounded-2xl border border-border/60 p-3 sm:grid-cols-[1fr_120px_120px_auto] sm:items-center">
                  <div className="font-medium">{day.day}</div>
                  <Input type="time" value={day.openTime || ''} disabled={!day.isOpen} onChange={(event) => updateAvailability(day.day, 'openTime', event.target.value)} />
                  <Input type="time" value={day.closeTime || ''} disabled={!day.isOpen} onChange={(event) => updateAvailability(day.day, 'closeTime', event.target.value)} />
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm text-muted-foreground">Open</span>
                    <Switch checked={Boolean(day.isOpen)} onCheckedChange={(checked) => updateAvailability(day.day, 'isOpen', checked)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> Venue images</CardTitle>
              <CardDescription>Images are uploaded through Cloudinary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label
                onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-colors',
                  dragActive ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 hover:bg-secondary/60'
                )}
              >
                <ImagePlus className="mb-3 h-8 w-8 text-primary" />
                <span className="font-medium">Drop images or browse</span>
                <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB. Maximum 5 images.</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageChange} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                {existingImages.map((image) => (
                  <div key={image.url} className="group relative overflow-hidden rounded-2xl border border-border/60">
                    <img src={image.url} alt="Venue" className="h-28 w-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(image)} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {imagePreviews.map((preview, index) => (
                  <div key={preview} className="group relative overflow-hidden rounded-2xl border border-primary/40">
                    <img src={preview} alt="New venue" className="h-28 w-full object-cover" />
                    <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">New</Badge>
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/60">
            <CardHeader>
              <CardTitle>Contact and status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.contactInfo.phone} onChange={(event) => updateNestedField('contactInfo', 'phone', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.contactInfo.email} onChange={(event) => updateNestedField('contactInfo', 'email', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={formData.contactInfo.website} onChange={(event) => updateNestedField('contactInfo', 'website', event.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">Active listing</p>
                  <p className="text-xs text-muted-foreground">Visible in venue discovery</p>
                </div>
                <Switch checked={formData.isActive} onCheckedChange={(checked) => updateField('isActive', checked)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => navigate(`/venues/${id}`)}>
              <Trash2 className="h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-primary" /> Changes apply immediately after saving.
          </div>
        </aside>
      </form>
    </div>
  );
};

export default EditVenue;
