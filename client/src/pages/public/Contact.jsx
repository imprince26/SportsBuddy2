import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  User,
  MessageSquare,
  Shield,
  Globe,
  Star,
  CheckCircle,
  Trophy,
  Users,
  Heart,
  Zap,
  ArrowRight,
  Headphones,
  Building,
  Navigation
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  FaFacebook as Facebook,
  FaLinkedin as Linkedin,
  FaYoutube as Youtube,
  FaInstagram as Instagram
} from "react-icons/fa";
import { FaXTwitter as Twitter } from "react-icons/fa6";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)

  // Page title
  useEffect(() => {
    document.title = "Contact Us - SportsBuddy"
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Contact methods
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@sportsbuddy.com",
      action: "Send Email",
      color: "blue",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      available: "24/7"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+91 79 4848 1234",
      action: "Call Now",
      color: "green",
      bgGradient: "from-green-500/20 to-emerald-500/20",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
      available: "9 AM - 6 PM IST"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with us for instant support",
      contact: "Available on website",
      action: "Start Chat",
      color: "purple",
      bgGradient: "from-purple-500/20 to-pink-500/20",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      available: "Mon-Fri 9 AM-6 PM"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come meet us at our Ahmedabad office",
      contact: "Science City Road, Sola",
      action: "Get Directions",
      color: "orange",
      bgGradient: "from-orange-500/20 to-red-500/20",
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      available: "Mon-Sat 10 AM-7 PM"
    }
  ]

  // Support categories
  const supportCategories = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "events", label: "Event Related" },
    { value: "account", label: "Account Issues" },
    { value: "partnership", label: "Partnership" },
    { value: "feedback", label: "Feedback" },
    { value: "other", label: "Other" }
  ]

  // Social media links
  const socialLinks = [
    { icon: Instagram, url: "https://instagram.com/sportsbuddy", color: "from-pink-500 to-purple-500", name: "Instagram" },
    { icon: Twitter, url: "https://twitter.com/sportsbuddy", color: "from-black to-gray-900", name: "Twitter" },
    { icon: Facebook, url: "https://facebook.com/sportsbuddy", color: "from-blue-600 to-blue-800", name: "Facebook" },
    { icon: Linkedin, url: "https://linkedin.com/company/sportsbuddy", color: "from-blue-700 to-blue-900", name: "LinkedIn" },
    { icon: Youtube, url: "https://youtube.com/sportsbuddy", color: "from-red-500 to-red-700", name: "YouTube" }
  ]

  // FAQ items
  const faqItems = [
    {
      question: "How do I create an event?",
      answer: "Simply log in to your account, click 'Create Event' and fill in the details. Our easy-to-use form will guide you through the process."
    },
    {
      question: "Is SportsBuddy free to use?",
      answer: "Yes! Creating an account and joining events is completely free. Some premium features may require a subscription."
    },
    {
      question: "How do I find events near me?",
      answer: "Use our location-based search feature on the Events page. You can filter by sport, distance, and date to find perfect matches."
    },
    {
      question: "Can I cancel my event registration?",
      answer: "Yes, you can cancel your registration up to 24 hours before the event start time through your dashboard."
    }
  ]

  // Office details
  const officeDetails = {
    name: "SportsBuddy India Headquarters",
    address: "Science City Road, Sola, Ahmedabad, Gujarat 380060, India",
    phone: "+91 79 4848 1234",
    email: "contact@sportsbuddy.com",
    hours: {
      weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
      weekend: "Saturday: 10:00 AM - 4:00 PM",
      closed: "Sunday: Closed"
    },
    coordinates: { lat: 23.0762, lng: 72.5050 }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success("Message sent successfully! We'll get back to you soon.")
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      })
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-green-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-green-950/20" />

        {/* Floating Sports Icons */}
        {[Shield, Trophy, Users, Heart, Star].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-blue-200/10 dark:text-blue-400/15"
            style={{
              left: `${15 + (i * 18) % 70}%`,
              top: `${20 + (i * 30) % 60}%`,
            }}
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.5 }}
          >
            <Icon size={24 + (i % 3) * 8} />
          </motion.div>
        ))}

        {/* Animated Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 dark:bg-blue-300/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
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
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          className="pt-16 pb-12 px-4 sm:px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                    Get in Touch
                  </h1>
                  <p className="text-lg text-center text-gray-600 dark:text-gray-400">
                    We're here to help you succeed
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              Have questions about SportsBuddy? Need help with your account? Want to partner with us?
              Our friendly team is here to help you connect with the sports community you love.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16"
            >
              {[
                { icon: Clock, label: "Avg Response", value: "< 2 hours", color: "blue" },
                { icon: Star, label: "Satisfaction", value: "99.5%", color: "yellow" },
                { icon: Users, label: "Team Members", value: "50+", color: "purple" },
                { icon: Globe, label: "Languages", value: "10+", color: "green" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-500 mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Methods */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-1 space-y-6"
            >
              <motion.h2
                variants={itemVariants}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Ways to Reach Us
              </motion.h2>

              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className={`relative bg-gradient-to-br ${method.bgGradient} backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${method.iconBg} rounded-xl flex items-center justify-center`}>
                      <method.icon className={`w-6 h-6 ${method.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {method.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {method.description}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        {method.contact}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {method.available}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`text-${method.color}-600 hover:text-${method.color}-700 p-0 h-auto font-medium`}
                        >
                          {method.action}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {hoveredCard === index && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.div>
              ))}

              {/* Office Location Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Our Office
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {officeDetails.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {officeDetails.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {officeDetails.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {officeDetails.email}
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-900 dark:text-white">Office Hours</p>
                    </div>
                    <div className="ml-7 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p>{officeDetails.hours.weekdays}</p>
                      <p>{officeDetails.hours.weekend}</p>
                      <p className="text-red-500">{officeDetails.hours.closed}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(officeDetails.address)}`, '_blank')}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Send us a Message
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name *
                        </Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address *
                        </Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email address"
                            className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </div>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={itemVariants}>
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category *
                        </Label>
                        <Select
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                          value={formData.category}
                        >
                          <SelectTrigger className="mt-2 bg-white/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {supportCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="Brief subject of your message"
                          className="mt-2 bg-white/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                      </motion.div>
                    </div>

                    <motion.div variants={itemVariants}>
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        className="mt-2 bg-white/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending Message...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Message
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Find quick answers to common questions about SportsBuddy
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={itemVariants} className="text-center mt-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Can't find what you're looking for?
              </p>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                View All FAQs
              </Button>
            </motion.div>
          </motion.section>

          {/* Social Media & Footer */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50">
              <CardContent className="p-8 text-center">
                <motion.div variants={itemVariants} className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Connect with SportsBuddy
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Follow us on social media for the latest updates and sports content
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-8">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-12 h-12 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200`}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Badge variant="outline" className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 px-4 py-2">
                    <Zap className="w-4 h-4 mr-2" />
                    Usually respond within 2 hours
                  </Badge>
                </motion.div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

export default Contact