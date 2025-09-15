import Link from 'next/link';
import { generateStructuredData } from '@/lib/metadata';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    // Generate structured data for breadcrumbs
    const breadcrumbStructuredData = generateStructuredData({
        type: 'WebPage',
        data: {
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                item: `https://jdleo.me${item.href}`,
            })),
        },
    });

    return (
        <>
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: breadcrumbStructuredData }} />
            <nav
                aria-label='Breadcrumb'
                className={`flex items-center space-x-2 text-sm text-gray-600 font-serif mb-6 ${className}`}
            >
                {items.map((item, index) => (
                    <div key={item.href} className='flex items-center'>
                        {index > 0 && (
                            <svg
                                className='w-4 h-4 mx-2 text-gray-400'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                                aria-hidden='true'
                            >
                                <path
                                    fillRule='evenodd'
                                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        )}
                        {index === items.length - 1 ? (
                            <span className='text-gray-900 font-medium font-serif' aria-current='page'>
                                {item.label}
                            </span>
                        ) : (
                            <Link href={item.href} className='hover:text-blue-600 transition-colors font-serif'>
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
        </>
    );
}
