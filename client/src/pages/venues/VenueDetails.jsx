import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Trophy
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
import { toast } from 'react-hot-toast';

const VenueDetails = () => {
  const { id } = useParams();
  const { 
    currentVenue, 
    loading, 
    getVenueById, 
    toggleVenueFavorite, 
    favoriteVenues,
    bookVenue 
  } = useVenue();
  const { user } = useAuth();
  const { getEvents } = useEvents();
  
  const [activeImage, setActiveImage] = useState(0);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [venueEvents, setVenueEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

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

  const handleBook = async () => {
    if (!user) {
      toast.error('Please login to book a venue');
      return;
    }
    
    if (!bookingTime) {
      toast.error('Please select a time');
      return;
    }

    const startTime = new Date(`${bookingDate}T${bookingTime}`);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

    const result = await bookVenue(id, {
      startTime,
      endTime,
      eventId: null // Or handle event association
    });

    if (result.success) {
      // Reset form or redirect
    }
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
      {/* Image Gallery */}
      <div className="relative h-[40vh] lg:h-[50vh] bg-gray-900">
        <div className="absolute inset-0">
          <img 
            src={currentVenue.images?.[activeImage]?.url || 'https://images.unsplash.com/photo-1519766304800-c64daf4681bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'} 
            alt={currentVenue.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        <div className="absolute top-6 left-4 lg:left-8 z-10">
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

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={() => toggleVenueFavorite(id)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full w-12 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Star className="w-6 h-6 text-yellow-500 mb-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{currentVenue.averageRating}</span>
                  <span className="text-xs text-gray-500">Rating</span>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Users className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{currentVenue.capacity}</span>
                  <span className="text-xs text-gray-500">Capacity</span>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <CalendarIcon className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{currentVenue.totalBookings}</span>
                  <span className="text-xs text-gray-500">Bookings</span>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Shield className="w-6 h-6 text-purple-500 mb-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Safe</span>
                  <span className="text-xs text-gray-500">Verified</span>
                </CardContent>
              </Card>
            </div>

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
                  {currentVenue.amenities?.map((amenity, idx) => (
                    <div key={idx} className="flex items-center p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="pt-6 space-y-6">
                {currentVenue.recentReviews?.map((review, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={review.user?.avatar} />
                          <AvatarFallback>{review.user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{review.user?.name}</h4>
                          <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-bold text-yellow-700 dark:text-yellow-500">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{review.review}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden">
                <div className="bg-primary p-6 text-primary-foreground">
                  <p className="text-sm font-medium opacity-90">Price per hour</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${currentVenue.pricing?.hourlyRate}</span>
                    <span className="opacity-80">/hr</span>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                    <select 
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                    >
                      <option value="">Select time</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((hr) => (
                        <button
                          key={hr}
                          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            duration === hr 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-200'
                          }`}
                          onClick={() => setDuration(hr)}
                        >
                          {hr} hr
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">${currentVenue.pricing?.hourlyRate} x {duration} hrs</span>
                      <span className="font-medium">${currentVenue.pricing?.hourlyRate * duration}</span>
                    </div>
                    <div className="flex justify-between mb-6 text-lg font-bold">
                      <span>Total</span>
                      <span>${currentVenue.pricing?.hourlyRate * duration}</span>
                    </div>

                    <Button 
                      className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                      onClick={handleBook}
                    >
                      Book Now
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      You won't be charged yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
