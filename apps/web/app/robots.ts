import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/superadmin/', '/suspended/'],
    },
    sitemap: 'https://happypets.example.com/sitemap.xml',
  }
}
