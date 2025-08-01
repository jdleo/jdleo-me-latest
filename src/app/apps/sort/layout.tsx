import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
    title: 'Sort Visualization - Watch Algorithms in Action',
    description:
        'Watch and learn how different sorting algorithms work in real-time. Interactive visualization of bubble sort, quick sort, merge sort, and more.',
    url: '/apps/sort',
    type: 'article',
});

export default function SortLayout({ children }: { children: React.ReactNode }) {
    return children;
}
