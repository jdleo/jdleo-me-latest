'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    PlayIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

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
        insertion: { time: 'O(n²)', space: 'O(1)', desc: 'Build sorted array incrementally.' },
        selection: { time: 'O(n²)', space: 'O(1)', desc: 'Min-element isolation and placement.' },
    };

    return (
        <>
            <WebVitals />
            <main className='notion-page'>
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '1100px' }}>
                        <Link href='/' className='notion-nav-link' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href='/apps' className='notion-nav-link'>
                                <DevicePhoneMobileIcon className='notion-nav-icon' />
                                Apps
                            </Link>
                            <Link href='/blog' className='notion-nav-link'>
                                <PencilSquareIcon className='notion-nav-icon' />
                                Blog
                            </Link>
                            <Link href='/apps/resume' className='notion-nav-link'>
                                <DocumentTextIcon className='notion-nav-icon' />
                                Resume
                            </Link>
                        </div>
                    </div>
                </header>

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1100px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Sort Visualization</h1>
                        <div className='notion-subtitle'>Interactive visualization of classic sorting algorithms</div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            {(['bubble', 'quick', 'insertion', 'selection'] as Algorithm[]).map(a => (
                                <button
                                    key={a}
                                    onClick={() => setAlgorithm(a)}
                                    disabled={sorting}
                                    className={algorithm === a ? 'notion-action-btn notion-action-primary' : 'notion-action-btn'}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {a} Sort
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <button
                                onClick={startSort}
                                disabled={sorting}
                                className='notion-action-btn notion-action-primary'
                            >
                                <PlayIcon className='notion-action-icon' />
                                {sorting ? 'Sorting...' : 'Start Sort'}
                            </button>
                            <button
                                onClick={generateArray}
                                disabled={sorting}
                                className='notion-action-btn'
                            >
                                <ArrowPathIcon className='notion-action-icon' />
                                Reset Array
                            </button>
                        </div>

                        <div className='notion-card' style={{ padding: '24px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time Complexity</span>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#6366f1' }}>{complexInfo[algorithm].time}</div>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Space Complexity</span>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#6366f1' }}>{complexInfo[algorithm].space}</div>
                                </div>
                            </div>
                            <p style={{ color: 'rgba(55, 53, 47, 0.6)', fontSize: '14px' }}>{complexInfo[algorithm].desc}</p>
                        </div>

                        <div className='notion-card' style={{ padding: '32px', background: 'linear-gradient(135deg, #1a1b1e 0%, #2d2e32 100%)' }}>
                            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', height: '300px', gap: '2px' }}>
                                {array.map((value, index) => {
                                    const isComp = comparing?.includes(index);
                                    const isSwap = swapping?.includes(index);
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                width: `${100 / ARRAY_SIZE}%`,
                                                maxWidth: '16px',
                                                height: `${value * 2.5}px`,
                                                backgroundColor: isSwap ? '#22c55e' : isComp ? '#facc15' : '#818cf8',
                                                borderRadius: '2px 2px 0 0',
                                                transition: 'all 0.1s ease',
                                                boxShadow: isComp || isSwap ? '0 0 10px rgba(250, 204, 21, 0.5)' : 'none',
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#818cf8' }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Value</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#facc15' }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Comparing</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Swapping</span>
                            </div>
                        </div>
                    </div>

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
