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
        color: 'from-primary to-primary/80',
        path: '/events/create',
        stats: '2.5K+ Created'
      },
      { 
        icon: Users, 
        label: 'Build Teams', 
        desc: 'Connect with like-minded athletes',
        color: 'from-secondary to-secondary/80',
        path: '/community',
        stats: '8K+ Teams'
      },
      { 
        icon: Calendar, 
        label: 'Track Progress', 
        desc: 'Monitor your sports journey',
        color: 'from-primary/80 to-primary/60',
        path: '/dashboard',
        stats: '15K+ Activities'
      },
      { 
        icon: Trophy, 
        label: 'Join Tournaments', 
        desc: 'Compete and win amazing prizes',
        color: 'from-secondary/80 to-secondary/60',
        path: '/events?type=tournament',
        stats: '500+ Tournaments'
      }
    ]

    return (
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 shadow-xl"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 backdrop-blur-xl rounded-full border border-blue-300 dark:border-blue-700 mb-6"
              >
                <Crown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome back, {user.name?.split(' ')[0]}!</span>
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Ready to Level Up{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Your Game?
                </span>
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
                    <div className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl border border-blue-200/50 dark:border-gray-700">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                          className="w-full p-4 bg-white dark:bg-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group border border-gray-200 dark:border-gray-600"
                        >
                          <Play className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Create Event</div>
                        </motion.button>
                      </Link>

                      <Link to="/events">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full p-4 bg-white dark:bg-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group border border-gray-200 dark:border-gray-600"
                        >
                          <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">Find Events</div>
                        </motion.button>
                      </Link>
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-2xl border border-blue-200/50 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                      whileHover={{ y: -4 }}
                      className="group relative"
                    >
                      <Link to={action.path}>
                        <div className="h-full p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 shadow-md hover:shadow-lg text-center">

                          <div className="relative z-10">
                            <motion.div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-3 transition-transform shadow-lg`}
                            >
                              <action.icon className="w-6 h-6 text-white" />
                            </motion.div>
                            
                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                              {action.label}
                            </div>
                            
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {action.desc}
                            </div>
                            
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {action.stats}
                            </div>
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
      color: 'from-primary to-primary/80'
    },
    { 
      icon: Calendar, 
      label: 'Join Events', 
      desc: 'Discover exciting games',
      color: 'from-secondary to-secondary/80'
    },
    { 
      icon: Trophy, 
      label: 'Win Prizes', 
      desc: 'Compete in tournaments',
      color: 'from-primary/70 to-primary/90'
    },
    { 
      icon: Shield, 
      label: 'Safe & Secure', 
      desc: 'Verified community',
      color: 'from-secondary/70 to-secondary/90'
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Join the Community</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Ready to Find Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sports Community?
              </span>
            </h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Join SportsBuddy today and connect with thousands of sports enthusiasts in your area.
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
                  whileHover={{ y: -2 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md"
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link to="/register">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl overflow-hidden text-lg border-2 border-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <div className="relative flex items-center gap-3">
                  <Rocket className="w-6 h-6" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </motion.button>
            </Link>
            
            <Link to="/events">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group px-10 py-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 text-lg shadow-md hover:shadow-lg"
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
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-gray-900 dark:text-white font-bold mb-1">{feature.label}</div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-gray-400"
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
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">Verified Community</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium">15K+ Happy Users</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

    </section>
  )
}

export default CallToAction
