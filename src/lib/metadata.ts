import { Metadata } from 'next';
import { strings } from '@/app/constants/strings';

const defaultMetadata = {
    title: strings.NAME,
    description: strings.DESCRIPTION,
    siteName: 'John Leonardo - Senior Software Engineer',
    domain: 'https://jdleo.me',
    twitter: '@jdleo',
    image: '/og-image.png',
    locale: 'en_US',
    type: 'website' as const,
};

export interface MetadataProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'profile';
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
    noIndex?: boolean;
    canonical?: string;
}

export function generateMetadata({
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    tags,
    noIndex = false,
    canonical,
}: MetadataProps = {}): Metadata {
    const siteTitle = title ? `${title} | ${defaultMetadata.siteName}` : defaultMetadata.siteName;

    const siteDescription = description || defaultMetadata.description;
    const siteImage = image ? `${defaultMetadata.domain}${image}` : `${defaultMetadata.domain}${defaultMetadata.image}`;
    const siteUrl = url ? `${defaultMetadata.domain}${url}` : defaultMetadata.domain;

    const metadata: Metadata = {
        title: siteTitle,
        description: siteDescription,
        keywords: [...strings.KEYWORDS],
        authors: [...strings.AUTHORS],
        creator: strings.NAME,
        publisher: strings.NAME,
        robots: noIndex ? 'noindex,nofollow' : 'index,follow',

        // Open Graph
        openGraph: {
            type,
            title: siteTitle,
            description: siteDescription,
            url: siteUrl,
            siteName: defaultMetadata.siteName,
            locale: defaultMetadata.locale,
            images: [
                {
                    url: siteImage,
                    width: 1200,
                    height: 630,
                    alt: title || defaultMetadata.siteName,
                },
            ],
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
            ...(tags && { tags }),
        },

        // Twitter
        twitter: {
            card: 'summary_large_image',
            site: defaultMetadata.twitter,
            creator: defaultMetadata.twitter,
            title: siteTitle,
            description: siteDescription,
            images: [siteImage],
        },

        // Verification
        verification: {
            other: {
                me: [defaultMetadata.domain, strings.LINKEDIN_URL, strings.GITHUB_URL],
            },
        },

        // Additional metadata
        metadataBase: new URL(defaultMetadata.domain),
        alternates: {
            canonical: canonical || siteUrl,
        },
        other: {
            'mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'default',
            'format-detection': 'telephone=no',
            'theme-color': '#5e6ad2',
        },
    };

    return metadata;
}

// Structured Data Generator
export function generateStructuredData(props: {
    type: 'Person' | 'WebSite' | 'WebPage' | 'Article' | 'SoftwareApplication';
    data: Record<string, any>;
}) {
    const baseContext = {
        '@context': 'https://schema.org',
        '@type': props.type,
        ...props.data,
    };

    return JSON.stringify(baseContext);
}

// Person structured data for John Leonardo
export const personStructuredData = generateStructuredData({
    type: 'Person',
    data: {
        name: strings.NAME,
        url: defaultMetadata.domain,
        image: `${defaultMetadata.domain}/og-image.png`,
        jobTitle: 'Senior Software Engineer',
        worksFor: {
            '@type': 'Organization',
            name: 'Roblox',
        },
        alumniOf: [
            {
                '@type': 'Organization',
                name: 'Amazon',
            },
            {
                '@type': 'Organization',
                name: 'IBM',
            },
        ],
        sameAs: [strings.LINKEDIN_URL, strings.GITHUB_URL],
        knowsAbout: [
            'Software Engineering',
            'Distributed Systems',
            'AI Engineering',
            'System Design',
            'AWS',
            'TypeScript',
            'Rust',
            'Go',
            'Java',
            'Python',
        ],
        email: `mailto:${strings.EMAIL}`,
    },
});

// Website structured data
export const websiteStructuredData = generateStructuredData({
    type: 'WebSite',
    data: {
        name: defaultMetadata.siteName,
        url: defaultMetadata.domain,
        description: defaultMetadata.description,
        author: {
            '@type': 'Person',
            name: strings.NAME,
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: `${defaultMetadata.domain}/apps?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    },
});
