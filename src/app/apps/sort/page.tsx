'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WebVitals } from '@/components/SEO/WebVitals';

type Algorithm = 'bubble' | 'quick' | 'insertion' | 'selection';

const ARRAY_SIZE = 40;
const ANIMATION_SPEED = 20;

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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        generateArray();
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
        setComparing(null); setSwapping(null); setSorting(false);
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
        setComparing(null); setSwapping(null); setSorting(false);
    };

    const selectionSort = async () => {
        setSorting(true);
        const arr = [...array];
        for (let i = 0; i < arr.length; i++) {
            let minIdx = i;
            for (let j = i + 1; j < arr.length; j++) {
                setComparing([minIdx, j]);
                await sleep(ANIMATION_SPEED);
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx !== i) {
                setSwapping([i, minIdx]);
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                setArray([...arr]);
            }
        }
        setComparing(null); setSwapping(null); setSorting(false);
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
        setComparing(null); setSwapping(null); setSorting(false);
    };

    const startSort = () => {
        if (algorithm === 'bubble') bubbleSort();
        else if (algorithm === 'quick') quickSort();
        else if (algorithm === 'insertion') insertionSort();
        else if (algorithm === 'selection') selectionSort();
        setIsMobileMenuOpen(false);
    };

    const complexInfo = {
        bubble: { time: 'O(n²)', space: 'O(1)', desc: 'Brute-force adjacent swaps.' },
        quick: { time: 'O(n log n)', space: 'O(log n)', desc: 'Divide and conquer via pivot.' },
        insertion: { time: 'O(n²)', space: 'O(1)', desc: 'Build sorted array incrementaly.' },
        selection: { time: 'O(n²)', space: 'O(1)', desc: 'Min-element isolation and placement.' },
    };

    return (
        <>
            <WebVitals />
            <main className='relative h-screen bg-[#fafbff] overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] flex flex-col md:flex-row'>

                {/* Mobile Header */}
                <header className='md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-white/80 backdrop-blur-md z-50'>
                    <Link href='/apps' className='text-sm font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)]'>
                        ← Apps
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className='px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-[var(--fg-4)] flex items-center gap-1.5'
                    >
                        <span>Menu</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Sort Studio</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Algorithm</h3>
                            <div className='grid grid-cols-2 gap-2'>
                                {(['bubble', 'quick', 'insertion', 'selection'] as Algorithm[]).map(a => (
                                    <button
                                        key={a}
                                        onClick={() => setAlgorithm(a)}
                                        disabled={sorting}
                                        className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${algorithm === a
                                                ? 'bg-[var(--purple-4)] text-white border-[var(--purple-4)] shadow-md'
                                                : 'bg-white text-[var(--fg-4)] border-[var(--border-light)] hover:border-[var(--purple-4)]'
                                            }`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Controls</h3>
                            <div className='space-y-3'>
                                <button
                                    onClick={startSort}
                                    disabled={sorting}
                                    className='w-full py-3 bg-[var(--fg-4)] hover:bg-[var(--purple-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {sorting ? 'Sorting...' : 'Start Sort'}
                                </button>
                                <button
                                    onClick={generateArray}
                                    disabled={sorting}
                                    className='w-full py-3 bg-white border border-[var(--border-light)] hover:border-[var(--purple-4)] text-[var(--fg-4)] hover:text-[var(--purple-4)] font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50'
                                >
                                    Reset Array
                                </button>
                            </div>
                        </div>

                        <div className='pt-6 border-t border-[var(--border-light)]'>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Analysis</h3>
                            <div className='bg-white p-4 rounded-xl border border-[var(--border-light)] space-y-3 shadow-sm'>
                                <div className='flex justify-between items-center text-xs'>
                                    <span className='text-muted font-medium'>Time Complexity</span>
                                    <span className='font-bold text-[var(--purple-4)] bg-[var(--purple-1)] px-2 py-1 rounded'>{complexInfo[algorithm].time}</span>
                                </div>
                                <div className='flex justify-between items-center text-xs'>
                                    <span className='text-muted font-medium'>Space Complexity</span>
                                    <span className='font-bold text-[var(--purple-4)] bg-[var(--purple-1)] px-2 py-1 rounded'>{complexInfo[algorithm].space}</span>
                                </div>
                                <p className='text-[10px] text-muted leading-relaxed pt-2 border-t border-[var(--border-light)]'>
                                    {complexInfo[algorithm].desc}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-hidden flex flex-col items-center justify-center p-8 relative z-10'>
                        <div className='relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center'>
                            {/* Central label */}
                            <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0'>
                                <span className='text-6xl font-black text-[var(--purple-1)] opacity-50 tracking-tighter'>{algorithm.charAt(0).toUpperCase() + algorithm.slice(1)}</span>
                                <span className='text-sm font-bold text-[var(--purple-4)] uppercase tracking-[0.3em] mt-2 opacity-60'>Sort Visualization</span>
                            </div>

                            {array.map((value, index) => {
                                const angle = (index / array.length) * 2 * Math.PI - Math.PI / 2;
                                const radius = 50 + (value * 2); // Dynamic radius based on value
                                const x = Math.cos(angle) * (120 + value); // Spiral effect
                                const y = Math.sin(angle) * (120 + value);

                                // Simplified Circular Layout
                                const circleRadius = 140; // Base radius
                                const cx = Math.cos(angle) * circleRadius;
                                const cy = Math.sin(angle) * circleRadius;

                                // Bar height extension
                                const barHeight = value * 1.5;
                                const tx = Math.cos(angle) * (circleRadius + barHeight);
                                const ty = Math.sin(angle) * (circleRadius + barHeight);

                                const isComp = comparing?.includes(index);
                                const isSwap = swapping?.includes(index);

                                return (
                                    <div
                                        key={index}
                                        className={`absolute w-1.5 md:w-2 rounded-full origin-center transition-all duration-300 shadow-sm
                                            ${isComp ? 'bg-yellow-400 z-20 scale-125 shadow-[0_0_15px_rgba(250,204,21,0.6)]' :
                                                isSwap ? 'bg-green-500 z-20 scale-125 shadow-[0_0_15px_rgba(34,197,94,0.6)]' :
                                                    'bg-[var(--purple-4)]'}`}
                                        style={{
                                            height: `${20 + value * 2}px`,
                                            transform: `rotate(${angle + Math.PI / 2}rad) translate(0, ${100}px)`,
                                            opacity: isComp || isSwap ? 1 : 0.6
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <div className='mt-12 flex gap-8'>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-[var(--purple-4)] opacity-60' />
                                <span className='text-[10px] font-bold uppercase tracking-wider text-muted'>Value</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-yellow-400' />
                                <span className='text-[10px] font-bold uppercase tracking-wider text-muted'>Compare</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-green-500' />
                                <span className='text-[10px] font-bold uppercase tracking-wider text-muted'>Swap</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Sort Controls</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-4 space-y-6'>
                                <div>
                                    <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Algorithm</h3>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {(['bubble', 'quick', 'insertion', 'selection'] as Algorithm[]).map(a => (
                                            <button
                                                key={a}
                                                onClick={() => setAlgorithm(a)}
                                                disabled={sorting}
                                                className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${algorithm === a
                                                        ? 'bg-[var(--purple-4)] text-white border-[var(--purple-4)]'
                                                        : 'bg-white text-[var(--fg-4)] border-[var(--border-light)]'
                                                    }`}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className='space-y-3 pt-4 border-t border-[var(--border-light)]'>
                                    <button
                                        onClick={startSort}
                                        disabled={sorting}
                                        className='w-full py-3 bg-[var(--fg-4)] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md'
                                    >
                                        {sorting ? 'Sorting...' : 'Start Sort'}
                                    </button>
                                    <button
                                        onClick={() => { generateArray(); setIsMobileMenuOpen(false); }}
                                        disabled={sorting}
                                        className='w-full py-3 bg-white border border-[var(--border-light)] text-[var(--fg-4)] font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm'
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
