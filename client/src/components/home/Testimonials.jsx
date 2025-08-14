import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  Quote, 
  Users, 
  Trophy,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckCircle,
  Award,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react'

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Basketball Enthusiast",
      avatar: "/placeholder.svg?height=80&width=80",
      content: "SportsBuddy has completely transformed how I find local basketball games. I've met amazing people and improved my skills tremendously! The community here is incredibly supportive.",
      rating: 5,
      location: "New York",
      sport: "Basketball",
      sportIcon: "🏀",
      eventsJoined: 24,
      achievement: "Tournament Winner",
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-500/20 to-red-500/20"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Football Player",
      avatar: "/placeholder.svg?height=80&width=80",
      content: "I moved to a new city and was struggling to find people to play football with. Thanks to SportsBuddy, I now have a regular team and we've won 3 local tournaments!",
      rating: 5,
      location: "Los Angeles",
      sport: "Football",
      sportIcon: "⚽",
      eventsJoined: 18,
      achievement: "Team Captain",
      gradient: "from-green-400 to-blue-500",
      bgGradient: "from-green-500/20 to-blue-500/20"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Tennis Player",
      avatar: "/placeholder.svg?height=80&width=80",
      content: "The event organization features are fantastic. I've hosted several tennis tournaments with ease! The platform makes coordination so much simpler.",
      rating: 5,
      location: "Miami",
      sport: "Tennis",
      sportIcon: "🎾",
      eventsJoined: 15,
      achievement: "Event Organizer",
      gradient: "from-yellow-400 to-green-500",
      bgGradient: "from-yellow-500/20 to-green-500/20"
    },
    // {
    //   id: 4,
    //   name: "Alex Thompson",
    //   role: "Running Enthusiast",
    //   avatar: "/placeholder.svg?height=80&width=80",
    //   content: "From casual jogs to marathon training, SportsBuddy connected me with runners of all levels. The motivation and support from the community is incredible!",
    //   rating: 5,
    //   location: "Chicago",
    //   sport: "Running",
    //   sportIcon: "🏃",
    //   eventsJoined: 32,
    //   achievement: "Marathon Finisher",
    //   gradient: "from-blue-400 to-purple-500",
    //   bgGradient: "from-blue-500/20 to-purple-500/20"
    // },
    // {
    //   id: 5,
    //   name: "Priya Patel",
    //   role: "Cricket Player",
    //   avatar: "/placeholder.svg?height=80&width=80",
    //   content: "Finding cricket teams in the US was nearly impossible before SportsBuddy. Now I play every weekend with an amazing group of passionate players!",
    //   rating: 5,
    //   location: "Seattle",
    //   sport: "Cricket",
    //   sportIcon: "🏏",
    //   eventsJoined: 22,
    //   achievement: "League Champion",
    //   gradient: "from-indigo-400 to-purple-500",
    //   bgGradient: "from-indigo-500/20 to-purple-500/20"
    // },
    // {
    //   id: 6,
    //   name: "David Kim",
    //   role: "Cycling Enthusiast",
    //   avatar: "/placeholder.svg?height=80&width=80",
    //   content: "The cycling community on SportsBuddy is phenomenal! From weekend rides to competitive races, I've found my tribe and pushed my limits like never before.",
    //   rating: 5,
    //   location: "Portland",
    //   sport: "Cycling",
    //   sportIcon: "🚴",
    //   eventsJoined: 28,
    //   achievement: "Distance Record",
    //   gradient: "from-green-400 to-teal-500",
    //   bgGradient: "from-green-500/20 to-teal-500/20"
    // }
  ]

  const stats = [
    { label: "Happy Athletes", value: "15K+", icon: Users, color: "text-blue-400" },
    { label: "Success Stories", value: "95%", icon: Trophy, color: "text-yellow-400" },
    { label: "Events Completed", value: "2.8K+", icon: CheckCircle, color: "text-green-400" },
    { label: "Average Rating", value: "4.9★", icon: Star, color: "text-purple-400" },
  ]

  // Fixed carousel logic
  const itemsPerSlide = 3
  const totalSlides = Math.ceil(testimonials.length / itemsPerSlide)

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

  // Fixed navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev + 1
      return next >= totalSlides ? 0 : next
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const previous = prev - 1
      return previous < 0 ? totalSlides - 1 : previous
    })
  }

  // Fixed visible testimonials function
  const getVisibleTestimonials = () => {
    const startIndex = currentSlide * itemsPerSlide
    const endIndex = Math.min(startIndex + itemsPerSlide, testimonials.length)
    return testimonials.slice(startIndex, endIndex)
  }

  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
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
              y: [0, -35, 0],
              x: [0, Math.random() * 25 - 12, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
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
              background: `linear-gradient(135deg, ${
                ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i % 5]
              }, transparent)`,
              borderRadius: i % 2 === 0 ? '50%' : '20%',
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 7 + (i % 3),
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
              backgroundSize: '50px 50px',
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
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-full border border-gray-200/30 dark:border-gray-700/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Stories</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 h-1 bg-yellow-500/60 rounded-full animate-pulse" 
                  style={{ animationDelay: `${i * 0.2}s` }} 
                />
              ))}
            </div>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            What Our
            <motion.span 
              className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              Community Says
            </motion.span>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8"
          >
            Join thousands of satisfied athletes who have found their perfect sports community, 
            made lasting friendships, and achieved their athletic goals with SportsBuddy.
          </motion.p>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                // initial={{ opacity: 0, scale: 0.8 }}
                // whileInView={{ opacity: 1, scale: 1 }}
                // transition={{ delay: index * 0.1, duration: 0.5 }}
                // whileHover={{ scale: 1.05, y: -5 }}
                className="group relative p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="relative"
        >
          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevSlide}
              disabled={totalSlides <= 1}
              className={`w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center transition-colors shadow-lg ${
                totalSlides <= 1 
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextSlide}
              disabled={totalSlides <= 1}
              className={`w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center transition-colors shadow-lg ${
                totalSlides <= 1 
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Carousel Info */}
          <div className="text-center mb-8">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentSlide + 1} of {totalSlides} • Showing {getVisibleTestimonials().length} testimonials
            </span>
          </div>

          {/* Testimonials Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              // initial={{ opacity: 0, x: 100 }}
              // animate={{ opacity: 1, x: 0 }}
              // exit={{ opacity: 0, x: -100 }}
              // transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {getVisibleTestimonials().map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  variants={cardVariants}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 5,
                    z: 50
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  className="group relative h-full"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="h-full p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/70 dark:hover:border-gray-600/70 transition-all duration-500 overflow-hidden shadow-lg hover:shadow-2xl">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <motion.div
                        className={`w-full h-full bg-gradient-to-br ${testimonial.gradient}`}
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
                            className={`absolute w-1 h-1 bg-gradient-to-r ${testimonial.gradient} rounded-full`}
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

                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header with Sport Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{testimonial.sportIcon}</span>
                          <span className="px-3 py-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 backdrop-blur-sm">
                            {testimonial.sport}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {testimonial.achievement}
                          </span>
                        </div>
                      </div>

                      {/* Quote Icon */}
                      <motion.div
                        animate={{
                          rotate: hoveredIndex === index ? [0, 10, -10, 0] : 0,
                        }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6"
                      >
                        <Quote className="w-6 h-6 text-blue-500" />
                      </motion.div>

                      {/* Rating Stars */}
                      <div className="flex items-center mb-6">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 * i, duration: 0.3 }}
                          >
                            <Star
                              size={20}
                              className={`${i < testimonial.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          </motion.div>
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {testimonial.rating}.0
                        </span>
                      </div>

                      {/* Testimonial Content */}
                      <blockquote className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed italic flex-grow">
                        "{testimonial.content}"
                      </blockquote>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-6 p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{testimonial.eventsJoined}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Events</div>
                        </div>
                        <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{testimonial.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Author Info */}
                      <div className="flex items-center">
                        <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center mr-4 text-white font-semibold text-lg shadow-lg`}>
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${testimonial.gradient} opacity-20 blur-xl`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalSlides)].map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-300'
                  }`}
                />
              ))}
            </div>
          )}
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
                <Heart className="w-6 h-6 text-red-300" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Ready to create your success story?</div>
                <div className="text-sm text-white/80">Join our community of passionate athletes today</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join Now
            </motion.button>
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

export default Testimonials