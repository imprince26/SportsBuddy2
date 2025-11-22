import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Shield,
  Trophy,
  Mail,
  DollarSign,
  Award,
  Sparkles,
  MessageSquare,
  Send,
  Copy,
  ImageIcon,
  X
} from 'lucide-react';
import { useVenue } from '@/hooks/useVenue';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
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
} from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentVenue, 
    loading, 
    getVenueById, 
    toggleVenueFavorite, 
    favoriteVenues,
    addVenueReview
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

  useEffect(() => {
    if (id) {
      getVenueById(id);
    }
  }, [id]);

  // Fetch events for this venue
  useEffect(() => {
    const fetchVenueEvents = async () => {
      if (!id) return;
      setEventsLoading(true);
      try {
        // Fetch events with venue filter
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
      // Refresh venue data
      getVenueById(id);
    }
  };

  const handleShare = async (platform) => {
    const venueUrl = window.location.href;
    const venueTitle = currentVenue?.name || 'Sports Venue';
    const venueDescription = `Check out ${currentVenue?.name} - ${currentVenue?.location?.address}, ${currentVenue?.location?.city}`;

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(venueUrl);
          toast.success('Link copied to clipboard! 📋');
        } catch (err) {
          console.error('Failed to copy:', err);
          toast.error('Failed to copy link');
        }
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(venueUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(venueUrl)}&text=${encodeURIComponent(venueDescription)}`,
          '_blank'
        );
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${venueDescription} - ${venueUrl}`)}`, '_blank');
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(venueUrl)}`,
          '_blank'
        );
        break;
    }

    setShowShareDialog(false);
  };

  if (loading || !currentVenue) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Image Gallery Carousel */}
      <div className="relative h-[40vh] lg:h-[60vh] bg-gray-900 overflow-hidden">
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
              src={currentVenue.images?.[activeImage]?.url || 'https://images.unsplash.com/photo-1519766304800-c64daf4681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'} 
              alt={`${currentVenue.name} - Image ${activeImage + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-gray-900/20" />
          </motion.div>
        </AnimatePresence>

        {/* Image Navigation - Only show if multiple images */}
        {currentVenue.images?.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {currentVenue.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeImage 
                      ? 'w-8 bg-white' 
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>

            {/* View All Images Button */}
            <button
              onClick={() => setShowImageGallery(true)}
              className="absolute bottom-24 right-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm font-medium">View All ({currentVenue.images.length})</span>
            </button>
          </>
        )}

        {/* Back Button */}
        <div className="absolute top-6 left-4 lg:left-8 z-20">
          <Link to="/venues">
            <Button variant="secondary" size="sm" className="rounded-full backdrop-blur-md bg-white/20 hover:bg-white/30 text-white border-0">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Venues
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8 container mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                {currentVenue.isVerified && (
                  <Badge className="bg-primary text-primary-foreground border-0">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified Venue
                  </Badge>
                )}
                <Badge variant="outline" className="text-white border-white/30 bg-black/20 backdrop-blur-sm">
                  {currentVenue.sports?.[0]}
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-white">{currentVenue.name}</h1>
              <div className="flex items-center text-white/80 text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {currentVenue.location?.address}, {currentVenue.location?.city}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => toggleVenueFavorite(id)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              {user && (
                <Button 
                  variant="outline"
                  className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => setShowRatingDialog(true)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Rate Venue
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-30 grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <Card className="bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/20 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{currentVenue.averageRating || '0'}</span>
                  <span className="text-xs text-gray-500">{currentVenue.ratings?.length || 0} Reviews</span>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-2">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{currentVenue.capacity}</span>
                  <span className="text-xs text-gray-500">Capacity</span>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20 mb-2">
                    <CalendarIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{currentVenue.totalBookings || 0}</span>
                  <span className="text-xs text-gray-500">Bookings</span>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{currentVenue.pricing?.hourlyRate || 0}</span>
                  <span className="text-xs text-gray-500">Per Hour</span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none p-0 h-auto">
                <TabsTrigger 
                  value="about"
                  className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-base"
                >
                  About
                </TabsTrigger>
                <TabsTrigger 
                  value="events"
                  className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-base"
                >
                  Events ({venueEvents.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="amenities"
                  className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-base"
                >
                  Amenities
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews"
                  className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-base"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="pt-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground text-xl mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Events Hosted at This Venue
                  </h3>
                  
                  {eventsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-48 rounded-lg" />
                      ))}
                    </div>
                  ) : venueEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {venueEvents.map(event => (
                        <Link key={event._id} to={`/events/${event._id}`}>
                          <Card className="hover:shadow-lg transition-shadow overflow-hidden group border-border">
                            {event.images?.[0] && (
                              <div className="h-32 overflow-hidden">
                                <img 
                                  src={event.images[0]} 
                                  alt={event.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-foreground mb-2 line-clamp-1">{event.name}</h4>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>{event.participants?.length || 0} / {event.maxParticipants} participants</span>
                                </div>
                                <Badge className="mt-2 bg-primary/10 text-primary hover:bg-primary/20">
                                  {event.category}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted rounded-lg">
                      <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg">No events hosted at this venue yet</p>
                      <p className="text-sm text-muted-foreground mt-2">Be the first to create an event here!</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="about" className="pt-6 space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {currentVenue.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-400" /> Opening Hours
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {currentVenue.availability?.map((slot, idx) => (
                        <div key={idx} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                          <span>{slot.day}</span>
                          <span className="font-medium">{slot.openTime} - {slot.closeTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-gray-400" /> Contact Info
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        {currentVenue.contactInfo?.phone}
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-3 text-gray-400" />
                        {currentVenue.contactInfo?.website || 'No website available'}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        {currentVenue.location?.address}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentVenue.amenities?.map((amenity, idx) => {
                    const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                    const isAvailable = typeof amenity === 'string' ? true : amenity.available;
                    return (
                      <div key={idx} className={`flex items-center p-3 bg-white dark:bg-gray-900 rounded-xl border ${
                        isAvailable 
                          ? 'border-gray-100 dark:border-gray-800' 
                          : 'border-gray-100 dark:border-gray-800 opacity-50'
                      }`}>
                        <CheckCircle className={`w-5 h-5 mr-3 ${
                          isAvailable ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <span className="text-gray-700 dark:text-gray-300">{amenityName}</span>
                        {!isAvailable && (
                          <Badge variant="outline" className="ml-auto text-xs">Unavailable</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-6 space-y-6">
                {currentVenue.reviews && currentVenue.reviews.length > 0 ? (
                  currentVenue.reviews.map((review, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.user?.avatar?.url} />
                            <AvatarFallback>{review.user?.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{review.user?.name || 'Anonymous'}</h4>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt || review.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="font-bold text-yellow-700 dark:text-yellow-500">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{review.review || review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg">No reviews yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Be the first to review this venue!</p>
                    {user && (
                      <Button 
                        className="mt-4"
                        onClick={() => setShowRatingDialog(true)}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Write a Review
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5" />
                    <p className="text-sm font-medium opacity-90">Best Price</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">₹{currentVenue.pricing?.hourlyRate}</span>
                    <span className="opacity-80">/hour</span>
                  </div>
                  <p className="text-sm opacity-75 mt-2">Day rate: ₹{currentVenue.pricing?.dayRate}</p>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Instant Confirmation
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Flexible Cancellation
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Cash Payment Accepted
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    onClick={handleBookNow}
                  >
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Book This Venue
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Secure your booking with cash payment on arrival
                  </p>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Contact Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {currentVenue.contactInfo?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${currentVenue.contactInfo.phone}`} className="text-primary hover:underline">
                        {currentVenue.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {currentVenue.contactInfo?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${currentVenue.contactInfo.email}`} className="text-primary hover:underline">
                        {currentVenue.contactInfo.email}
                      </a>
                    </div>
                  )}
                  {currentVenue.contactInfo?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={currentVenue.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Visit Website
                      </a>
                    </div>
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
              <Sparkles className="w-5 h-5 text-primary" />
              Rate Your Experience
            </DialogTitle>
            <DialogDescription>
              Share your experience with {currentVenue.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Star Rating */}
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
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating === 5 && 'Excellent!'}
                  {rating === 4 && 'Very Good!'}
                  {rating === 3 && 'Good'}
                  {rating === 2 && 'Could be better'}
                  {rating === 1 && 'Needs improvement'}
                </p>
              )}
            </div>

            {/* Review Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Review (Optional)</label>
              <Textarea
                placeholder="Share your experience with others..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRatingDialog(false);
                  setRating(0);
                  setReview('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmitReview}
                disabled={rating === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Venue Images ({currentVenue.images?.length})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[70vh] p-4">
            {currentVenue.images?.map((image, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  setActiveImage(idx);
                  setShowImageGallery(false);
                }}
              >
                <img
                  src={image.url}
                  alt={`${currentVenue.name} - ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {idx === activeImage && (
                  <div className="absolute inset-0 bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                )}
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
              <Share2 className="w-5 h-5 text-primary" />
              Share Venue
            </DialogTitle>
            <DialogDescription>
              Share {currentVenue.name} with your friends and community
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              onClick={() => handleShare('copy')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-24 hover:bg-primary/5"
            >
              <div className="p-2 rounded-full bg-primary/10">
                <Copy className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Copy Link</span>
            </Button>
            <Button
              onClick={() => handleShare('whatsapp')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-24 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <div className="p-2 rounded-full bg-green-500">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium">WhatsApp</span>
            </Button>
            <Button
              onClick={() => handleShare('facebook')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-24 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <div className="p-2 rounded-full bg-blue-600">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium">Facebook</span>
            </Button>
            <Button
              onClick={() => handleShare('twitter')}
              variant="outline"
              className="flex flex-col items-center gap-2 h-24 hover:bg-sky-50 dark:hover:bg-sky-950"
            >
              <div className="p-2 rounded-full bg-sky-500">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium">Twitter</span>
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground break-all">
              {window.location.href}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenueDetails;
