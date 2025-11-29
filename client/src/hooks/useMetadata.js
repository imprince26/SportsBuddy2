import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Default metadata for SportsBuddy
const DEFAULT_META = {
  title: 'SportsBuddy - Connect with Athletes and Sports Events',
  description: 'Plan, discover, and manage sports events with SportsBuddy. Connect athletes, venues, and teams effortlessly.',
  image: 'https://sports-buddy2.vercel.app/og-home.png',
  url: window.location.origin,
  type: 'website',
  siteName: 'SportsBuddy',
  locale: 'en_US',
  keywords: 'sportsbuddy, sports events, athlete network, event management, team finder, tournaments'
};

// Page-specific metadata configurations
const PAGE_META = {
  '/': {
    title: 'SportsBuddy - Connect with Athletes and Sports Events',
    description: 'Plan, discover, and manage sports events with SportsBuddy. Connect athletes, venues, and teams effortlessly.',
    image: 'https://sports-buddy2.vercel.app/og-home.png'
  },
  '/events': {
    title: 'Sports Events - Discover & Join Amazing Sports Events',
    description: 'Find and join sports events near you. Connect with fellow athletes and participate in tournaments, training sessions, and competitions.',
    image: 'https://sports-buddy2.vercel.app/og-events.png',
    keywords: 'sports events, tournaments, competitions, training, join events, sports activities'
  },
  '/venues': {
    title: 'Sports Venues - Find Perfect Venues for Your Games',
    description: 'Book courts, fields, and sports facilities near you. Find the perfect venue for your next game or training session.',
    image: 'https://sports-buddy2.vercel.app/og-venues.png',
    keywords: 'sports venues, book courts, sports facilities, fields, stadiums, arenas'
  },
  '/athletes': {
    title: 'Top Athletes - Meet Elite Sports Professionals',
    description: 'Connect with elite athletes and sports professionals. Find coaches, trainers, and fellow sports enthusiasts.',
    image: 'https://sports-buddy2.vercel.app/og-athletes.png',
    keywords: 'athletes, sports professionals, coaches, trainers, sports network'
  },
  '/leaderboard': {
    title: 'Leaderboard - Top Performers & Champions',
    description: 'View the top performers and champions in SportsBuddy. Compete, achieve, and climb the ranks.',
    image: 'https://sports-buddy2.vercel.app/og-leaderboard.png',
    keywords: 'leaderboard, rankings, champions, top performers, sports achievements'
  },
  '/community': {
    title: 'Sports Community - Connect with Fellow Athletes',
    description: 'Join the SportsBuddy community. Share experiences, find teammates, and connect with sports enthusiasts worldwide.',
    image: 'https://sports-buddy2.vercel.app/og-home.png',
    keywords: 'sports community, athletes network, sports discussions, teammates'
  },
  '/login': {
    title: 'Login - SportsBuddy',
    description: 'Login to your SportsBuddy account to access events, venues, and connect with athletes.',
    image: 'https://sports-buddy2.vercel.app/og-home.png'
  },
  '/register': {
    title: 'Join SportsBuddy - Create Your Account',
    description: 'Create your SportsBuddy account and start connecting with athletes, discovering events, and booking venues.',
    image: 'https://sports-buddy2.vercel.app/og-home.png'
  },
  '/dashboard': {
    title: 'Dashboard - SportsBuddy',
    description: 'Your personal dashboard on SportsBuddy. Manage your events, bookings, and sports activities.',
    image: 'https://sports-buddy2.vercel.app/og-home.png'
  },
  '/profile': {
    title: 'My Profile - SportsBuddy',
    description: 'Manage your SportsBuddy profile, achievements, and sports preferences.',
    image: 'https://sports-buddy2.vercel.app/og-home.png'
  },
  '/settings': {
    title: 'Settings - SportsBuddy',
    description: 'Customize your SportsBuddy experience with personalized settings and preferences.',
    image: 'https://sports-buddy2.vercel.app/og-home.png'
  },
  '/notifications': {
    title: 'Notifications - SportsBuddy',
    description: 'Stay updated with the latest notifications from SportsBuddy events and community.',
    image: 'https://sports-buddy2.vercel.app/og-home.png'
  }
};

// Dynamic metadata for specific entities (events, venues, users)
const getDynamicMeta = (pathname, data = {}) => {
  const baseUrl = window.location.origin;

  // Event details page
  if (pathname.startsWith('/events/') && data.event) {
    const event = data.event;
    const image = event.images?.[0]?.url || 'https://sports-buddy2.vercel.app/og-events.png';
    const eventDate = new Date(event.date).toLocaleDateString();
    const participantCount = event.participants?.length || 0;
    const maxParticipants = event.maxParticipants || 'unlimited';

    return {
      title: `${event.name} - Sports Event on SportsBuddy`,
      description: `${event.description} | Date: ${eventDate} | Location: ${event.location?.city || 'TBD'} | Participants: ${participantCount}/${maxParticipants} | Sport: ${event.category}`,
      image,
      url: `${baseUrl}${pathname}`,
      type: 'article',
      keywords: `${event.category}, ${event.category} event, sports event, ${event.location?.city} sports, tournament`
    };
  }

  // Venue details page
  if (pathname.startsWith('/venues/') && data.venue) {
    const venue = data.venue;
    const image = venue.images?.[0]?.url || 'https://sports-buddy2.vercel.app/og-venues.png';
    const sports = venue.sports?.join(', ') || 'Multiple sports';
    const rating = venue.averageRating || 'Not rated';

    return {
      title: `${venue.name} - Sports Venue on SportsBuddy`,
      description: `${venue.description} | Location: ${venue.location?.city}, ${venue.location?.state} | Sports: ${sports} | Rating: ${rating}/5.0 | Capacity: ${venue.capacity || 'N/A'}`,
      image,
      url: `${baseUrl}${pathname}`,
      type: 'place',
      keywords: `${venue.name}, sports venue, ${venue.location?.city} sports, ${sports}, sports facility`
    };
  }

  // User profile page
  if (pathname.startsWith('/profile/') && data.user) {
    const user = data.user;
    const image = user.avatar?.url || user.coverImage?.url || 'https://sports-buddy2.vercel.app/og-athletes.png';
    const sports = user.sportsPreferences?.map(pref => pref.sport).join(', ') || 'Multiple sports';
    const achievements = user.achievements?.length || 0;

    return {
      title: `${user.name} - Athlete Profile on SportsBuddy`,
      description: `${user.bio || `Sports enthusiast specializing in ${sports}`} | Achievements: ${achievements} | Location: ${user.location?.city || 'N/A'} | Events participated: ${user.stats?.eventsParticipated || 0}`,
      image,
      url: `${baseUrl}${pathname}`,
      type: 'profile',
      keywords: `${user.name}, athlete, ${sports}, sports profile, ${user.location?.city} athlete`
    };
  }

  // Community details page
  if (pathname.startsWith('/community/') && data.community) {
    const community = data.community;
    const image = community.banner || community.logo || '/https://sports-buddy2.vercel.app/og-home.png';

    return {
      title: `${community.name} - Sports Community on SportsBuddy`,
      description: `${community.description} | Members: ${community.members?.length || 0} | Sport: ${community.sport || 'General sports'}`,
      image,
      url: `${baseUrl}${pathname}`,
      type: 'website',
      keywords: `${community.name}, sports community, ${community.sport} community, sports group`
    };
  }

  return null;
};

// Update document meta tags
const updateMetaTags = (meta) => {
  const { title, description, image, url, type, siteName, locale, keywords } = meta;

  // Update document title
  document.title = title;

  // Update or create meta tags
  const updateMetaTag = (property, content, name = 'property') => {
    let element = document.querySelector(`meta[${name}="${property}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(name, property);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Basic meta tags
  updateMetaTag('name', 'title', 'name');
  updateMetaTag('title', title, 'name');
  updateMetaTag('name', 'description', 'name');
  updateMetaTag('description', description, 'name');
  updateMetaTag('name', 'keywords', 'name');
  updateMetaTag('keywords', keywords || DEFAULT_META.keywords, 'name');

  // Open Graph tags
  updateMetaTag('property', 'og:title', 'property');
  updateMetaTag('og:title', title, 'property');
  updateMetaTag('property', 'og:description', 'property');
  updateMetaTag('og:description', description, 'property');
  updateMetaTag('property', 'og:image', 'property');
  updateMetaTag('og:image', image, 'property');
  updateMetaTag('property', 'og:url', 'property');
  updateMetaTag('og:url', url || DEFAULT_META.url, 'property');
  updateMetaTag('property', 'og:type', 'property');
  updateMetaTag('og:type', type || DEFAULT_META.type, 'property');
  updateMetaTag('property', 'og:site_name', 'property');
  updateMetaTag('og:site_name', siteName || DEFAULT_META.siteName, 'property');
  updateMetaTag('property', 'og:locale', 'property');
  updateMetaTag('og:locale', locale || DEFAULT_META.locale, 'property');

  // Twitter Card tags
  updateMetaTag('name', 'twitter:card', 'name');
  updateMetaTag('twitter:card', 'summary_large_image', 'name');
  updateMetaTag('name', 'twitter:title', 'name');
  updateMetaTag('twitter:title', title, 'name');
  updateMetaTag('name', 'twitter:description', 'name');
  updateMetaTag('twitter:description', description, 'name');
  updateMetaTag('name', 'twitter:image', 'name');
  updateMetaTag('twitter:image', image, 'name');
};

// Custom hook for managing metadata
export const useMetadata = (data = {}) => {
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    // Get dynamic metadata first (for specific entities)
    let meta = getDynamicMeta(pathname, data);

    // If no dynamic metadata, get page-specific metadata
    if (!meta) {
      meta = PAGE_META[pathname] || DEFAULT_META;
    }

    // Ensure all required fields are present
    meta = {
      ...DEFAULT_META,
      ...meta,
      url: `${window.location.origin}${pathname}`
    };

    // Update meta tags
    updateMetaTags(meta);
  }, [pathname, data]);

  // Return current meta for debugging or manual updates
  return {
    updateMeta: updateMetaTags,
    getCurrentMeta: () => {
      const meta = getDynamicMeta(pathname, data) || PAGE_META[pathname] || DEFAULT_META;
      return {
        ...DEFAULT_META,
        ...meta,
        url: `${window.location.origin}${pathname}`
      };
    }
  };
};

export default useMetadata;