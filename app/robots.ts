import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/sales', '/quote/', '/privacy-policy', '/terms'],
        disallow: ['/admin', '/api/'],
      },
    ],
  };
}
