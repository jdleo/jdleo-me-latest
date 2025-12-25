import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/api/dev-logs'],
                disallow: ['/api/', '/private/'],
            },
        ],
        sitemap: 'https://jdleo.me/sitemap.xml',
    };
}
