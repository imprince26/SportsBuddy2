import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title, 
  description, 
  image, 
  article = false,
  keywords = '',
  ogType = 'website',
  schema = null
}) => {
  const { pathname } = useLocation();
  const siteUrl = 'https://sports-buddy2.vercel.app';
  const defaultImage = `${siteUrl}/logo.svg`;
  const siteTitle = 'SportsBuddy - Connect with Athletes and Sports Events';
  const defaultDescription = 'SportsBuddy helps you connect with athletes, join sports events, and build your sports community.';
  
  const fullUrl = `${siteUrl}${pathname}`;
  const imageUrl = image || defaultImage;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={article ? 'article' : ogType} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="SportsBuddy" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Add JSON-LD Structured Data if provided */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  article: PropTypes.bool,
  keywords: PropTypes.string,
  ogType: PropTypes.string,
  schema: PropTypes.object
};

export default SEO;