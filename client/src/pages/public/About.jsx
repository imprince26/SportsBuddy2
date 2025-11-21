import React, { useState, useEffect } from 'react'
import {
  Users,
  Target,
  Heart,
  Trophy,
  Zap,
  Globe,
  Star,
  Shield,
  CheckCircle,
  Award,
  Activity,
  Calendar,
  MapPin,
  Play,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Building,
  Mail,
  Phone,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Facebook,
  Youtube
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

const About = () => {
  const [activeTab, setActiveTab] = useState('vision')
  const [hoveredCard, setHoveredCard] = useState(null)

  // Page title
  useEffect(() => {
    document.title = "About Us - SportsBuddy"
  }, [])

  // Our Mission & Vision
  const missionData = {
    vision: {
      title: "Our Vision",
      description: "To create the world's largest and most inclusive sports community where every athlete, from beginners to professionals, can connect, grow, and achieve their sporting dreams.",
      icon: Target,
      color: "blue",
      stats: [
        { label: "Active Users", value: "50K+", icon: Users },
        { label: "Events Created", value: "10K+", icon: Calendar },
        { label: "Cities Covered", value: "100+", icon: MapPin }
      ]
    },
    mission: {
      title: "Our Mission",
      description: "We're on a mission to break down barriers in sports participation by providing a platform that connects athletes, organizes events, and builds lasting communities around shared sporting passions.",
      icon: Heart,
      color: "purple",
      stats: [
        { label: "Sports Categories", value: "25+", icon: Trophy },
        { label: "Communities", value: "500+", icon: Users },
        { label: "Success Stories", value: "1K+", icon: Star }
      ]
    },
    values: {
      title: "Our Values",
      description: "Inclusivity, community, excellence, and fun drive everything we do. We believe sports should be accessible to everyone, regardless of skill level, background, or experience.",
      icon: Shield,
      color: "green",
      stats: [
        { label: "User Satisfaction", value: "98%", icon: Heart },
        { label: "Safety Score", value: "99.9%", icon: Shield },
        { label: "Community Rating", value: "4.9/5", icon: Star }
      ]
    }
  }

  // Company timeline
  const timeline = [
    {
      year: "2022",
      title: "The Beginning",
      description: "SportsBuddy was founded in Ahmedabad with a vision to connect sports enthusiasts",
      milestone: "Company Founded",
      icon: Sparkles,
      color: "blue"
    },
    {
      year: "2023",
      title: "First Milestone",
      description: "Reached 10,000 users and launched in 10 cities across India",
      milestone: "10K Users",
      icon: Users,
      color: "green"
    },
    {
      year: "2024",
      title: "Major Growth",
      description: "Expanded to 50+ cities and introduced premium features",
      milestone: "50K Users",
      icon: TrendingUp,
      color: "purple"
    },
    {
      year: "2025",
      title: "Global Vision",
      description: "Planning international expansion and advanced AI features",
      milestone: "Going Global",
      icon: Globe,
      color: "orange"
    }
  ]

  // Our features
  const features = [
    {
      icon: Users,
      title: "Community Building",
      description: "Connect with like-minded athletes in your area",
      color: "blue",
      stats: "50K+ Active Members"
    },
    {
      icon: Calendar,
      title: "Event Management",
      description: "Create, discover, and join sports events effortlessly",
      color: "green",
      stats: "10K+ Events Monthly"
    },
    {
      icon: Trophy,
      title: "Skill Development",
      description: "Track progress and improve your sporting abilities",
      color: "purple",
      stats: "25+ Sports Covered"
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description: "Verified users and secure event management",
      color: "red",
      stats: "99.9% Safety Score"
    }
  ]

  // Company stats
  const companyStats = [
    { label: "Active Users", value: "50,000+", icon: Users, color: "blue" },
    { label: "Events Created", value: "10,000+", icon: Calendar, color: "green" },
    { label: "Cities", value: "100+", icon: MapPin, color: "purple" },
    { label: "Sports Categories", value: "25+", icon: Trophy, color: "orange" },
    { label: "User Rating", value: "4.9/5", icon: Star, color: "yellow" },
    { label: "Success Stories", value: "1,000+", icon: Heart, color: "pink" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-green-950/20" />

        {/* Floating Sports Icons */}
        {[Trophy, Star, Heart, Target, Users].map((Icon, i) => (
          <div
            key={i}
            className="absolute text-blue-200/10 dark:text-blue-400/15 animate-bounce"
            style={{
              left: `${15 + (i * 18) % 70}%`,
              top: `${20 + (i * 30) % 60}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          >
            <Icon size={24 + (i % 3) * 8} />
          </div>
        ))}

        {/* Animated Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 dark:bg-blue-300/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section
          className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700"
        >
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                    About SportsBuddy
                  </h1>
                  <p className="text-lg text-center mt-2 text-gray-600 dark:text-gray-400">
                    Connecting athletes, building communities
                  </p>
                </div>
              </div>
            </div>

            <p
              className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-200"
            >
              SportsBuddy is India's fastest-growing sports community platform, designed to bring athletes together,
              organize events, and create lasting connections through the power of sports. From weekend warriors to
              professional athletes, we're building a world where everyone can find their sporting tribe.
            </p>

            {/* Company Stats */}
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto mb-16 animate-in slide-in-from-bottom-4 duration-700 delay-300"
            >
              {companyStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:scale-105 hover:-translate-y-1 transition-all duration-200"
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-500 mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What Drives Us
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our core principles guide every decision we make and every feature we build
              </p>
            </motion.div>

            <div className="flex justify-center mb-8">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-2 border border-gray-200/50 dark:border-gray-700/50">
                {Object.keys(missionData).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === key
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    {missionData[key].title}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 bg-${missionData[activeTab].color}-100 dark:bg-${missionData[activeTab].color}-900/30 rounded-xl flex items-center justify-center`}>

                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {missionData[activeTab].title}
                    </h3>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {missionData[activeTab].description}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {missionData[activeTab].stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className={`w-12 h-12 bg-${missionData[activeTab].color}-100 dark:bg-${missionData[activeTab].color}-900/30 rounded-lg flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 text-${missionData[activeTab].color}-600 dark:text-${missionData[activeTab].color}-400`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What We Offer
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Comprehensive tools and features designed to enhance your sporting experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onHoverStart={() => setHoveredCard(`feature-${index}`)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-14 h-14 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <Badge variant="outline" className={`text-${feature.color}-600 border-${feature.color}-200`}>
                    {feature.stats}
                  </Badge>

                  {hoveredCard === `feature-${index}` && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Timeline Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                From a small startup to India's leading sports community platform
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full hidden lg:block" />

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                      }`}
                  >
                    {/* Content */}
                    <div className="flex-1 lg:max-w-md">
                      <motion.div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="outline" className={`text-${item.color}-600 border-${item.color}-200`}>
                            {item.year}
                          </Badge>
                          <Badge className={`bg-${item.color}-100 text-${item.color}-800 border-0`}>
                            {item.milestone}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.description}
                        </p>
                      </motion.div>
                    </div>

                    {/* Timeline Icon */}
                    <div className="relative">
                      <motion.div
                        className={`w-16 h-16 bg-${item.color}-100 dark:bg-${item.color}-900/30 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                      </motion.div>
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="flex-1 lg:max-w-md hidden lg:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white overflow-hidden relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)
                  `
                }} />
              </div>

              <CardContent className="p-12 text-center relative z-10">
                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    Ready to Join the SportsBuddy Community?
                  </h2>
                  <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                    Whether you're looking to find training partners, join events, or organize competitions,
                    SportsBuddy is your gateway to an active sporting lifestyle.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-8">
                    <Users className="w-5 h-5 mr-2" />
                    Join Community
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-medium px-8">
                    <Calendar className="w-5 h-5 mr-2" />
                    Browse Events
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-8 text-white/80">
                  <div className="text-center">
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-sm">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">10K+</div>
                    <div className="text-sm">Events Monthly</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.9/5</div>
                    <div className="text-sm">User Rating</div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Contact Info Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 h-full">
                <CardContent className="p-6 text-center">
                  <Building className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Our Office
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Science City Road, Sola<br />
                    Ahmedabad, Gujarat 380060<br />
                    India
                  </p>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 h-full">
                <CardContent className="p-6 text-center">
                  <Mail className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Get in Touch
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    contact@sportsbuddy.com<br />
                    support@sportsbuddy.com<br />
                    partnerships@sportsbuddy.com
                  </p>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 h-full">
                <CardContent className="p-6 text-center">
                  <Phone className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Call Us
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    +91 79 4848 1234<br />
                    Mon-Fri: 9 AM - 6 PM IST<br />
                    Sat: 10 AM - 4 PM IST
                  </p>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}

export default About
