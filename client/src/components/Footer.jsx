import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Trophy, ArrowRight, Mail, Phone, MapPin, Heart,
  ChevronRight, Star, Globe, Users, Calendar,
  Zap, Activity, Target, ExternalLink,
  Shield
} from 'lucide-react'
import {
  FaFacebook as Facebook,
  FaLinkedin as Linkedin,
  FaYoutube as Youtube,
  FaInstagram as Instagram
} from "react-icons/fa";
import { FaXTwitter as Twitter } from "react-icons/fa6";

const Footer = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (email) {
      setIsSubscribing(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
      setIsSubscribing(false)
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail('')
      }, 3000)
    }
  }

  const currentYear = new Date().getFullYear()

  const navigationLinks = [
    { label: 'Home', path: '/', icon: Trophy },
    { label: 'Browse Events', path: '/events', icon: Calendar },
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Community', path: '/community', icon: Users },
    { label: 'Create Event', path: '/events/create', icon: Target, featured: true },
  ]

  const platformLinks = [
    { label: 'About SportsBuddy', path: '/about', icon: Globe },
    { label: 'How It Works', path: '/how-it-works', icon: Zap },
    { label: 'Success Stories', path: '/stories', icon: Star },
    { label: 'Help Center', path: '/help', icon: Shield },
    { label: 'Contact Support', path: '/contact', icon: Mail },
  ]

  const popularSports = [
    { label: 'Football', path: '/events?category=Football', count: '450+', color: 'text-green-400' },
    { label: 'Basketball', path: '/events?category=Basketball', count: '320+', color: 'text-orange-400' },
    { label: 'Tennis', path: '/events?category=Tennis', count: '280+', color: 'text-blue-400' },
    { label: 'Running', path: '/events?category=Running', count: '520+', color: 'text-purple-400' },
    { label: 'Cycling', path: '/events?category=Cycling', count: '190+', color: 'text-cyan-400' },
    { label: 'Swimming', path: '/events?category=Swimming', count: '150+', color: 'text-indigo-400' },
  ]

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/', color: '#1877F2', description: 'Join our community' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/', color: '#111111', description: 'Latest updates' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/', color: '#E4405F', description: 'Behind the scenes' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/', color: '#0A66C2', description: 'Professional network' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/', color: '#FF0000', description: 'Video content' },
  ]

  const stats = [
    { label: 'Active Athletes', value: '15K+', icon: Users, color: 'text-blue-400' },
    { label: 'Events Created', value: '2.5K+', icon: Calendar, color: 'text-green-400' },
    { label: 'Cities Covered', value: '150+', icon: Globe, color: 'text-purple-400' },
    { label: 'Sports Available', value: '25+', icon: Trophy, color: 'text-yellow-400' },
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-t border-gray-200/20 dark:border-gray-700/20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-blue-950/20" />

      </div>

      <div className="relative z-10">

        {/* Main Footer Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="container mx-auto px-4 py-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-7 h-7 text-white"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.93 4.93 4.24 4.24" />
                      <path d="m14.83 9.17 4.24-4.24" />
                      <path d="m14.83 14.83 4.24 4.24" />
                      <path d="m9.17 14.83-4.24 4.24" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    SportsBuddy
                  </span>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium -mt-1">
                    Find Your Game
                  </div>
                </div>
              </Link>

              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                SportsBuddy is the ultimate platform for sports enthusiasts to discover events,
                connect with like-minded athletes, and build lasting friendships through sports.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    123 Sports Avenue<br />
                    India 12345
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <a
                    href="tel:+11234567890"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    +91 1234567890
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <a
                    href="mailto:support@sportsbuddy.com"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    support@example.com
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
                  Connect With Us
                </h4>
                <div className="flex space-x-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <motion.a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:border-transparent transition-all duration-300 overflow-hidden"
                        style={{
                          '--hover-color': social.color
                        }}
                      >
                        <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors z-10 relative" />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ backgroundColor: social.color }}
                        />
                      </motion.a>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Navigation
              </h3>
              <ul className="space-y-3">
                {navigationLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                      >
                        <Icon className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                        <span>{link.label}</span>
                        {link.featured && (
                          <Badge className="ml-2 bg-blue-100 text-blue-600 text-xs">New</Badge>
                        )}
                        <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.div>

            {/* Platform Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Platform
              </h3>
              <ul className="space-y-3">
                {platformLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                      >
                        <Icon className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                        <span>{link.label}</span>
                        <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.div>

            {/* Popular Sports */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Popular Sports
              </h3>
              <div className="space-y-3">
                {popularSports.map((sport) => (
                  <Link
                    key={sport.path}
                    to={sport.path}
                    className="group flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${sport.color.replace('text-', 'bg-')} mr-3`} />
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white font-medium">
                        {sport.label}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {sport.count}
                    </Badge>
                  </Link>
                ))}
              </div>

              <Link
                to="/events"
                className="inline-flex items-center mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
              >
                Explore All Sports
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Footer */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="border-t border-gray-200 dark:border-gray-700"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <motion.div variants={itemVariants} className="text-center lg:text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  &copy; {currentYear} SportsBuddy. All rights reserved.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 text-sm">
                {[
                  { label: 'Privacy Policy', path: '/privacy-policy' },
                  { label: 'Terms of Service', path: '/terms-of-service' },
                  { label: 'Cookie Policy', path: '/cookie-policy' },
                  { label: 'Accessibility', path: '/accessibility' },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-end mb-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500 mr-2" />
                  </motion.div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Made with love for sports enthusiasts
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Crafted by{" "}
                  <a
                    href="https://github.com/imprince26"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center transition-colors"
                  >
                    Prince Patel
                    <motion.span
                      className="inline-block ml-1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      ✨
                    </motion.span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
