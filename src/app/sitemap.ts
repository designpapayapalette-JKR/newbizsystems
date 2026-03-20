import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://newbizsystems.in';

  // Base routes for the public facing landing pages and legal
  const publicRoutes = [
    '',
    '/login',
    '/signup',
    '/privacy',
    '/terms',
    '/refund-policy',
  ];

  const sitemapEntries = publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'monthly' : ('yearly' as "monthly" | "yearly" | "always" | "hourly" | "daily" | "weekly" | "never"),
    priority: route === '' ? 1.0 : 0.8,
  }));

  return sitemapEntries;
}
