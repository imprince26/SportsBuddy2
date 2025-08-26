import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  ChevronRight,
  Globe,
  Play,
  Rocket,
  Trophy,
  Users,
  Calendar,
  Target,
  Star,
  Heart,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle,
  Crown,
  Flame
} from 'lucide-react'
import BgElements from '../BgElements'

const CallToAction = () => {
  const { user } = useAuth()
  const [hoveredIndex, setHoveredIndex] = useState(null)

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

  if (user) {
    const userActions = [
      { 
        icon: Play, 
        label: 'Host Events', 
        desc: 'Create and manage sports events',
        color: 'from-yellow-400 to-orange-500',
        path: '/events/create',
        stats: '2.5K+ Created'
      },
      { 
        icon: Users, 
        label: 'Build Teams', 
        desc: 'Connect with like-minded athletes',
        color: 'from-blue-400 to-purple-500',
        path: '/community',
        stats: '8K+ Teams'
      },
      { 
        icon: Calendar, 
        label: 'Track Progress', 
        desc: 'Monitor your sports journey',
        color: 'from-green-400 to-teal-500',
        path: '/dashboard',
        stats: '15K+ Activities'
      },
      { 
        icon: Trophy, 
        label: 'Join Tournaments', 
        desc: 'Compete and win amazing prizes',
        color: 'from-pink-400 to-red-500',
        path: '/events?type=tournament',
        stats: '500+ Tournaments'
      }
    ]

    return (
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
        
        <BgElements />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-full border border-blue-200/30 dark:border-blue-700/30 mb-6"
              >
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome back, {user.name?.split(' ')[0]}!</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Ready to Level Up
                <motion.span 
                  className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  Your Game?
                </motion.span>
              </h2>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Create your next event, invite players to join, and build your sports community today. 
                Make every game an adventure worth remembering!
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Main CTA */}
              <motion.div variants={itemVariants}>
                <div className="space-y-8">
                  <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-200/20 dark:border-blue-700/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">What would you like to do today?</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/events/create">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full p-4 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200/50 dark:border-gray-600/50"
                        >
                          <Play className="w-8 h-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Create Event</div>
                        </motion.button>
                      </Link>

                      <Link to="/events">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full p-4 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200/50 dark:border-gray-600/50"
                        >
                          <Target className="w-8 h-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Find Events</div>
                        </motion.button>
                      </Link>
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border border-yellow-200/20 dark:border-yellow-700/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">You're on fire! 🔥</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">5 events this month • Keep it up!</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Action Grid */}
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-2 gap-4">
                  {userActions.map((action, index) => (
                    <motion.div
                      key={action.label}
                      variants={itemVariants}
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
                      <Link to={action.path}>
                        <div className="h-full p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/70 dark:hover:border-gray-600/70 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl text-center">
                          {/* Background Gradient */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                          
                          {/* Floating Particles for Each Card */}
                          {hoveredIndex === index && (
                            <div className="absolute inset-0 pointer-events-none">
                              {[...Array(4)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className={`absolute w-1 h-1 bg-gradient-to-r ${action.color} rounded-full`}
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

                          <div className="relative z-10">
                            <motion.div
                              animate={{
                                rotate: hoveredIndex === index ? [0, 10, -10, 0] : 0,
                              }}
                              transition={{ duration: 0.6 }}
                              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}
                            >
                              <action.icon className="w-6 h-6 text-white" />
                            </motion.div>
                            
                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                              {action.label}
                            </div>
                            
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {action.desc}
                            </div>
                            
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {action.stats}
                            </div>
                          </div>

                          {/* Hover Glow Effect */}
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.color} opacity-20 blur-xl`} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  // Non-authenticated user CTA
  const features = [
    { 
      icon: Users, 
      label: 'Find Athletes', 
      desc: 'Connect with local players',
      color: 'from-blue-400 to-blue-600'
    },
    { 
      icon: Calendar, 
      label: 'Join Events', 
      desc: 'Discover exciting games',
      color: 'from-green-400 to-green-600'
    },
    { 
      icon: Trophy, 
      label: 'Win Prizes', 
      desc: 'Compete in tournaments',
      color: 'from-yellow-400 to-yellow-600'
    },
    { 
      icon: Shield, 
      label: 'Safe & Secure', 
      desc: 'Verified community',
      color: 'from-purple-400 to-purple-600'
    }
  ]

  const stats = [
    { label: "Active Users", value: "15K+", icon: Users },
    { label: "Events Monthly", value: "2.5K+", icon: Calendar },
    { label: "Success Rate", value: "95%", icon: CheckCircle },
    { label: "Avg Rating", value: "4.9★", icon: Star },
  ]

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-blue-800/90" />
        
        {/* Animated Particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating Geometric Shapes */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute opacity-10"
            style={{
              left: `${10 + (i * 10) % 80}%`,
              top: `${5 + (i * 12) % 90}%`,
              width: `${40 + (i % 4) * 20}px`,
              height: `${40 + (i % 4) * 20}px`,
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent)`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
            }}
            animate={{
              y: [0, -40, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 10 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.6,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Join the Community</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 h-1 bg-white/60 rounded-full animate-pulse" 
                    style={{ animationDelay: `${i * 0.2}s` }} 
                  />
                ))}
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Find Your
              <motion.span 
                className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%'],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Sports Community?
              </motion.span>
            </h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              Join SportsBuddy today and connect with thousands of sports enthusiasts in your area. 
              Start your journey to a more active and social lifestyle!
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative p-4 bg-white/20 backdrop-blur-xl rounded-xl border border-white/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-white/20 flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/80">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl shadow-2xl overflow-hidden text-lg"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-50 transform transition-transform group-hover:scale-110" />
                <div className="relative flex items-center gap-3">
                  <Rocket className="w-6 h-6 transform group-hover:scale-110 transition-transform" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.button>
            </Link>
            
            <Link to="/events">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 text-lg"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6" />
                  <span>Explore Events</span>
                  <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                viewport={{ once: true }}
                className="group bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:border-white/40"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-white font-bold mb-1">{feature.label}</div>
                <div className="text-white/80 text-sm">{feature.desc}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/80"
          >
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5 Rating</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Verified Community</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">15K+ Happy Users</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Additional Floating Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-800/50 to-transparent pointer-events-none" />
      
      {/* Corner Decorative Elements */}
      <motion.div
        className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute bottom-10 left-10 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </section>
  )
}

export default CallToAction