import { Link } from 'react-router-dom'
import {motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Sparkles, Play, Calendar, Trophy, Users, Globe, Rocket, Heart } from 'lucide-react'

const HeroSection = () => {
  const { user } = useAuth()

    const stats = [
      { label: "Active Users", value: "10K+", icon: Users, color: "text-blue-500" },
      { label: "Events Created", value: "5K+", icon: Calendar, color: "text-green-500" },
      { label: "Sports Categories", value: "20+", icon: Trophy, color: "text-yellow-500" },
      { label: "Cities", value: "100+", icon: Globe, color: "text-purple-500" },
    ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light via-accent-light to-secondary-light dark:from-primary-dark dark:via-accent-dark dark:to-secondary-dark">


        {/* Floating Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-white/50 rounded-full blur-xl"
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-20 w-32 h-32 bg-yellow-300/50 rounded-full blur-xl"
            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-40 left-1/4 w-24 h-24 bg-green-300/50 rounded-full blur-xl"
            animate={{ y: [0, -25, 0], x: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={user ? 'auth' : 'unauth'}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {user ? (
                // Authenticated Hero Content
                <>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6"
                  >
                    <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-4">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Welcome back to your sports community
                    </span>
                  </motion.div>

                  <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    Ready for your next
                    <span className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      Adventure, {user.name?.split(' ')[0]}?
                    </span>
                  </h1>

                  <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                    Your sports community is thriving! Discover new events, connect with teammates,
                    and make every game count.
                  </p>

                  <div className="flex flex-wrap justify-center gap-6 mb-12">
                    <Link
                      to="/events/create"
                      className="group relative px-8 py-4 bg-white text-primary-light dark:text-primary-dark font-semibold rounded-2xl hover:bg-white/90 transition-all duration-300 flex items-center shadow-2xl hover:shadow-white/25 hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-2 transform group-hover:scale-110 transition-transform" />
                      Host New Event
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Link>
                    <Link
                      to="/events"
                      className="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Browse Events
                    </Link>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
                    {[
                      { label: 'Events Joined', value: '12', icon: Calendar },
                      { label: 'Friends Made', value: '28', icon: Users },
                      { label: 'Achievements', value: '8', icon: Trophy },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (i * 0.1) }}
                        className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                      >
                        <stat.icon className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-white/80">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                // Unauthenticated Hero Content
                <>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6"
                  >
                    <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
                      <Heart className="w-4 h-4 mr-2 text-red-400" />
                      Join 10,000+ sports enthusiasts
                    </span>
                  </motion.div>

                  <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    Find Your Perfect
                    <span className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      Sports Community
                    </span>
                  </h1>

                  <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                    Connect with local athletes, join exciting events, and turn your passion for sports
                    into lasting friendships and unforgettable experiences.
                  </p>

                  <div className="flex flex-wrap justify-center gap-6 mb-12">
                    <Link
                      to="/register"
                      className="group relative px-8 py-4 bg-white text-primary-light dark:text-primary-dark font-semibold rounded-2xl hover:bg-white/90 transition-all duration-300 flex items-center shadow-2xl hover:shadow-white/25 hover:scale-105"
                    >
                      <Rocket className="w-5 h-5 mr-2 transform group-hover:translate-x-1 transition-transform" />
                      Start Your Journey
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </Link>
                    <Link
                      to="/events"
                      className="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center"
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      Explore Events
                    </Link>
                  </div>

                  {/* Platform Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-2xl mx-auto">
                    {stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (i * 0.1) }}
                        className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                      >
                        <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-white/80">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection;