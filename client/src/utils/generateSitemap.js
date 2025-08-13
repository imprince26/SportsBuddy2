import fs from 'fs';
import { globby } from 'globby';
import prettier from 'prettier';

const SITE_URL = 'https://sports-buddy2.vercel.app';

(async () => {
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js');
  const pages = await globby([
    'src/pages/**/*.jsx',
    '!src/pages/**/[*',  // Exclude dynamic routes for basic sitemap
    '!src/pages/_*.jsx',
    '!src/pages/404.jsx',
  ]);

  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages
        .map((page) => {
          const path = page
            .replace('src/pages', '')
            .replace('.jsx', '')
            .replace('/index', '');
          const route = path === '/index' ? '' : path;
          return `
            <url>
              <loc>${`${SITE_URL}${route}`}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>${route === '' ? '1.0' : '0.8'}</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  });

  fs.writeFileSync('public/sitemap.xml', formatted);
})();