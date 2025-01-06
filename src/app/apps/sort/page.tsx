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

    const generateArray = () => {
        const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 100) + 1);
        setArray(newArray);
        setComparing(null);
        setSwapping(null);
    };

    useEffect(() => {
        generateArray();
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
        if (width < 640) return 120; // mobile
        return 200; // desktop
    };

    return (
        <div className='flex min-h-screen bg-[#1d1d1d] overflow-hidden'>
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-white/70 font-nunito text-sm sm:text-base'>
                    <Link href='/apps' className='hover:text-white transition-colors'>
                        Apps
                    </Link>
                    <a href={`mailto:${strings.EMAIL}`} className='hover:text-white transition-colors'>
                        Email
                    </a>
                    <a
                        href={strings.LINKEDIN_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        LinkedIn
                    </a>
                    <a
                        href={strings.GITHUB_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        GitHub
                    </a>
                </nav>
            </header>

            <main className='flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4'>
                <div className='relative w-[280px] h-[280px] sm:w-[500px] sm:h-[500px]'>
                    {array.map((value, index) => {
                        const angle = (index / array.length) * 2 * Math.PI;
                        const radius = getRadius();
                        const x = radius + Math.cos(angle) * radius;
                        const y = radius + Math.sin(angle) * radius;

                        return (
                            <div
                                key={index}
                                className={`
                                    absolute w-2 h-2 sm:w-4 sm:h-4 rounded-full
                                    transition-all duration-300 backdrop-blur-sm
                                    ${
                                        comparing?.includes(index)
                                            ? 'bg-yellow-400/80 shadow-lg shadow-yellow-400/50 scale-150'
                                            : swapping?.includes(index)
                                            ? 'bg-purple-400/80 shadow-lg shadow-purple-400/50 scale-150'
                                            : 'bg-white/80 shadow-md'
                                    }
                                `}
                                style={{
                                    left: x,
                                    top: y,
                                    transform: `translate(-50%, -50%) scale(${value / 50 + 0.5})`,
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
                            className='w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 text-white font-nunito 
                                     text-sm focus:outline-none focus:bg-white/20'
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
                            className='w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 
                                     text-white font-nunito text-sm transition-colors'
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
                            className='w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-purple-400/80 
                                     via-pink-400/80 to-blue-400/80 text-white font-nunito 
                                     text-sm hover:opacity-90 transition-opacity'
                        >
                            Start Sorting
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
