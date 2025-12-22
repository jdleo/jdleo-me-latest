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
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/sorting-algorithm-visualizer</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Controls & Complexity */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Interface</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-8'>
                                        <div className='flex flex-col gap-2 mb-4 font-mono'>
                                            <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                            <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                        </div>
                                        <div className='space-y-4 font-mono'>
                                            <div className='flex flex-col gap-1'>
                                                <span className='text-[9px] opacity-40 uppercase tracking-widest'>$ set --algo</span>
                                                <div className='flex flex-wrap gap-2'>
                                                    {(['bubble', 'quick', 'insertion', 'selection'] as Algorithm[]).map(a => (
                                                        <button key={a} onClick={() => setAlgorithm(a)} disabled={sorting} className={`px-2 py-1 border text-[9px] uppercase tracking-widest rounded transition-all ${algorithm === a ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] opacity-40 hover:opacity-100'}`}>
                                                            {a}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button onClick={generateArray} disabled={sorting} className='w-full py-2 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-widest rounded'>[REGEN_ARRAY]</button>
                                            <button onClick={startSort} disabled={sorting} className='w-full py-2 border border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] uppercase tracking-widest rounded font-bold'>{sorting ? 'PROCESSING...' : '[START_SORT]'}</button>
                                        </div>
                                    </nav>

                                    <div className='space-y-6 font-mono border-t border-[var(--color-border)] pt-8'>
                                        <div>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ info --complexity</span>
                                            <div className='space-y-3'>
                                                <div className='flex justify-between text-[10px]'>
                                                    <span className='opacity-40 uppercase'>Avg_Time:</span>
                                                    <span className='text-[var(--color-accent)]'>{complexInfo[algorithm].time}</span>
                                                </div>
                                                <div className='flex justify-between text-[10px]'>
                                                    <span className='opacity-40 uppercase'>Aux_Space:</span>
                                                    <span className='text-[var(--color-accent)]'>{complexInfo[algorithm].space}</span>
                                                </div>
                                                <p className='text-[9px] text-[var(--color-text-dim)] uppercase leading-relaxed italic mt-2'>
                                                    "{complexInfo[algorithm].desc}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className='pt-6 border-t border-[var(--color-border)]'>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ cat legend.log</span>
                                            <div className='space-y-2 opacity-60'>
                                                <div className='text-[9px] flex items-center gap-2'><div className='w-1.5 h-1.5 rounded-full bg-white/20' /> NORMAL</div>
                                                <div className='text-[9px] flex items-center gap-2'><div className='w-1.5 h-1.5 rounded-full bg-yellow-400' /> COMPARING</div>
                                                <div className='text-[9px] flex items-center gap-2'><div className='w-1.5 h-1.5 rounded-full bg-blue-500' /> SWAPPING</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Display: Circular Visualizer */}
                            <div className='terminal-pane bg-black/40 flex flex-col items-center justify-center p-8 overflow-hidden w-full'>
                                <div className='relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex items-center justify-center animate-spin-slow-mobile md:animate-spin-very-slow'>
                                    {array.map((value, index) => {
                                        const angle = (index / array.length) * 2 * Math.PI;
                                        const radius = 180;
                                        const x = Math.cos(angle) * radius;
                                        const y = Math.sin(angle) * radius;
                                        const isComp = comparing?.includes(index);
                                        const isSwap = swapping?.includes(index);

                                        return (
                                            <div
                                                key={index}
                                                className={`absolute rounded-full transition-all duration-300 ${isComp ? 'bg-yellow-400 w-4 h-4 shadow-[0_0_20px_rgba(250,204,21,0.8)] z-10' : isSwap ? 'bg-blue-500 w-4 h-4 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-10' : 'bg-white/10 w-2 h-2'}`}
                                                style={{ transform: `translate(${x}px, ${y}px) scale(${value / 50 + 0.3})` }}
                                            />
                                        );
                                    })}
                                </div>
                                <div className='mt-12 flex items-center gap-10 opacity-20 font-mono text-[10px] uppercase tracking-[0.5em]'>
                                    <span>N = {ARRAY_SIZE}</span>
                                    <span>S = {ANIMATION_SPEED}ms</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Console decoration */}
                    <div className='mt-6 px-4 flex items-center justify-between text-[10px] font-mono text-[var(--color-text-dim)] opacity-40 uppercase tracking-[0.2em]'>
                        <div className='flex gap-6'>
                            <span>Protocol: TCP/IP_V4</span>
                            <span>Encryption: TLS_1.3</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse' />
                            Status: processing_complete
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
