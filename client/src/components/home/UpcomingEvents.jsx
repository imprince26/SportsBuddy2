import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Activity,
} from 'lucide-react';
import api from '@/utils/api';

const UpcomingEvents = () => {
  const [loading, setLoading] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    citiesCovered: 0,
    avgRating: 0
  })

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const res = await api.get("/events/upcoming?limit=6");
        const events = res.data.data
        if (events.length > 0) {
          setUpcomingEvents(events)
          
          // Calculate stats
          const totalParticipants = events.reduce((sum, event) => sum + (event.participants?.length || 0), 0)
          const cities = new Set(events.map(event => event.location?.city).filter(Boolean))
          const totalRatings = events.reduce((sum, event) => {
            if (event.ratings?.length > 0) {
              return sum + event.ratings.reduce((acc, rating) => acc + rating.rating, 0) / event.ratings.length
            }
            return sum
          }, 0)
          
          setStats({
            totalEvents: events.length,
            totalParticipants,
            citiesCovered: cities.size,
            avgRating: events.filter(e => e.ratings?.length > 0).length > 0 ? 
              (totalRatings / events.filter(e => e.ratings?.length > 0).length).toFixed(1) : 0
          })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [])

  return (
    <section className='py-24 bg-background border-t border-border z-10'>
      
      <div className='container mx-auto px-4'>
        <div className='flex flex-col md:flex-row justify-between items-end mb-12 gap-6'>
          <div className='max-w-2xl'>
            <div className='flex items-center gap-2 text-primary font-medium mb-4'>
              <Activity className='w-4 h-4' />
              <span className='text-sm uppercase tracking-wider'>Live Action</span>
            </div>
            <h2 className='text-3xl md:text-4xl font-bold font-heading text-foreground mb-4'>
              Upcoming Events
            </h2>
            <p className='text-muted-foreground text-lg'>
              Join exciting sports events happening in your area and connect with fellow athletes.
            </p>
          </div>
          <Link to='/events' className='hidden md:flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors group'>
            View all events <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
          </Link>
        </div>

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {upcomingEvents.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className='group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300'
              >
                <div className='relative h-52 overflow-hidden bg-secondary'>
                  {event.images && event.images.length > 0 ? (
                    <img
                      src={event.images[0].url}
                      alt={event.name}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                      <Calendar className='w-12 h-12 opacity-20' />
                    </div>
                  )}
                  <div className='absolute top-4 right-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-md text-xs font-bold text-foreground border border-border shadow-sm'>
                    {event.category}
                  </div>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                </div>

                <div className='p-6 flex-1 flex flex-col'>
                  <div className='flex items-center gap-2 text-xs font-bold text-primary mb-3 uppercase tracking-wide'>
                    <Calendar className='w-3.5 h-3.5' />
                    {format(new Date(event.date), 'MMM dd, yyyy')} • {event.time || 'TBD'}
                  </div>

                  <h3 className='text-xl font-bold font-heading text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors'>
                    {event.name}
                  </h3>

                  <div className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
                    <MapPin className='w-4 h-4 text-muted-foreground/70' />
                    <span className='truncate'>{event.location?.city || 'Location TBD'}</span>
                  </div>

                  <div className='mt-auto pt-6 border-t border-border flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground font-medium'>
                      <Users className='w-4 h-4' />
                      <span>{event.participants?.length || 0} joined</span>
                    </div>
                    <div className='flex items-center gap-1 text-sm font-bold text-foreground bg-secondary/50 px-2 py-1 rounded-md'>
                      <Star className='w-3.5 h-3.5 fill-yellow-400 text-yellow-400' />
                      {event.ratings?.length > 0 
                        ? (event.ratings.reduce((acc, curr) => acc + curr.rating, 0) / event.ratings.length).toFixed(1)
                        : 'New'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className='text-center py-24 bg-card rounded-2xl border border-border'>
            <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center'>
              <Calendar className='w-8 h-8 text-muted-foreground' />
            </div>
            <h3 className='text-xl font-bold text-foreground mb-2'>No upcoming events</h3>
            <p className='text-muted-foreground mb-8'>Be the first to create an event in your area.</p>
            <Link to='/events/create'>
              <button className='px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20'>
                Create Event
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default UpcomingEvents