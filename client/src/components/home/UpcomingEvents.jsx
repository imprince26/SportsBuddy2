import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Trophy, 
  Play, 
  Sparkles,
  TrendingUp,
  Zap,
  Activity,
  Eye,
  Heart,
  Share2,
  ChevronRight,
  Globe
} from 'lucide-react';
import api from '@/utils/api';
import BgElements from '../BgElements'

const UpcomingEvents = () => {
  const [loading, setLoading] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [hoveredIndex, setHoveredIndex] = useState(null)
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
        const res = await api.get("/events?status=Upcoming&sort=date&limit=6");
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateY: -15 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  }

  const quickStats = [
    { label: "Live Events", value: stats.totalEvents, icon: Activity, color: "text-green-400", bgColor: "bg-green-400/10" },
    { label: "Active Athletes", value: stats.totalParticipants, icon: Users, color: "text-blue-400", bgColor: "bg-blue-400/10" },
    { label: "Cities", value: stats.citiesCovered, icon: Globe, color: "text-purple-400", bgColor: "bg-purple-400/10" },
    { label: "Avg Rating", value: stats.avgRating || "N/A", icon: Star, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
  ]

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
      {/* Background Elements */}
      <BgElements />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-full border border-gray-200/30 dark:border-gray-700/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Events</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 h-1 bg-green-500/60 rounded-full animate-pulse" 
                  style={{ animationDelay: `${i * 0.2}s` }} 
                />
              ))}
            </div>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Upcoming
            <motion.span 
              className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Events
            </motion.span>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Join exciting sports events happening in your area and connect with fellow athletes. 
            Discover new challenges, make friends, and push your limits.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {quickStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* View All Events Button */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Link
            to="/events"
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Eye className="w-5 h-5 mr-2" />
            View All Events
            <ArrowRight size={20} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Events Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-16 h-16 border-4 border-purple-600/20 border-r-purple-600 rounded-full"
                />
              </div>
            </motion.div>
          ) : upcomingEvents.length > 0 ? (
            <motion.div
              key="events"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    z: 50
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  className="group relative"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Link
                    to={`/events/${event._id}`}
                    className="block h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/70 dark:hover:border-gray-600/70 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl"
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <motion.div
                        className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500"
                        animate={{
                          scale: hoveredIndex === index ? [1, 1.1, 1] : 1,
                          rotate: hoveredIndex === index ? [0, 5, 0] : 0,
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>

                    {/* Floating Particles for Each Card */}
                    {hoveredIndex === index && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              scale: [0, 1.5, 0],
                              y: [0, -20, -40],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Event Image */}
                    <div className="relative h-56 overflow-hidden">
                      {event.images && event.images.length > 0 ? (
                        <img
                          src={event.images[0].url || "/placeholder.svg?height=224&width=400"}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg
                            ${event.status === "Upcoming" ? "bg-green-500/90 text-white" : ""}
                            ${event.status === "Ongoing" ? "bg-yellow-500/90 text-white" : ""}
                            ${event.status === "Completed" ? "bg-gray-500/90 text-white" : ""}
                            ${event.status === "Cancelled" ? "bg-red-500/90 text-white" : ""}
                          `}
                        >
                          {event.status || "Upcoming"}
                        </motion.span>
                      </div>

                      {/* Trending Badge */}
                      {index < 2 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <TrendingUp className="w-4 h-4 text-white" />
                        </motion.div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Event Title */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-bold mb-2 line-clamp-2">{event.name}</h3>
                        <div className="flex items-center text-white/90 text-sm">
                          <MapPin size={14} className="mr-1 flex-shrink-0" />
                          <span className="truncate">{event.location?.city || "Location TBD"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar size={16} className="mr-2" />
                          <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
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
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {event.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users size={16} className="mr-2" />
                          <span className="font-medium">
                            {event.participants?.length || 0}/{event.maxParticipants || "∞"} joined
                          </span>
                        </div>

                        {event.ratings && event.ratings.length > 0 && (
                          <div className="flex items-center text-sm">
                            <Star size={16} className="mr-1 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {(event.ratings.reduce((acc, curr) => acc + curr.rating, 0) / event.ratings.length).toFixed(1)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              ({event.ratings.length})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <motion.div
                          className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
                          whileHover={{ x: 5 }}
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </motion.div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-12 h-12 text-blue-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No upcoming events yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
                Be the first to create an event in your area and start building your sports community!
              </p>
              <Link
                to="/events/create"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Create First Event
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        {upcomingEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl text-white shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">Ready to join the action?</div>
                  <div className="text-sm text-white/80">Create your own event and lead the community</div>
                </div>
              </div>
              <Link to="/events/create">
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Event
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Additional Floating Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none" />
      
      {/* Corner Decorative Elements */}
      <motion.div
        className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </section>
  )
}

export default UpcomingEvents