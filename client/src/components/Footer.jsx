import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
  Trophy, ArrowRight, Mail, Phone, MapPin, Heart,
  Star, Globe, Users, Calendar,
  Zap, Activity, Target,
  Shield
} from 'lucide-react'
import {
  FaFacebook as Facebook,
  FaLinkedin as Linkedin,
  FaYoutube as Youtube,
  FaInstagram as Instagram
} from "react-icons/fa";
import { FaXTwitter as Twitter } from "react-icons/fa6";
import { cn } from "@/lib/utils";

const Footer = () => {
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
    { label: 'Football', path: '/events?category=Football', count: '450+' },
    { label: 'Basketball', path: '/events?category=Basketball', count: '320+' },
    { label: 'Tennis', path: '/events?category=Tennis', count: '280+' },
    { label: 'Running', path: '/events?category=Running', count: '520+' },
    { label: 'Cycling', path: '/events?category=Cycling', count: '190+' },
    { label: 'Swimming', path: '/events?category=Swimming', count: '150+' },
  ]

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/' },
  ]

  return (
    <footer className="bg-background border-t border-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
      
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <span className="text-2xl font-bold font-heading tracking-tight text-foreground group-hover:text-primary transition-colors">
                SportsBuddy
              </span>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              The ultimate platform for sports enthusiasts to discover events,
              connect with athletes, and build lasting friendships.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="mt-1.5">123 Sports Avenue, India 12345</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <a href="tel:+911234567890" className="hover:text-foreground transition-colors">
                  +91 1234567890
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground group">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <a href="mailto:support@sportsbuddy.com" className="hover:text-foreground transition-colors">
                  support@sportsbuddy.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-white hover:bg-primary hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-bold font-heading text-foreground mb-6 text-lg">Navigation</h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-300" />
                    {link.label}
                    {link.featured && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-primary/20">New</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-bold font-heading text-foreground mb-6 text-lg">Platform</h3>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Sports */}
          <div>
            <h3 className="font-bold font-heading text-foreground mb-6 text-lg">Popular Sports</h3>
            <div className="space-y-3">
              {popularSports.map((sport) => (
                <Link
                  key={sport.path}
                  to={sport.path}
                  className="flex items-center justify-between text-sm group p-2 rounded-lg hover:bg-secondary/50 transition-colors -mx-2"
                >
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                    {sport.label}
                  </span>
                  <Badge variant="secondary" className="text-xs bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {sport.count}
                  </Badge>
                </Link>
              ))}
            </div>
            <Link
              to="/events"
              className="inline-flex items-center mt-6 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
            >
              Explore All Sports <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} SportsBuddy. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground font-medium">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://github.com/imprince26"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              Prince Patel
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
