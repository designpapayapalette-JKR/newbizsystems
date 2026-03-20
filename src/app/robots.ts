import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://newbizsystems.in';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/CRM/dashboard/', '/CRM/settings/', '/api/', '/CRM/onboarding/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
