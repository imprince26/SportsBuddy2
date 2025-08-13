import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://sports-buddy2.vercel.app';

// Define your routes manually for better control
const routes = [
  '/',
  '/login',
  '/register',
  '/events',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
];

const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map((route) => {
      return `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  // Write to the dist directory (Vite's build output)
  const distPath = path.resolve(__dirname, '../../dist');
  const sitemapPath = path.join(distPath, 'sitemap.xml');
  
  // Ensure the dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('Dist directory does not exist. Make sure to run build first.');
    process.exit(1);
  }
  
  fs.writeFileSync(sitemapPath, sitemap.trim());
  console.log('✅ Sitemap generated successfully at dist/sitemap.xml');
};

generateSitemap();