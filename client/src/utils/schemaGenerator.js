// Event schema
export const generateEventSchema = (event) => {
  if (!event) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": event.title,
    "description": event.description,
    "startDate": event.startDate,
    "endDate": event.endDate,
    "location": {
      "@type": "Place",
      "name": event.venue?.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.venue?.city,
        "addressRegion": event.venue?.state,
        "addressCountry": event.venue?.country
      }
    },
    "image": event.image,
    "organizer": {
      "@type": "Person",
      "name": event.organizer?.name
    }
  };
};

// Profile schema
export const generateProfileSchema = (user) => {
  if (!user) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": `${user.firstName} ${user.lastName}`,
    "description": user.bio,
    "image": user.profileImage,
    "sameAs": [
      user.socialLinks?.twitter,
      user.socialLinks?.instagram,
      user.socialLinks?.facebook
    ].filter(Boolean)
  };
};

// Organization schema (for homepage)
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "SportsBuddy",
    "url": "https://your-sportsbuddy-app.vercel.app",
    "logo": "https://your-sportsbuddy-app.vercel.app/logo.svg",
    "description": "SportsBuddy helps you connect with athletes, join sports events, and build your sports community."
  };
};