'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
            <main className='el-page'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Primary navigation'>
                        <Link href='/apps' className='el-nav-link'>Apps</Link>
                        <Link href='/blog' className='el-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='el-nav-link'>Resume</Link>
                    </nav>
                    <div className='el-nav-actions'>
                        <Link href='/apps/chat' className='el-nav-link'>Chat</Link>
                        <Link href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </Link>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Sort Visualization</h1>
                            <p className='el-hero-sub'>
                                Interactive visualization of classic sorting algorithms.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='el-chart-block' style={{ marginTop: 0 }}>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>
                                <PlayIcon aria-hidden='true' />
                                Algorithm
                            </span>
                            <span className='el-chart-pill'>{complexInfo[algorithm].time} · {complexInfo[algorithm].space}</span>
                        </div>
                        <div className='el-file-card'>
                            <div className='el-sort-algos ecl-diagram-suggestions ecl-sort-algos'>
                                {(['bubble', 'quick', 'insertion', 'selection'] as Algorithm[]).map(a => (
                                    <button
                                        key={a}
                                        onClick={() => setAlgorithm(a)}
                                        disabled={sorting}
                                        className={`ecl-suggestion ${algorithm === a ? 'is-selected' : ''}`}
                                    >
                                        {a} sort
                                    </button>
                                ))}
                            </div>
                            <div className='el-serialize-row' style={{ marginBottom: 0 }}>
                                <button
                                    onClick={startSort}
                                    disabled={sorting}
                                    className='el-btn el-btn-dark el-btn-sm'
                                >
                                    <PlayIcon aria-hidden='true' />
                                    {sorting ? 'Sorting...' : 'Start Sort'}
                                </button>
                                <button
                                    onClick={generateArray}
                                    disabled={sorting}
                                    className='el-btn el-btn-light el-btn-sm'
                                >
                                    <ArrowPathIcon aria-hidden='true' />
                                    Reset Array
                                </button>
                                <p className='ecl-complex-desc'>{complexInfo[algorithm].desc}</p>
                            </div>
                        </div>
                    </div>

                    <div className='el-chart-block'>
                        <div className='el-chart-title'>
                            <span className='el-chart-title-label'>Visualization</span>
                            <span className='el-chart-pill'>{ARRAY_SIZE} elements</span>
                        </div>
                        <div className='el-chart-card'>
                            <div className='el-sort-canvas'>
                                {array.map((value, index) => {
                                    const isComp = comparing?.includes(index);
                                    const isSwap = swapping?.includes(index);
                                    return (
                                        <div
                                            key={index}
                                            className={`el-sort-bar ${isSwap ? 'is-swap' : isComp ? 'is-comp' : ''}`}
                                            style={{ height: `${value * 2.5}px` }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <div className='el-sort-legend'>
                            <span className='el-sort-legend-item'>
                                <i className='ecl-dot el-sort-dot-value' />
                                Value
                            </span>
                            <span className='el-sort-legend-item'>
                                <i className='ecl-dot el-sort-dot-comp' />
                                Comparing
                            </span>
                            <span className='el-sort-legend-item'>
                                <i className='ecl-dot el-sort-dot-swap' />
                                Swapping
                            </span>
                        </div>
                    </div>
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>GitHub</a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>LinkedIn</a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
