import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import {
  Sparkles,
  Play,
  Calendar,
  Trophy,
  Users,
  Globe,
  Rocket,
  Heart,
  Target,
  Zap,
  Star,
  MapPin,
  Activity,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import HeroBg from '../HeroBg'

const HeroSection = () => {
  const { user } = useAuth()

  const stats = [
    { label: "Active Athletes", value: "15K+", icon: Users, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-500/10" },
    { label: "Events Monthly", value: "2.5K+", icon: Calendar, color: "from-green-500 to-green-600", bgColor: "bg-green-500/10" },
    { label: "Sports Available", value: "25+", icon: Trophy, color: "from-yellow-500 to-yellow-600", bgColor: "bg-yellow-500/10" },
    { label: "Cities Covered", value: "150+", icon: Globe, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-500/10" },
  ]

  const userStats = [
    { label: 'Events Joined', value: user?.participatedEvents?.length || '12', icon: Calendar, color: "from-blue-500 to-blue-600" },
    { label: 'Events Created', value: user?.createdEvents?.length || '5', icon: Target, color: "from-green-500 to-green-600" },
    { label: 'Friends Made', value: user?.followers?.length || '28', icon: Users, color: "from-purple-500 to-purple-600" },
    { label: 'Achievements', value: user?.achievements?.length || '8', icon: Trophy, color: "from-yellow-500 to-yellow-600" },
  ]

  const features = [
    { icon: Zap, text: "Instant Match", color: "text-yellow-400" },
    { icon: MapPin, text: "Local Events", color: "text-green-400" },
    { icon: Activity, text: "Live Tracking", color: "text-blue-400" },
    { icon: Star, text: "Rated Community", color: "text-purple-400" },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <HeroBg />

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={user ? 'authenticated' : 'unauthenticated'}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-center max-w-4xl mx-auto"

            >
              {user ? (
                // Authenticated User Hero
                <div className="space-y-8 mt-2">
                  {/* Welcome Badge */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block"
                  >
                    <div className="group relative">
                      {/* Enhanced Multi-layer Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/60 via-purple-500/60 to-indigo-500/60 dark:from-blue-400/80 dark:via-purple-400/80 dark:to-indigo-400/80 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse" />

                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-purple-400/30 dark:from-cyan-300/40 dark:via-blue-300/40 dark:to-purple-300/40 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-all duration-300 scale-110" />

                      {/* Main Badge Container */}
                      <div className="relative px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full border border-blue-200/50 dark:border-blue-400/40 flex items-center gap-3 shadow-xl dark:shadow-2xl group-hover:shadow-2xl dark:group-hover:shadow-blue-900/50 transition-all duration-300">

                        {/* Enhanced Icon Container */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm opacity-60 animate-pulse" />
                          <div className="relative w-4 h-4 md:w-8 md:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
                          </div>
                        </div>

                        {/* Enhanced Welcome Text */}
                        <span className="bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 dark:from-blue-200 dark:via-purple-200 dark:to-indigo-200 bg-clip-text text-transparent font-bold text-sm md:text-base tracking-wide">
                          Welcome back, <span className="font-black">{user.name?.split(' ')[0]}</span>!
                        </span>

                        {/* Enhanced Status Indicator */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-60 animate-pulse" />
                          <div className="relative w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg" />
                        </div>

                        {/* Subtle Inner Highlight */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 dark:from-white/5 dark:via-white/15 dark:to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      </div>
                    </div>
                  </motion.div>

                  {/* Main Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="space-y-4"
                  >
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                      Ready for your next
                      <motion.span
                        className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                      >
                        Sports Adventure?
                      </motion.span>
                    </h1>

                    <motion.p
                      className="text-sm md:text-xl text-gray-700 dark:text-white/90 max-w-3xl mx-auto leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Your sports community is thriving! Discover new events, connect with teammates,
                      and make every game count in your athletic journey.
                    </motion.p>
                  </motion.div>

                  {/* User Stats Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
                  >
                    {userStats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                        whileHover={{ scale: 1.05, rotateY: 10 }}
                        className="group relative"
                        style={{ transformStyle: 'preserve-3d' }}
                      >

                        <div className="relative flex md:flex-col flex-row justify-between items-center  p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 text-center hover:border-white/40 transition-all duration-500">
                          <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex flex-col items-center">

                            <div className="text-lg sm:text-xl lg:text-xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-white/80">{stat.label}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-4"
                  >
                    <Link to="/events/create" className='w-full md:w-auto'>
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-900 dark:to-indigo-900 text-blue-200 font-bold rounded-2xl shadow-2xl overflow-hidden"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="relative flex items-center justify-center gap-3">
                          <Play className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                          <span className='text-white'>Host New Event</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </motion.button>
                    </Link>

                    <Link to="/events" className='w-full md:w-auto'>
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/20 dark:bg-gray-900/40 backdrop-blur-xl border-2 border-white/40 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-white/30 dark:hover:bg-gray-900/60 transition-all duration-300 shadow-lg overflow-hidden"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="relative flex items-center justify-center gap-3">
                          <Calendar className="w-5 h-5" />
                          <span>Browse Events</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                      </motion.button>
                    </Link>
                  </motion.div>

                  {/* Features Strip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="flex flex-wrap justify-center gap-6  py-8"
                  >
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.1, rotateZ: 5 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20"
                      >
                        <feature.icon className={`w-4 h-4 ${feature.color}`} />
                        <span className="dark:text-white/80 text-gray-900 text-sm font-medium">{feature.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ) : (
                // Unauthenticated User Hero
                <div className="space-y-8 mt-1 text-center max-w-4xl mx-auto">
                  {/* Welcome Badge */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block"
                  >
                    <div className="group relative">
                      {/* Enhanced Multi-layer Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 via-pink-400/30 to-rose-400/30 dark:from-red-300/40 dark:via-pink-300/40 dark:to-rose-300/40 rounded-full blur-lg opacity-50 group-hover:opacity-80 transition-all duration-300 scale-110" />

                      {/* Main Badge Container */}
                      <div className="relative px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full border border-rose-200/50 dark:border-rose-400/40 flex items-center gap-3 shadow-xl dark:shadow-2xl group-hover:shadow-2xl dark:group-hover:shadow-rose-900/50 transition-all duration-300">

                        {/* Enhanced Icon Container */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full blur-sm opacity-60 animate-pulse" />
                          <Heart className="relative w-5 h-5 text-red-500 dark:text-red-400 animate-bounce" style={{ animationDuration: '2s' }} />
                        </div>

                        {/* Enhanced Welcome Text */}
                        <span className="bg-gradient-to-r from-gray-800 via-red-700 to-pink-700 dark:from-rose-200 dark:via-pink-200 dark:to-red-200 bg-clip-text text-transparent font-bold text-sm sm:text-base tracking-wide">
                          Join 1,000+ Sports Enthusiasts
                        </span>

                        {/* Enhanced Animated Dots */}
                        <div className="flex gap-1.5">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-pink-600 dark:from-red-300 dark:to-pink-300 rounded-full animate-pulse shadow-sm"
                              style={{
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: '1.5s'
                              }}
                            />
                          ))}
                        </div>

                        {/* Subtle Inner Highlight */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 dark:from-white/5 dark:via-white/15 dark:to-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Main Heading */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="space-y-6"
                  >
                    <h1 className=" text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                      Find Your Perfect
                      <motion.span
                        className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                      >
                        Sports Community
                      </motion.span>
                    </h1>

                    <motion.p
                      className="text-sm md:text-xl text-gray-700 dark:text-white/90 max-w-4xl mx-auto leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Connect with local athletes, join exciting events, and turn your passion for sports
                      into lasting friendships and unforgettable experiences that define your journey.
                    </motion.p>
                  </motion.div>

                  {/* Platform Stats Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
                  >
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, rotateY: -90, z: -100 }}
                        animate={{ opacity: 1, rotateY: 0, z: 0 }}
                        transition={{
                          duration: 0.8,
                          delay: 1.2 + index * 0.15,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ scale: 1.08, rotateY: 10, z: 50 }}
                        className="group relative"
                        style={{ transformStyle: 'preserve-3d' }}
                      >

                        {/* Card Content */}
                        <div className={`relative flex md:flex-col flex-row justify-between items-center  p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 text-center hover:border-white/40 transition-all duration-500 `}>
                          {/* Icon Container */}
                          <div className="relative mb-1 md:mb-4">
                            <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                              <stat.icon className=" w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-600/20 to-transparent blur-md transform scale-110 group-hover:scale-125 transition-transform duration-500" />
                          </div>

                          {/* Stats */}
                          <div className="flex flex-col items-center">
                            <motion.div
                              className="text-lg sm:text-xl lg:text-xl xl:text-3xl font-bold text-gray-900 dark:text-white mb-1"
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {stat.value}
                            </motion.div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-white/80">{stat.label}</div>
                          </div>

                          {/* Hover Effect Indicator */}
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className=" flex flex-col md:flex-row gap-3 sm:gap-4 justify-center items-center"
                  >
                    <Link to="/register" className='w-full md:w-auto'>
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-900 dark:to-indigo-900 text-blue-200 font-bold rounded-2xl shadow-2xl overflow-hidden"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="relative flex justify-center items-center gap-3">
                          <Rocket className="md:w-6 md:h-6 w-5 h-5 transform group-hover:scale-110 transition-transform" />
                          <span>Start Your Journey</span>
                          <TrendingUp className="md:w-6 md:h-6 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </motion.button>
                    </Link>

                    <Link to="/events" className='w-full md:w-auto'>
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/20 dark:bg-gray-900/40 backdrop-blur-xl border-2 border-white/40 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-white/30 dark:hover:bg-gray-900/60 transition-all duration-300 shadow-lg"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Trophy className="md:w-6 md:h-6 w-5 h-4" />
                          <span>Explore Events</span>
                        </div>
                      </motion.button>
                    </Link>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="flex flex-wrap justify-center items-center gap-8 pt-6 pb-20"
                  >
                    <div className="flex items-center gap-2 dark:text-white/80 text-gray-900">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium">4.9/5 Rating</span>
                    </div>
                    <div className="flex items-center gap-2 dark:text-white/80 text-gray-900">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">1,250+ Active Today</span>
                    </div>
                    <div className="flex items-center gap-2 dark:text-white/80 text-gray-900">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">Real-time Matching</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
