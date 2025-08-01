'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';

type Algorithm = 'bubble' | 'quick' | 'insertion' | 'selection';

const ARRAY_SIZE = 30;
const ANIMATION_SPEED = 30;

export default function Sort() {
    const [array, setArray] = useState<number[]>([]);
    const [sorting, setSorting] = useState(false);
    const [algorithm, setAlgorithm] = useState<Algorithm>('bubble');
    const [comparing, setComparing] = useState<[number, number] | null>(null);
    const [swapping, setSwapping] = useState<[number, number] | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const generateArray = () => {
        const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 100) + 1);
        setArray(newArray);
        setComparing(null);
        setSwapping(null);
    };

    useEffect(() => {
        generateArray();
        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const bubbleSort = async () => {
        setSorting(true);
        const arr = [...array];
        let swapped;

        do {
            swapped = false;
            for (let i = 0; i < arr.length - 1; i++) {
                setComparing([i, i + 1]);
                await sleep(ANIMATION_SPEED);

                if (arr[i] > arr[i + 1]) {
                    setSwapping([i, i + 1]);
                    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                    setArray([...arr]);
                    swapped = true;
                }
            }
        } while (swapped);

        setComparing(null);
        setSwapping(null);
        setSorting(false);
    };

    const insertionSort = async () => {
        setSorting(true);
        const arr = [...array];

        for (let i = 1; i < arr.length; i++) {
            let j = i;
            while (j > 0 && arr[j - 1] > arr[j]) {
                setComparing([j - 1, j]);
                await sleep(ANIMATION_SPEED);
                setSwapping([j - 1, j]);
                [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
                setArray([...arr]);
                j--;
            }
        }

        setComparing(null);
        setSwapping(null);
        setSorting(false);
    };

    const selectionSort = async () => {
        setSorting(true);
        const arr = [...array];

        for (let i = 0; i < arr.length; i++) {
            let minIdx = i;

            for (let j = i + 1; j < arr.length; j++) {
                setComparing([minIdx, j]);
                await sleep(ANIMATION_SPEED);

                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }

            if (minIdx !== i) {
                setSwapping([i, minIdx]);
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                setArray([...arr]);
            }
        }

        setComparing(null);
        setSwapping(null);
        setSorting(false);
    };

    const quickSort = async () => {
        setSorting(true);
        const arr = [...array];

        const partition = async (low: number, high: number) => {
            const pivot = arr[high];
            let i = low - 1;

            for (let j = low; j < high; j++) {
                setComparing([j, high]);
                await sleep(ANIMATION_SPEED);

                if (arr[j] < pivot) {
                    i++;
                    setSwapping([i, j]);
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    setArray([...arr]);
                }
            }

            setSwapping([i + 1, high]);
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            setArray([...arr]);

            return i + 1;
        };

        const sort = async (low: number, high: number) => {
            if (low < high) {
                const pi = await partition(low, high);
                await sort(low, pi - 1);
                await sort(pi + 1, high);
            }
        };

        await sort(0, arr.length - 1);
        setComparing(null);
        setSwapping(null);
        setSorting(false);
    };

    const getRadius = () => {
        if (typeof window === 'undefined') return 100;
        const width = window.innerWidth;
        if (width < 640) return 100; // mobile - smaller radius
        return 180; // desktop - adjusted radius
    };

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
            {/* Subtle background gradients */}
            <div
                className='fixed inset-0 opacity-40 pointer-events-none'
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                }}
            />

            {/* Strong Navigation Bar */}
            <nav className='nav-container'>
                <div className='nav-content'>
                    <Link href='/' className='nav-logo'>
                        JL
                    </Link>
                    <div className='nav-links'>
                        <Link href='/apps' className='nav-link'>
                            Apps
                        </Link>
                        <Link href='/' className='nav-link'>
                            Home
                        </Link>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            LinkedIn
                        </a>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            <main className='main-content'>
                <div className='container-responsive max-w-6xl'>
                    {/* Hero Section */}
                    <section className={`text-center mb-8 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                        <h1 className='text-h1 gradient-text mb-4'>Sort Visualization</h1>
                        <p className='text-body opacity-80 max-w-2xl mx-auto'>
                            Watch and learn how different sorting algorithms work in real-time with beautiful circular
                            visualization.
                        </p>
                    </section>

                    {/* Visualization Section */}
                    <section className={`mb-8 animate-reveal animate-reveal-delay-1 ${isLoaded ? '' : 'opacity-0'}`}>
                        <div className='glass-card-enhanced p-8 rounded-3xl'>
                            <div className='flex justify-center mb-8'>
                                <div className='relative w-[280px] h-[280px] md:w-[400px] md:h-[400px] flex items-center justify-center'>
                                    {/* Circular visualization */}
                                    {array.map((value, index) => {
                                        const angle = (index / array.length) * 2 * Math.PI;
                                        const radius = getRadius();
                                        const x = Math.cos(angle) * radius;
                                        const y = Math.sin(angle) * radius;

                                        return (
                                            <div
                                                key={index}
                                                className={`
                                                    absolute w-3 h-3 md:w-4 md:h-4 rounded-full
                                                    transition-all duration-300 ease-out
                                                    ${
                                                        comparing?.includes(index)
                                                            ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)] scale-150 z-10'
                                                            : swapping?.includes(index)
                                                            ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] scale-150 z-10'
                                                            : 'bg-gray-600 shadow-sm'
                                                    }
                                                `}
                                                style={{
                                                    transform: `translate(${x}px, ${y}px) scale(${value / 50 + 0.5})`,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className='flex flex-col gap-4 max-w-2xl mx-auto'>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                                    {/* Algorithm Selector */}
                                    <select
                                        value={algorithm}
                                        onChange={e => setAlgorithm(e.target.value as Algorithm)}
                                        className='glass-card-subtle border border-gray-200 px-4 py-3 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all duration-200'
                                        disabled={sorting}
                                    >
                                        <option value='bubble'>Bubble Sort</option>
                                        <option value='quick'>Quick Sort</option>
                                        <option value='insertion'>Insertion Sort</option>
                                        <option value='selection'>Selection Sort</option>
                                    </select>

                                    {/* Generate Array Button */}
                                    <button
                                        onClick={generateArray}
                                        disabled={sorting}
                                        className='button-secondary disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        <span>Generate New Array</span>
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        >
                                            <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
                                            <path d='M21 3v5h-5' />
                                            <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
                                            <path d='M3 21v-5h5' />
                                        </svg>
                                    </button>

                                    {/* Start Sorting Button */}
                                    <button
                                        onClick={() => {
                                            switch (algorithm) {
                                                case 'bubble':
                                                    bubbleSort();
                                                    break;
                                                case 'quick':
                                                    quickSort();
                                                    break;
                                                case 'insertion':
                                                    insertionSort();
                                                    break;
                                                case 'selection':
                                                    selectionSort();
                                                    break;
                                            }
                                        }}
                                        disabled={sorting}
                                        className='button-primary disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        <span>{sorting ? 'Sorting...' : 'Start Sorting'}</span>
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            stroke='currentColor'
                                            strokeWidth='2'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        >
                                            <polygon points='5,3 19,12 5,21' />
                                        </svg>
                                    </button>
                                </div>

                                {/* Legend */}
                                <div className='glass-card border border-gray-200 p-4 rounded-xl'>
                                    <div className='flex flex-wrap gap-6 justify-center'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 rounded-full bg-gray-600'></div>
                                            <span className='text-small opacity-70'>Normal</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'></div>
                                            <span className='text-small opacity-70'>Comparing</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'></div>
                                            <span className='text-small opacity-70'>Swapping</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Algorithm Info */}
                    <section className={`animate-reveal animate-reveal-delay-2 ${isLoaded ? '' : 'opacity-0'}`}>
                        <div className='glass-card p-6 rounded-xl text-center'>
                            <h3 className='text-h3 mb-2'>
                                {algorithm.charAt(0).toUpperCase() + algorithm.slice(1)} Sort
                            </h3>
                            <p className='text-body opacity-70'>
                                {algorithm === 'bubble' &&
                                    'Compares adjacent elements and swaps them if they are in the wrong order. Simple but inefficient.'}
                                {algorithm === 'quick' &&
                                    'Divides the array around a pivot element and recursively sorts the subarrays. Very efficient on average.'}
                                {algorithm === 'insertion' &&
                                    'Builds the final sorted array one item at a time. Efficient for small datasets.'}
                                {algorithm === 'selection' &&
                                    'Finds the minimum element and places it at the beginning. Simple but not very efficient.'}
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
