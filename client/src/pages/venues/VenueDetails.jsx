import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  MapPin,
  Star,
  Users,
  Clock,
  Phone,
  Globe,
  CheckCircle,
  Calendar as CalendarIcon,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Mail,
  Sparkles,
  MessageSquare,
  Send,
  Copy,
  ImageIcon,
  Edit3,
  Trash2,
  MoreVertical,
  IndianRupee,
} from 'lucide-react';
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdStadium } from "react-icons/md";
import { useVenue } from '@/hooks/useVenue';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useMetadata } from '@/hooks/useMetadata';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentVenue,
    loading,
    getVenueById,
    toggleVenueFavorite,
    favoriteVenues,
    addVenueReview,
    deleteVenue
  } = useVenue();
  const { user } = useAuth();
  const { getEvents } = useEvents();

  const [activeImage, setActiveImage] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [venueEvents, setVenueEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useMetadata(currentVenue ? { venue: currentVenue } : {})

  useEffect(() => {
    if (id) {
      getVenueById(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchVenueEvents = async () => {
      if (!id) return;
      setEventsLoading(true);
      try {
        const result = await getEvents({ venue: id }, 1);
        if (result) {
          setVenueEvents(result);
        }
      } catch (error) {
        console.error('Error fetching venue events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchVenueEvents();
  }, [id]);

  const isFavorite = favoriteVenues.includes(id);

  const nextImage = () => {
    if (currentVenue?.images?.length > 0) {
      setActiveImage((prev) => (prev + 1) % currentVenue.images.length);
    }
  };

  const prevImage = () => {
    if (currentVenue?.images?.length > 0) {
      setActiveImage((prev) =>
        prev === 0 ? currentVenue.images.length - 1 : prev - 1
      );
    }
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error('Please login to book a venue');
      return;
    }
    navigate(`/venues/${id}/book`);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to add a review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    const result = await addVenueReview(id, rating, review);
    if (result.success) {
      setShowRatingDialog(false);
      setRating(0);
      setReview('');
      getVenueById(id);
    }
  };

  const handleDeleteVenue = async () => {
    const result = await deleteVenue(id);
    if (result.success) {
      setShowDeleteDialog(false);
      navigate('/venues');
    }
  };

  const handleShare = async (platform) => {
    const venueUrl = window.location.href;
    const venueDescription = `Check out ${currentVenue?.name} - ${currentVenue?.location?.address}, ${currentVenue?.location?.city}`;

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(venueUrl);
          toast.success('Link copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy link');
        }
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(venueUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(venueUrl)}&text=${encodeURIComponent(venueDescription)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${venueDescription} - ${venueUrl}`)}`, '_blank');
        break;
    }
    setShowShareDialog(false);
  };

  const canManage = user && (user.role === 'admin' || currentVenue?.owner?._id === user.id);

  if (loading || !currentVenue) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[50vh] w-full" />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image Gallery */}
      <div className="relative h-[45vh] lg:h-[55vh] bg-muted overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={currentVenue.images?.length > 0 ? currentVenue.images?.[activeImage]?.url : '/venues/default-venue.png'}
              alt={`${currentVenue.name} - Image ${activeImage + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {currentVenue.images?.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all border border-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-28 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 hidden sm:flex gap-2">
              {currentVenue.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(idx); }}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    idx === activeImage
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  )}
                />
              ))}
            </div>

            {/* View All Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowImageGallery(true); }}
              className="absolute bottom-28 sm:bottom-8 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white transition-all border border-white/10"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{currentVenue.images.length} Photos</span>
            </button>
          </>
        )}

        {/* Back Button */}
        {/* Top Actions: Back on Left, Others on Right */}
        <div className="absolute top-4 left-0 right-0 px-4 sm:px-6 z-40 flex items-start justify-between pointer-events-none">
          <div className="pointer-events-auto">
            <Link to="/venues">
              <Button size="sm" className="rounded-full shadow-lg backdrop-blur-md bg-black/30 hover:bg-black/50 text-white border border-white/20 transition-all hover:scale-105">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-end items-center gap-2 pointer-events-auto max-w-[70%]">
            <Button
              size="icon"
              className={cn(
                "rounded-full w-10 h-10 shadow-lg backdrop-blur-md border border-white/20 transition-all hover:scale-105",
                isFavorite ? "bg-primary text-primary-foreground" : "bg-black/30 text-white hover:bg-black/50"
              )}
              onClick={() => toggleVenueFavorite(id)}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </Button>

            {user && (
              <Button
                size="sm"
                className="hidden sm:flex rounded-full h-10 px-5 shadow-lg backdrop-blur-md bg-black/30 hover:bg-black/50 text-white border border-white/20 transition-all hover:scale-105 items-center justify-center"
                onClick={() => setShowRatingDialog(true)}
              >
                <Star className="w-4 h-4 mr-1.5" /> Rate
              </Button>
            )}

            {user && (
              <Button
                size="icon"
                className="flex sm:hidden rounded-full w-10 h-10 shadow-lg backdrop-blur-md bg-black/30 hover:bg-black/50 text-white border border-white/20 transition-all hover:scale-105"
                onClick={() => setShowRatingDialog(true)}
              >
                <Star className="w-4 h-4" />
              </Button>
            )}

            <Button
              size="icon"
              className="rounded-full w-10 h-10 shadow-lg backdrop-blur-md bg-black/30 hover:bg-black/50 text-white border border-white/20 transition-all hover:scale-105"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${currentVenue.name} ${currentVenue.location?.address} ${currentVenue.location?.city}`)}`, '_blank')}
              title="Get Directions"
            >
              <MapPin className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              className="rounded-full w-10 h-10 shadow-lg backdrop-blur-md bg-black/30 hover:bg-black/50 text-white border border-white/20 transition-all hover:scale-105"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="w-4 h-4" />
            </Button>

            {canManage && (
              <>
                <Button
                  size="icon"
                  className="rounded-full w-10 h-10 shadow-lg backdrop-blur-md bg-black/30 hover:bg-blue-600/50 text-white border border-white/20 transition-all hover:scale-105"
                  onClick={() => navigate(`/admin/venues/${id}/edit`)}
                  title="Edit Venue"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  className="rounded-full w-10 h-10 shadow-lg backdrop-blur-md bg-black/30 hover:bg-destructive/50 text-white border border-white/20 transition-all hover:scale-105"
                  onClick={() => setShowDeleteDialog(true)}
                  title="Delete Venue"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Venue Info Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10 z-30">
          <div className="container mx-auto">
            <div className="max-w-4xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {currentVenue.isVerified && (
                  <Badge className="bg-primary text-primary-foreground border-0 h-7 px-3 text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verified
                  </Badge>
                )}
                {currentVenue.sports?.map((sport, idx) => (
                  <Badge key={idx} variant="outline" className="text-white border-white/30 bg-black/30 backdrop-blur-sm h-7 px-3 text-xs">
                    {sport}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl">
                  {currentVenue.name}
                </h1>
                <div className="flex items-center text-white/90 text-sm sm:text-lg font-medium">
                  <MapPin className="w-5 h-5 mr-2 text-primary flex-shrink-0" />
                  <span className="drop-shadow-md">{currentVenue.location?.address}, {currentVenue.location?.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {[
                { label: 'Rating', value: currentVenue.averageRating || '0', sub: `${currentVenue.ratings?.length || 0} Reviews`, icon: Star },
                { label: 'Capacity', value: currentVenue.capacity, sub: 'People', icon: Users },
                { label: 'Bookings', value: currentVenue.totalBookings || 0, sub: 'Total', icon: CalendarIcon },
                { label: 'Per Hour', value: `₹${currentVenue.pricing?.hourlyRate || 0}`, sub: 'Starting', icon: IndianRupee },
              ].map((stat, i) => (
                <Card key={i} className="border-border bg-card hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-2">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.sub}</span>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto overflow-x-auto">
                {['about', 'events', 'amenities', 'reviews'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-4 sm:px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary capitalize"
                  >
                    {tab} {tab === 'events' && `(${venueEvents.length})`}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="about" className="pt-6 space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{currentVenue.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Opening Hours */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Opening Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {currentVenue.availability?.map((slot, idx) => (
                        <div key={idx} className="flex justify-between py-2 border-b border-border last:border-0">
                          <span className="text-muted-foreground">{slot.day}</span>
                          <span className="font-medium">{slot.openTime} - {slot.closeTime}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        Contact Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {currentVenue.contactInfo?.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-primary" />
                          <a href={`tel:${currentVenue.contactInfo.phone}`} className="text-foreground hover:text-primary">{currentVenue.contactInfo.phone}</a>
                        </div>
                      )}
                      {currentVenue.contactInfo?.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-primary" />
                          <a href={`mailto:${currentVenue.contactInfo.email}`} className="text-foreground hover:text-primary">{currentVenue.contactInfo.email}</a>
                        </div>
                      )}
                      {currentVenue.contactInfo?.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-primary" />
                          <a href={currentVenue.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Visit Website</a>
                        </div>
                      )}
                      <div className="flex items-start gap-3 pt-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        <span className="text-muted-foreground">{currentVenue.location?.address}, {currentVenue.location?.city}, {currentVenue.location?.state}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="events" className="pt-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  Events at This Venue
                </h3>
                {eventsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-lg" />)}
                  </div>
                ) : venueEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {venueEvents.map(event => (
                      <Link key={event._id} to={`/events/${event._id}`}>
                        <Card className="hover:border-primary/30 transition-all group border-border overflow-hidden">
                          {event.images?.[0] && (
                            <div className="h-32 overflow-hidden">
                              <img src={event.images[0]} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{event.name}</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-primary" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <span>{event.participants?.length || 0} / {event.maxParticipants}</span>
                              </div>
                            </div>
                            <Badge className="mt-2 bg-primary/10 text-primary border-0">{event.category}</Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <MdStadium className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg">No events hosted yet</p>
                      <p className="text-sm text-muted-foreground mt-2">Be the first to create an event here!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="amenities" className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentVenue.amenities?.map((amenity, idx) => {
                    const name = typeof amenity === 'string' ? amenity : amenity.name;
                    const available = typeof amenity === 'string' ? true : amenity.available;
                    return (
                      <div key={idx} className={cn(
                        "flex items-center p-3 rounded-xl border",
                        available ? "border-border bg-card" : "border-border bg-muted/50 opacity-60"
                      )}>
                        <CheckCircle className={cn("w-5 h-5 mr-3", available ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm">{name}</span>
                        {!available && <Badge variant="outline" className="ml-auto text-xs">N/A</Badge>}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-6 space-y-4">
                {user && (
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => setShowRatingDialog(true)}>
                    <Star className="w-4 h-4 mr-2" /> Write a Review
                  </Button>
                )}

                {currentVenue.ratings?.length > 0 ? (
                  <div className="space-y-4">
                    {currentVenue.ratings.map((rev, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="border-border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={rev.user?.avatar?.url || rev.user?.avatar} />
                                  <AvatarFallback className="bg-primary/10 text-primary">{rev.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold text-sm">{rev.user?.name || 'Anonymous'}</h4>
                                  <p className="text-xs text-muted-foreground">{format(new Date(rev.date), 'MMM dd, yyyy')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg">
                                <Star className="w-4 h-4 text-primary fill-primary" />
                                <span className="font-bold text-primary">{rev.rating}</span>
                              </div>
                            </div>
                            {rev.review && <p className="text-sm text-muted-foreground">{rev.review}</p>}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No reviews yet</p>
                      <p className="text-sm text-muted-foreground mt-2">Be the first to share your experience!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Booking Card */}
              <Card className="border-border overflow-hidden">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
                  <p className="text-sm font-medium opacity-90">Best Price</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-bold">₹{currentVenue.pricing?.hourlyRate}</span>
                    <span className="opacity-80">/hour</span>
                  </div>
                  {currentVenue.pricing?.dayRate && (
                    <p className="text-sm opacity-75 mt-2">Day rate: ₹{currentVenue.pricing.dayRate}</p>
                  )}
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3 text-sm">
                    {['Instant Confirmation', 'Flexible Cancellation', 'Cash Payment'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full h-12 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleBookNow}>
                    <CalendarIcon className="w-5 h-5 mr-2" /> Book This Venue
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure booking with cash payment on arrival
                  </p>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    Contact Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {currentVenue.contactInfo?.phone && (
                    <a href={`tel:${currentVenue.contactInfo.phone}`} className="flex items-center gap-3 text-primary hover:underline">
                      <Phone className="w-4 h-4" /> {currentVenue.contactInfo.phone}
                    </a>
                  )}
                  {currentVenue.contactInfo?.email && (
                    <a href={`mailto:${currentVenue.contactInfo.email}`} className="flex items-center gap-3 text-primary hover:underline">
                      <Mail className="w-4 h-4" /> {currentVenue.contactInfo.email}
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Rate Your Experience
            </DialogTitle>
            <DialogDescription>Share your experience with {currentVenue.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium">How would you rate this venue?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={cn("w-8 h-8", star <= (hoveredRating || rating) ? 'fill-primary text-primary' : 'text-muted-foreground')} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Review (Optional)</label>
              <Textarea placeholder="Share your experience..." value={review} onChange={(e) => setReview(e.target.value)} rows={4} className="resize-none" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setShowRatingDialog(false); setRating(0); setReview(''); }}>Cancel</Button>
              <Button className="flex-1" onClick={handleSubmitReview} disabled={rating === 0}>
                <Send className="w-4 h-4 mr-2" /> Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Venue Photos ({currentVenue.images?.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[70vh] p-4">
            {currentVenue.images?.map((image, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={cn("relative aspect-square rounded-lg overflow-hidden cursor-pointer group", idx === activeImage && "ring-2 ring-primary")}
                onClick={() => { setActiveImage(idx); setShowImageGallery(false); }}
              >
                <img src={image.url} alt={`${currentVenue.name} - ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </motion.div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Share Venue
            </DialogTitle>
            <DialogDescription>Share {currentVenue.name} with friends</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { id: 'copy', label: 'Copy Link', icon: Copy, color: 'bg-primary/10', iconColor: 'text-primary' },
              { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: 'bg-green-500', iconColor: 'text-white' },
              { id: 'facebook', label: 'Facebook', icon: FaFacebook, color: 'bg-blue-600', iconColor: 'text-white' },
              { id: 'twitter', label: 'X (Twitter)', icon: FaXTwitter, color: 'bg-black', iconColor: 'text-white' },
            ].map((item) => (
              <Button key={item.id} onClick={() => handleShare(item.id)} variant="outline" className="flex flex-col items-center gap-2 h-24 hover:bg-primary/5">
                <div className={cn("p-2 rounded-full", item.color)}>
                  <item.icon className={cn("w-5 h-5", item.iconColor)} />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" /> Delete Venue
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentVenue?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteVenue}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenueDetails;
