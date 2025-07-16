import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Trophy, ArrowRight, Mail, Phone, MapPin, Heart,
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  ChevronRight, Check
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your backend
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Events', path: '/events' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Create Event', path: '/events/create' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const popularSports = [
    { label: 'Football', path: '/events?category=Football' },
    { label: 'Basketball', path: '/events?category=Basketball' },
    { label: 'Tennis', path: '/events?category=Tennis' },
    { label: 'Running', path: '/events?category=Running' },
    { label: 'Cycling', path: '/events?category=Cycling' },
    { label: 'Swimming', path: '/events?category=Swimming' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com', color: '#1877F2' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com', color: '#1DA1F2' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com', color: '#E4405F' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com', color: '#0A66C2' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com', color: '#FF0000' },
  ];

  return (
    <footer className="bg-gradient-to-b from-transparent to-card-light dark:to-card-dark border-t border-border-light dark:border-border-dark">
      {/* Top Footer with Newsletter */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-primary-light/10 to-secondary-light/10 dark:from-primary-dark/10 dark:to-secondary-dark/10 rounded-2xl p-6 md:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-foreground-light dark:text-foreground-dark mb-2">
                Join Our Community
              </h3>
              <p className="text-muted-foreground-light dark:text-muted-foreground-dark max-w-md">
                Subscribe to our newsletter and stay updated with the latest sports events and community activities.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground-light dark:text-muted-foreground-dark" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background-light dark:bg-background-dark"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 px-6 bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark hover:opacity-90"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-primary-light dark:text-primary-dark"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span className="text-xl font-bold text-foreground-light dark:text-foreground-dark">
                SportsBuddy
              </span>
            </Link>

            <p className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-6">
              SportsBuddy connects sports enthusiasts to participate in local events, make friends, and stay active together.
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground-light dark:text-muted-foreground-dark mt-0.5" />
                <span className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
                  123 Sports Avenue, Athleticville, ST 12345
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground-light dark:text-muted-foreground-dark" />
                <a
                  href="tel:+11234567890"
                  className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                >
                  +1 (123) 456-7890
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground-light dark:text-muted-foreground-dark" />
                <a
                  href="mailto:support@sportsbuddy.com"
                  className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                >
                  support@sportsbuddy.com
                </a>
              </div>
            </div>

            {/* Enhanced Social Media Icons */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3 text-foreground-light dark:text-foreground-dark">
                Follow Us
              </h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileHover={{
                        scale: 1.15,
                        backgroundColor: social.color,
                        boxShadow: `0 0 12px ${social.color}`,
                        y: -4
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10
                      }}
                      className="h-10 w-10 rounded-full flex items-center justify-center border border-border-light dark:border-border-dark shadow-sm overflow-hidden relative group"
                      aria-label={social.name}
                    >
                      <motion.div
                        initial={{ opacity: 1 }}
                        whileHover={{ opacity: 0, rotate: 90 }}
                        className="absolute inset-0 flex items-center justify-center text-foreground-light dark:text-foreground-dark"
                      >
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center text-white"
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.15 }}
                        className="absolute inset-0 bg-white"
                      />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-base font-bold text-foreground-light dark:text-foreground-dark uppercase tracking-wider mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark flex items-center group"
                  >
                    <ChevronRight className="h-4 w-4 mr-2 text-primary-light/50 dark:text-primary-dark/50 transition-transform group-hover:translate-x-1" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Sports Column */}
          <div>
            <h3 className="text-base font-bold text-foreground-light dark:text-foreground-dark uppercase tracking-wider mb-4">
              Popular Sports
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {popularSports.map((sport) => (
                <Link
                  key={sport.path}
                  to={sport.path}
                  className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark hover:text-primary-light dark:hover:text-primary-dark flex items-center group"
                >
                  <ChevronRight className="h-4 w-4 mr-2 text-primary-light/50 dark:text-primary-dark/50 transition-transform group-hover:translate-x-1" />
                  {sport.label}
                </Link>
              ))}
            </div>

            <Link
              to="/events"
              className="inline-flex items-center mt-4 text-sm font-medium text-primary-light dark:text-primary-dark hover:underline"
            >
              View All Sports
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border-light dark:border-border-dark">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground-light dark:text-muted-foreground-dark mb-4 md:mb-0">
              &copy; {currentYear} SportsBuddy. All rights reserved.
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground-light dark:text-muted-foreground-dark">
              <Link
                to="/privacy-policy"
                className="hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-of-service"
                className="hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookie-policy"
                className="hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                to="/sitemap"
                className="hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-6 space-y-2">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 1 }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500 mr-2" />
              </motion.div>
              <span className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                Made with love for sports enthusiasts everywhere
              </span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground-light dark:text-muted-foreground-dark">
                Crafted by{" "}
                <a
                  href="https://github.com/imprince26"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-light dark:text-primary-dark hover:underline inline-flex items-center"
                >
                  Prince Patel
                  <motion.span
                    className="inline-block ml-1"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    ✨
                  </motion.span>
                </a>
                {" "}— <em className="italic font-medium text-secondary-light dark:text-secondary-dark">Connecting athletes, igniting passion!</em>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;