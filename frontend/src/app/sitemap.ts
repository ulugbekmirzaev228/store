import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nasiyago.uz';

  const routes = [
    '',
    '/catalog',
    '/terms',
    '/delivery',
    '/stores',
    '/contacts',
    '/status',
    '/compare',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  ['uz', 'ru'].forEach((lang) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route === '' ? 1.0 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
