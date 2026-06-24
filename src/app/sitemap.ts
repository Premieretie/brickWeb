import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://brickquotepro.com';
  const lastmod = new Date('2026-06-21');

  const routes = [
    { url: '/', priority: 1.0 },
    { url: '/quote', priority: 0.9 },
    { url: '/measure', priority: 0.8 },
    { url: '/faq', priority: 0.7 },
    { url: '/contractors', priority: 0.7 },
    { url: '/join', priority: 0.6 },
    { url: '/terms', priority: 0.4 },
    { url: '/privacy', priority: 0.4 },
    { url: '/contractor-agreement', priority: 0.4 },
    { url: '/services/brick-fences', priority: 0.8 },
    { url: '/services/block-fences', priority: 0.8 },
    { url: '/services/retaining-walls', priority: 0.8 },
    { url: '/services/brick-mailboxes', priority: 0.7 },
    { url: '/services/brick-piers', priority: 0.7 },
    { url: '/services/brick-walls', priority: 0.7 },
    { url: '/services/front-fences', priority: 0.7 },
    { url: '/services/boundary-walls', priority: 0.7 },
    { url: '/locations/brisbane', priority: 0.8 },
    { url: '/locations/gold-coast', priority: 0.8 },
    { url: '/locations/ipswich', priority: 0.7 },
    { url: '/locations/logan', priority: 0.7 },
    { url: '/locations/moreton-bay', priority: 0.7 },
    { url: '/locations/redlands', priority: 0.7 },
    { url: '/locations/sunshine-coast', priority: 0.7 },
    { url: '/blog/brick-fence-cost-brisbane-2026', priority: 0.6 },
    { url: '/blog/brick-mailbox-cost', priority: 0.6 },
    { url: '/blog/brick-vs-block-fence', priority: 0.6 },
    { url: '/blog/choose-bricklayer-brisbane', priority: 0.6 },
    { url: '/blog/retaining-wall-costs-brisbane', priority: 0.6 },
  ];

  return routes.map(({ url, priority }) => ({
    url: `${base}${url}`,
    lastModified: lastmod,
    changeFrequency: url === '/' ? 'weekly' : 'monthly',
    priority,
  }));
}
