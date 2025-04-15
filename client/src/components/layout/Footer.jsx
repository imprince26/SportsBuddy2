import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Home,
  Calendar,
  User,
  Shield,
  Trophy,
} from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();

  const footerLinks = {
    about: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Mission', to: '/mission' },
      { label: 'Contact', to: '/contact' },
    ],
    quickLinks: [
      { to: '/', label: 'Home', icon: Home },
      { to: '/events', label: 'Events', icon: Calendar },
      ...(user ? [{ to: '/dashboard', label: 'Dashboard', icon: User }] : []),
      ...(user?.role === 'admin' ? [{ to: '/admin/users', label: 'Admin', icon: Shield }] : []),
    ],
    contact: [
      { label: '123 Sports Ave, City', icon: MapPin },
      { label: 'support@sportsbuddy.com', icon: Mail, href: 'mailto:support@sportsbuddy.com' },
      { label: '+1 (555) 123-4567', icon: Phone, href: 'tel:+15551234567' },
    ],
    social: [
      { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
      { label: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
      { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    ],
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-background-light dark:bg-background-dark text-foreground py-12 relative overflow-hidden"
    >
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/10 dark:to-secondary/10 opacity-30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-extrabold text-primary">SportsBuddy</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your go-to platform for sports events, community, and competition.
            </p>
            <ul className="mt-4 space-y-3">
              {footerLinks.about.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-foreground hover:text-accent transition-all duration-300 hover:underline hover:underline-offset-4"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-extrabold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center space-x-2 text-foreground hover:text-accent transition-all duration-300 group"
                  >
                    <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-extrabold text-primary mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {footerLinks.contact.map(({ label, icon: Icon, href }) => (
                <li key={label} className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-secondary" />
                  {href ? (
                    <a
                      href={href}
                      className="text-foreground hover:text-accent transition-all duration-300"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className="text-foreground">{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-extrabold text-primary mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {footerLinks.social.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative p-2 rounded-full bg-muted/50 text-foreground hover:text-accent transition-all duration-300 group"
                >
                  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="sr-only">{label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-6 border-t border-border text-center"
        >
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} SportsBuddy. Built for the love of sports.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;