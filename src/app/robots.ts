import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/account/', '/admin/', '/api/'],
      },
    ],
    sitemap: 'https://brickquotepro.com/sitemap.xml',
    host: 'https://brickquotepro.com',
  };
}
