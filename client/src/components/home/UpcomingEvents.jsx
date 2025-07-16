import { useEffect,useState } from 'react';
import {motion} from 'framer-motion';
import { useEvents } from '@/hooks/useEvents';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, Calendar, Clock, MapPin, Users,Star,Trophy,Play } from 'lucide-react';
import api from '@/utils/api';

const UpcomingEvents = () => {
    const [loading,setLoading] = useState(false)
      const [upcomingEvents, setUpcomingEvents] = useState([])
    
        useEffect( () => {
            const events = async () => {
                setLoading(true)
                try {
                    const res = await api.get("/events?status=Upcoming&sort=date&limit=6");
                    const events = res.data.data
                         if (events.length > 0) {
            setUpcomingEvents(events)
          }
                } catch (error) {
                    console.error(error)
                }finally{
                    setLoading(false);
                }
            }
            events();
     
        }, [])
  return (
     <section className="py-20 bg-muted-light/30 dark:bg-muted-dark/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-muted-foreground-light dark:text-muted-foreground-dark max-w-2xl">
                Join exciting sports events happening in your area
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Link 
                to="/events" 
                className="group inline-flex items-center px-6 py-3 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-xl hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View all events 
                <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-light dark:border-primary-dark"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-r-4 border-l-4 border-accent-light dark:border-accent-dark animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    to={`/events/${event._id}`}
                    className="group block bg-card-light dark:bg-card-dark rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border-light dark:border-border-dark hover:scale-105"
                  >
                    <div className="relative h-56 overflow-hidden">
                      {event.images && event.images.length > 0 ? (
                        <img
                          src={event.images[0].url || "/placeholder.svg?height=224&width=400"}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted-light to-muted-light/50 dark:from-muted-dark dark:to-muted-dark/50 flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-muted-foreground-light dark:text-muted-foreground-dark" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
                          ${event.status === "Upcoming" ? "bg-green-500/90 text-white" : ""}
                          ${event.status === "Ongoing" ? "bg-yellow-500/90 text-white" : ""}
                          ${event.status === "Completed" ? "bg-gray-500/90 text-white" : ""}
                          ${event.status === "Cancelled" ? "bg-red-500/90 text-white" : ""}
                        `}>
                          {event.status || "Upcoming"}
                        </span>
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      
                      {/* Event Title */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-bold mb-2 line-clamp-2">{event.name}</h3>
                        <div className="flex items-center text-white/90 text-sm">
                          <MapPin size={14} className="mr-1 flex-shrink-0" />
                          <span className="truncate">{event.location?.city || "Location TBD"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                          <Calendar size={16} className="mr-2" />
                          <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                          <Clock size={16} className="mr-2" />
                          <span>{event.time || "TBD"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${event.difficulty === "Beginner" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : ""}
                          ${event.difficulty === "Intermediate" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" : ""}
                          ${event.difficulty === "Advanced" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" : ""}
                        `}>
                          {event.difficulty || "All Levels"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark">
                          {event.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                          <Users size={16} className="mr-2" />
                          <span className="font-medium">
                            {event.participants?.length || 0}/{event.maxParticipants || "∞"} joined
                          </span>
                        </div>
                        
                        {event.ratings && event.ratings.length > 0 && (
                          <div className="flex items-center text-sm">
                            <Star size={16} className="mr-1 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-foreground-light dark:text-foreground-dark">
                              {(event.ratings.reduce((acc, curr) => acc + curr.rating, 0) / event.ratings.length).toFixed(1)}
                            </span>
                            <span className="text-muted-foreground-light dark:text-muted-foreground-dark ml-1">
                              ({event.ratings.length})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center py-20 bg-card-light dark:bg-card-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark"
            >
              <div className="w-24 h-24 bg-primary-light/10 dark:bg-primary-dark/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-primary-light dark:text-primary-dark" />
              </div>
              <h3 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-4">
                No upcoming events yet
              </h3>
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-md mx-auto mb-8 text-lg">
                Be the first to create an event in your area and start building your sports community!
              </p>
              <Link
                to="/events/create"
                className="inline-flex items-center px-8 py-4 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-xl hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Create First Event
              </Link>
            </motion.div>
          )}
        </div>
      </section>
  )
}

export default UpcomingEvents
