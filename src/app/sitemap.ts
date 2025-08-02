import { MetadataRoute } from 'next';
import { apps } from './constants/apps';
import { getAllBlogPosts } from '../blog/registry';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://jdleo.me';
    const currentDate = new Date().toISOString();

    // Static routes
    const routes = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/apps`,
            lastModified: currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
    ];

    // Dynamic app routes
    const appRoutes = apps.map(app => ({
        url: `${baseUrl}${app.href}`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Blog post routes
    const blogPosts = getAllBlogPosts();
    const blogRoutes = blogPosts.map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.date,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [...routes, ...appRoutes, ...blogRoutes];
}
