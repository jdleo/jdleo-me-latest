'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';

type Algorithm = 'bubble' | 'quick' | 'insertion' | 'selection';

type Particle = {
    id: number;
    width: string;
    height: string;
    backgroundColor: string;
    boxShadow: string;
    left: string;
    top: string;
    animationDuration: string;
    animationDelay: string;
};

const ARRAY_SIZE = 30;
const ANIMATION_SPEED = 30;

export default function Sort() {
    const [array, setArray] = useState<number[]>([]);
    const [sorting, setSorting] = useState(false);
    const [algorithm, setAlgorithm] = useState<Algorithm>('bubble');
    const [comparing, setComparing] = useState<[number, number] | null>(null);
    const [swapping, setSwapping] = useState<[number, number] | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    const generateArray = () => {
        const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 100) + 1);
        setArray(newArray);
        setComparing(null);
        setSwapping(null);
    };

    useEffect(() => {
        generateArray();
        setIsLoaded(true);

        // Generate particles once on component mount
        const newParticles = Array.from({ length: 8 }, (_, i) => {
            return {
                id: i,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: `rgba(${150 + Math.random() * 100}, ${150 + Math.random() * 100}, ${
                    200 + Math.random() * 55
                }, ${0.3 + Math.random() * 0.3})`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${150 + Math.random() * 100}, ${
                    150 + Math.random() * 100
                }, ${200 + Math.random() * 55}, 0.3)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
            };
        });

        setParticles(newParticles);
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
        <div className='min-h-screen bg-[color:var(--background)] overflow-hidden orbital-grid'>
            {/* Background gradient effects */}
            <div className='fixed inset-0 bg-[color:var(--background)] z-[-2]' />
            <div
                className='fixed top-[-50%] left-[-20%] w-[140%] h-[140%] z-[-1] opacity-30 animate-spin-slow'
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(94, 106, 210, 0.1) 0%, transparent 70%)',
                    transformOrigin: 'center center',
                    animationDuration: '120s',
                }}
            />

            {/* Header */}
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-[color:var(--foreground)] text-opacity-70 text-sm sm:text-base'>
                    <Link href='/apps' className='linear-link'>
                        Apps
                    </Link>
                    <Link href='/' className='linear-link'>
                        Home
                    </Link>
                    <a href={`mailto:${strings.EMAIL}`} className='linear-link'>
                        Email
                    </a>
                    <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='linear-link'>
                        LinkedIn
                    </a>
                    <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='linear-link'>
                        GitHub
                    </a>
                </nav>
            </header>

            <main
                className={`flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4 pt-24 transition-opacity duration-700 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className='mb-4 text-center'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                        <span className='gradient-text'>Sort Visualization</span>
                    </h1>
                    <p className='text-[color:var(--foreground)] text-opacity-70 max-w-md'>
                        Watch and learn how different sorting algorithms work in real-time.
                    </p>
                </div>

                <div className='relative w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] glass-card rounded-full flex items-center justify-center'>
                    <div className='absolute inset-0 rounded-full'></div>
                    {array.map((value, index) => {
                        const angle = (index / array.length) * 2 * Math.PI;
                        const radius = getRadius();
                        // Calculate position from center of container
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                            <div
                                key={index}
                                className={`
                                    absolute w-2 h-2 sm:w-4 sm:h-4 rounded-full
                                    transition-all duration-300
                                    ${
                                        comparing?.includes(index)
                                            ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.7)] scale-150'
                                            : swapping?.includes(index)
                                            ? 'bg-[color:var(--primary)] shadow-orbital-glow-sm scale-150'
                                            : 'bg-[color:var(--foreground)] bg-opacity-80'
                                    }
                                `}
                                style={{
                                    transform: `translate(${x}px, ${y}px) scale(${value / 50 + 0.5})`,
                                }}
                            />
                        );
                    })}
                </div>

                <div className='flex flex-col items-center gap-4 w-full max-w-md'>
                    <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 w-full'>
                        <select
                            value={algorithm}
                            onChange={e => setAlgorithm(e.target.value as Algorithm)}
                            className='px-4 py-2 rounded-lg bg-[color:var(--secondary)] border border-[color:var(--border)]
                                     text-[color:var(--foreground)] text-sm focus:outline-none focus:border-[color:var(--primary)]
                                     transition-all duration-300 disabled:opacity-50'
                            disabled={sorting}
                        >
                            <option value='bubble'>Bubble Sort</option>
                            <option value='quick'>Quick Sort</option>
                            <option value='insertion'>Insertion Sort</option>
                            <option value='selection'>Selection Sort</option>
                        </select>
                        <button
                            onClick={generateArray}
                            disabled={sorting}
                            className='px-4 py-2 rounded-lg bg-[color:var(--secondary)] border border-[color:var(--border)]
                                     text-[color:var(--foreground)] text-sm hover:bg-opacity-80 
                                     transition-all duration-300 disabled:opacity-50'
                        >
                            Generate New Array
                        </button>
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
                            className='relative px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
                                     text-white text-sm overflow-hidden group transition-all hover:shadow-orbital-glow-sm
                                     disabled:opacity-50 disabled:hover:shadow-none'
                        >
                            <span className='absolute inset-0 w-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-50 group-hover:w-full transition-all duration-500 blur-lg'></span>
                            <span className='relative z-10'>{sorting ? 'Sorting...' : 'Start Sorting'}</span>
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className='glass-card p-4 rounded-lg flex flex-wrap gap-4 justify-center'>
                    <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-[color:var(--foreground)] bg-opacity-80'></div>
                        <span className='text-[color:var(--foreground)] text-opacity-70 text-sm'>Normal</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'></div>
                        <span className='text-[color:var(--foreground)] text-opacity-70 text-sm'>Comparing</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full bg-[color:var(--primary)] shadow-orbital-glow-sm'></div>
                        <span className='text-[color:var(--foreground)] text-opacity-70 text-sm'>Swapping</span>
                    </div>
                </div>

                {/* Floating particles for orbital effect */}
                <div className='fixed inset-0 pointer-events-none'>
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className='absolute rounded-full animate-float'
                            style={{
                                width: particle.width,
                                height: particle.height,
                                backgroundColor: particle.backgroundColor,
                                boxShadow: particle.boxShadow,
                                left: particle.left,
                                top: particle.top,
                                animationDuration: particle.animationDuration,
                                animationDelay: particle.animationDelay,
                            }}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
