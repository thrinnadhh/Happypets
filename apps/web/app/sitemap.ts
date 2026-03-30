import { MetadataRoute } from 'next'

// In a real app we'd fetch dynamic products here too
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://happypets.example.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://happypets.example.com/products',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: 'https://happypets.example.com/login',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://happypets.example.com/register',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
