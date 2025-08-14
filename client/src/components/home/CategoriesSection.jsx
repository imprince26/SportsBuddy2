import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Star, 
  Trophy, 
  Users, 
  TrendingUp,
  Sparkles,
  Zap,
  Calendar,
  MapPin,
  Activity
} from 'lucide-react'

const CategoriesSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const categories = [
    { 
      id: "Football", 
      name: "Football", 
      icon: "⚽", 
      gradient: "from-green-400 to-blue-500",
      bgGradient: "from-green-500/20 to-blue-500/20",
      participants: "2.5K+",
      events: "450+",
      description: "Join the world's most popular sport",
      color: "text-green-500"
    },
    { 
      id: "Basketball", 
      name: "Basketball", 
      icon: "🏀", 
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-500/20 to-red-500/20",
      participants: "1.8K+",
      events: "320+",
      description: "Dribble your way to new friendships",
      color: "text-orange-500"
    },
    { 
      id: "Tennis", 
      name: "Tennis", 
      icon: "🎾", 
      gradient: "from-yellow-400 to-green-500",
      bgGradient: "from-yellow-500/20 to-green-500/20",
      participants: "1.2K+",
      events: "280+",
      description: "Serve up some competitive fun",
      color: "text-yellow-500"
    },
    { 
      id: "Running", 
      name: "Running", 
      icon: "🏃", 
      gradient: "from-blue-400 to-purple-500",
      bgGradient: "from-blue-500/20 to-purple-500/20",
      participants: "3.2K+",
      events: "520+",
      description: "Run towards your fitness goals",
      color: "text-blue-500"
    },
    { 
      id: "Cycling", 
      name: "Cycling", 
      icon: "🚴", 
      gradient: "from-green-400 to-teal-500",
      bgGradient: "from-green-500/20 to-teal-500/20",
      participants: "950+",
      events: "190+",
      description: "Pedal into adventure",
      color: "text-teal-500"
    },
    { 
      id: "Swimming", 
      name: "Swimming", 
      icon: "🏊", 
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-500/20 to-blue-500/20",
      participants: "720+",
      events: "150+",
      description: "Dive into aquatic excellence",
      color: "text-cyan-500"
    },
    { 
      id: "Volleyball", 
      name: "Volleyball", 
      icon: "🏐", 
      gradient: "from-pink-400 to-red-500",
      bgGradient: "from-pink-500/20 to-red-500/20",
      participants: "680+",
      events: "180+",
      description: "Spike your way to victory",
      color: "text-pink-500"
    },
    { 
      id: "Cricket", 
      name: "Cricket", 
      icon: "🏏", 
      gradient: "from-indigo-400 to-purple-500",
      bgGradient: "from-indigo-500/20 to-purple-500/20",
      participants: "1.1K+",
      events: "220+",
      description: "Bowl over the competition",
      color: "text-indigo-500"
    },
  ]

  const stats = [
    { label: "Total Categories", value: "25+", icon: Trophy, color: "text-yellow-500" },
    { label: "Active Players", value: "15K+", icon: Users, color: "text-blue-500" },
    { label: "Events This Month", value: "2.8K+", icon: Calendar, color: "text-green-500" },
    { label: "Cities Covered", value: "150+", icon: MapPin, color: "text-purple-500" },
  ]

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
    hidden: { opacity: 0, scale: 0.8, rotateY: -30 },
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

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />
        
        {/* Animated Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
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
              left: `${20 + (i * 12) % 80}%`,
              top: `${15 + (i * 15) % 70}%`,
              width: `${40 + (i % 3) * 20}px`,
              height: `${40 + (i % 3) * 20}px`,
              background: `linear-gradient(135deg, ${
                ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5]
              }, transparent)`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 6 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
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

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <div
            // variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-full border border-gray-200/30 dark:border-gray-700/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Explore Sports Categories</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 h-1 bg-blue-500/60 rounded-full animate-pulse" 
                  style={{ animationDelay: `${i * 0.2}s` }} 
                />
              ))}
            </div>
          </div>

          <motion.h2 
            variants={itemVariants}
            className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Popular Sports
            <motion.span 
              className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Categories
            </motion.span>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed"
          >
            Discover events across a wide range of sports and activities. Find your passion, connect with others
            who share it, and embark on unforgettable athletic journeys.
          </motion.p>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12"
          >
            {stats.map((stat, index) => (
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
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
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
                to={`/events?category=${category.id}`}
                className="block h-full"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="relative h-full p-6 lg:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/70 dark:hover:border-gray-600/70 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <motion.div
                      className={`w-full h-full bg-gradient-to-br ${category.gradient}`}
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
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-1 h-1 bg-gradient-to-r ${category.gradient} rounded-full`}
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

                  <div className="relative z-10 h-full flex flex-col text-center">
                    {/* Icon */}
                    <motion.div 
                      className="text-6xl lg:text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-500"
                      animate={{
                        rotate: hoveredIndex === index ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      {category.icon}
                    </motion.div>

                    {/* Category Name */}
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                      {category.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow leading-relaxed">
                      {category.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-2 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{category.participants}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Players</div>
                      </div>
                      <div className="p-2 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3 text-green-500" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{category.events}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Events</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.div
                      className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <span>Explore Events</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.div>

                    {/* Trending Badge */}
                    {index < 3 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <TrendingUp className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${category.gradient} opacity-20 blur-xl`} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
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
                <div className="font-bold text-lg">Can't find your sport?</div>
                <div className="text-sm text-white/80">Create a custom event for any activity</div>
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

export default CategoriesSection