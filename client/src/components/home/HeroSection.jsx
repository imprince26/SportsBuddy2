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
  ChevronDown
} from 'lucide-react'

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
      {/* Advanced 3D Background Elements */}
      <div className="absolute inset-0">
        {/* Main Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-blue-800/90" />

        {/* 3D Floating Orbs */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-${4 + (i % 4) * 2} h-${4 + (i % 4) * 2} rounded-full`}
              style={{
                background: `linear-gradient(135deg, ${['rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(34, 197, 94, 0.3)', 'rgba(251, 191, 36, 0.3)'][i % 4]
                  }, transparent)`,
                backdropFilter: 'blur(10px)',
                left: `${10 + (i * 8) % 80}%`,
                top: `${20 + (i * 7) % 60}%`,
                transform: 'translateZ(0)',
                transformStyle: 'preserve-3d',
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                rotateX: [0, 360],
                rotateY: [0, 180],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* 3D Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: 'perspective(500px) rotateX(15deg)',
            }}
          />
        </div>

        {/* Large 3D Geometric Shapes */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-xl opacity-20"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            transform: 'perspective(1000px) rotateX(15deg) rotateY(15deg)',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: [15, 25, 15],
            rotateY: [15, 25, 15],
            y: [0, -20, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            transform: 'perspective(1000px) rotateX(-15deg) rotateY(-15deg)',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: [-15, -25, -15],
            rotateY: [-15, -25, -15],
            y: [0, 20, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

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
            >
              {user ? (
                // Authenticated User Hero
                <div className="space-y-8 mt-5">
                  {/* Welcome Badge */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block"
                  >
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-medium">
                          Welcome back, <span className="font-bold">{user.name?.split(' ')[0]}</span>!
                        </span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
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
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                      Ready for your next
                      <motion.span
                        className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                        animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        Sports Adventure?
                      </motion.span>
                    </h1>

                    <motion.p
                      className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Your sports community is thriving! Discover new events, connect with teammates,
                      and make every game count in your athletic journey.
                    </motion.p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-4"
                  >
                    <Link to="/events/create">
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-2xl overflow-hidden"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 transform transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center gap-3">
                          <Play className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                          <span>Host New Event</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      </motion.button>
                    </Link>

                    <Link to="/events">
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5" />
                          <span>Browse Events</span>
                        </div>
                      </motion.button>
                    </Link>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl blur-lg group-hover:blur-md transition-all duration-300" />
                        <div className="relative p-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-center">
                          <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                          <div className="text-sm text-white/80">{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
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
                        <span className="text-white/90 text-sm font-medium">{feature.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ) : (
                // Unauthenticated User Hero
                <div className="space-y-8 mt-5">
                  {/* Welcome Badge */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block"
                  >
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative px-6 py-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center gap-3">
                        <Heart className="w-5 h-5 text-red-400 animate-pulse" />
                        <span className="text-white font-medium">Join 15,000+ Sports Enthusiasts</span>
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
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
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-white leading-tight">
                      Find Your Perfect
                      <motion.span
                        className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                        animate={{
                          backgroundPosition: ['0%', '100%', '0%'],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        Sports Community
                      </motion.span>
                    </h1>

                    <motion.p
                      className="text-lg md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Connect with local athletes, join exciting events, and turn your passion for sports
                      into lasting friendships and unforgettable experiences that define your journey.
                    </motion.p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-6"
                  >
                    <Link to="/register">
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl shadow-2xl overflow-hidden text-lg"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 transform transition-transform group-hover:scale-110" />
                        <div className="relative flex items-center gap-3">
                          <Rocket className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
                          <span>Start Your Journey</span>
                          <TrendingUp className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </motion.button>
                    </Link>

                    <Link to="/events">
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 text-lg"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="flex items-center gap-3">
                          <Trophy className="w-6 h-6" />
                          <span>Explore Events</span>
                        </div>
                      </motion.button>
                    </Link>
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
                        {/* 3D Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl blur-xl group-hover:blur-lg transition-all duration-500 transform group-hover:scale-110" />

                        {/* Card Content */}
                        <div className={`relative p-6 lg:p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-center hover:border-white/40 transition-all duration-500 ${stat.bgColor}`}>
                          {/* Icon Container */}
                          <div className="relative mb-4">
                            <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                              <stat.icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-white/20 to-transparent blur-md transform scale-110 group-hover:scale-125 transition-transform duration-500" />
                          </div>

                          {/* Stats */}
                          <motion.div
                            className="text-3xl lg:text-4xl font-bold text-white"
                            animate={{
                              textShadow: [
                                "0 0 0px rgba(255,255,255,0.5)",
                                "0 0 20px rgba(255,255,255,0.8)",
                                "0 0 0px rgba(255,255,255,0.5)"
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {stat.value}
                          </motion.div>
                          <div className="text-white/90 font-medium">{stat.label}</div>

                          {/* Hover Effect Indicator */}
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="flex flex-wrap justify-center items-center gap-8 py-8"
                  >
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium">4.9/5 Rating</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">1,250+ Active Today</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
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

      {/* Scroll Indicator */}
      {/* <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </motion.div> */}

      {/* Background Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection