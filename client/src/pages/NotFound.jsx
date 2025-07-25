import { useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Home,
  Calendar,
  ArrowLeft,
  Search,
  Compass,
  Trophy,
  Users,
  Dumbbell,
  Zap,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const NotFound = () => {
  // Page Title
  useEffect(() => {
    document.title = '404 - Page Not Found | SportsBuddy'
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const bounceVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const rotateVariants = {
    animate: {
      rotate: [0, 180, 360],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  const quickActions = [
    {
      title: "Browse Events",
      description: "Discover amazing sports events",
      icon: Calendar,
      href: "/events",
      gradient: "from-blue-500 to-blue-600",
      color: "blue"
    },
    {
      title: "Find Athletes",
      description: "Connect with sports buddies",
      icon: Users,
      href: "/athletes",
      gradient: "from-green-500 to-green-600",
      color: "green"
    },
    {
      title: "View Dashboard",
      description: "Check your activity",
      icon: Trophy,
      href: "/dashboard",
      gradient: "from-purple-500 to-purple-600",
      color: "purple"
    },
    {
      title: "Sports Centers",
      description: "Find nearby facilities",
      icon: Dumbbell,
      href: "/venues",
      gradient: "from-orange-500 to-orange-600",
      color: "orange"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />

        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Floating Geometric Shapes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute opacity-10"
            style={{
              left: `${15 + (i * 12) % 70}%`,
              top: `${10 + (i * 15) % 80}%`,
              width: `${30 + (i % 3) * 20}px`,
              height: `${30 + (i % 3) * 20}px`,
              background: `linear-gradient(135deg, ${['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i % 4]
                }, transparent)`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 8 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 relative z-10 min-h-screen flex items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center w-full"
        >
          {/* Main 404 Section */}
          <motion.div variants={itemVariants} className="mb-16">
            {/* Animated 404 Number */}
            <div className="relative mb-8">
              <motion.div
                className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-black text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text leading-none"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                404
              </motion.div>

              {/* Floating Sports Icons */}
              <motion.div
                className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl"
                variants={bounceVariants}
                animate="animate"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl"
                variants={bounceVariants}
                animate="animate"
                transition={{ delay: 0.5 }}
              >
                <Dumbbell className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div
                className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl"
                variants={rotateVariants}
                animate="animate"
              >
                <Compass className="w-7 h-7 text-white" />
              </motion.div>

              {/* Sparkle Effects */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
              ))}
            </div>

            {/* Header Text */}
            <motion.div variants={itemVariants} className="mb-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/50 mb-6 shadow-lg"
              >
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Oops! Page Lost in the Game</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
                Page Not Found
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
                Looks like this page decided to take a timeout! Don't worry, there are plenty of
                other exciting sports adventures waiting for you.
              </p>

              {/* Stats Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-blue-500/10 rounded-full px-4 py-2 border border-blue-500/20"
                >
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">1000+ Events</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-green-500/10 rounded-full px-4 py-2 border border-green-500/20"
                >
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">50K+ Athletes</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-purple-500/10 rounded-full px-4 py-2 border border-purple-500/20"
                >
                  <Trophy className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">25+ Sports</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white shadow-lg h-14 px-8">
                  <Link to="/" className="flex items-center gap-3">
                    <Home className="w-5 h-5" />
                    <span className="font-medium">Back to Home</span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" size="lg" className="rounded-xl border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl h-14 px-8">
                  <Link to="/events" className="flex items-center gap-3">
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Find Events</span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.history.back()}
                  className="rounded-xl border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl h-14 px-8"
                >
                  <ArrowLeft className="w-5 h-5 mr-3" />
                  <span className="font-medium">Go Back</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Popular Destinations
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  While you're here, check out these popular sections of SportsBuddy
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={action.href}
                      className="block p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm"
                    >
                      <div className="relative mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                          <action.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-3 h-3 bg-green-500 rounded-full"
                          />
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {action.description}
                      </p>

                      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            variants={itemVariants}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <span>Still need help?</span>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/contact"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  Contact Support
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

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

      {/* Refresh Button - Hidden but functional */}
      <motion.button
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.location.reload()}
        title="Refresh Page"
      >
        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
      </motion.button>
    </div>
  )
}

export default NotFound