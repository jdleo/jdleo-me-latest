'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { WebVitals } from '@/components/SEO/WebVitals';
import { motion, AnimatePresence } from 'framer-motion';

// Use local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Question {
    id: number;
    topic: string;
    question: string;
    context: string;
    greenFlags: string[];
    redFlags: string;
}

export default function ScreenApp() {
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [resumeText, setResumeText] = useState<string | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const processFile = async (file: File) => {
        try {
            setLoading(true);
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + ' ';
            }
            setResumeText(fullText);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to read PDF. Is it valid?');
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!resumeText) return;

        setLoading(true);
        setError(null);
        setQuestions(null); // Clear previous results

        try {
            const response = await fetch('/api/screen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    jobDescription: jobDescription.trim() || undefined
                }),
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            if (!data.questions || data.questions.length === 0) {
                throw new Error('No questions generated. Try again.');
            }
            setQuestions(data.questions);
        } catch (err) {
            setError('Failed to generate questions. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => {
            const file = files[0];
            if (file) {
                setFileName(file.name);
                setError(null);
                processFile(file);
            }
        },
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

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
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Screening Assistant</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>1. Candidate Profile</h3>
                            <div
                                {...getRootProps()}
                                className={`
                                    p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group
                                    ${isDragActive
                                        ? 'border-[var(--purple-4)] bg-[var(--purple-1)]/50'
                                        : fileName
                                            ? 'border-green-500/50 bg-green-50/50'
                                            : 'border-[var(--border-light)] hover:border-[var(--purple-4)] hover:bg-[var(--bg-2)]'}
                                `}
                            >
                                <input {...getInputProps()} />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${fileName ? 'bg-green-100 text-green-600' : 'bg-[var(--bg-2)] text-muted group-hover:text-[var(--purple-4)]'}`}>
                                    <span className='text-xl'>{fileName ? '✓' : '📄'}</span>
                                </div>
                                <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)] truncate max-w-full px-2'>
                                    {fileName || 'Upload Resume'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>2. Role Context (Optional)</h3>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste Job Description..."
                                className='w-full h-32 p-4 text-xs font-medium bg-white border border-[var(--border-light)] rounded-xl resize-none focus:outline-none focus:border-[var(--purple-4)] focus:ring-1 focus:ring-[var(--purple-4)] transition-all placeholder:text-muted/50'
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!resumeText || loading}
                            className={`
                                w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all transform active:scale-[0.98]
                                ${!resumeText
                                    ? 'bg-[var(--bg-2)] text-muted cursor-not-allowed border border-[var(--border-light)]'
                                    : loading
                                        ? 'bg-indigo-600 text-white cursor-wait opacity-90'
                                        : 'bg-[var(--purple-4)] hover:bg-[#5b2ee0] text-white shadow-indigo-200'}
                            `}
                        >
                            {loading ? 'Analyzing...' : 'Generate Questions'}
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    {/* Loading State in Main Area */}
                    {loading && (
                        <div className='absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fafbff]/90 backdrop-blur-sm animate-fade-in-up'>
                            <div className='w-16 h-16 border-4 border-[var(--purple-1)] border-t-[var(--purple-4)] rounded-full animate-spin mb-6' />
                            <h3 className='text-lg font-bold text-[var(--fg-4)] mb-2'>Analyzing Profile</h3>
                            <p className='text-sm text-muted'>Generating tailored screening questions...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className='absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up'>
                            <div className='w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6 text-3xl shadow-sm text-red-500'>
                                ⚠️
                            </div>
                            <h3 className='text-xl font-bold text-[var(--fg-4)] mb-2'>Analysis Failed</h3>
                            <p className='text-sm text-muted max-w-sm mb-6'>{error}</p>
                            <button
                                onClick={handleGenerate}
                                className='px-6 py-2 bg-[var(--purple-4)] text-white rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-[#5b2ee0] transition-colors'
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!questions && !loading && !error && (
                        <div className='flex flex-col items-center justify-center h-full opacity-100 text-center max-w-sm mx-auto px-6'>
                            <div className='w-24 h-24 bg-[var(--purple-1)] rounded-3xl flex items-center justify-center mb-6 text-5xl -rotate-6 shadow-lg opacity-40'>
                                🕵️
                            </div>
                            <h2 className='text-2xl font-bold text-[var(--fg-4)] mb-2'>Ready to Screen</h2>
                            <p className='text-sm text-muted leading-relaxed mb-6'>
                                Upload a resume to generate tailored screening questions.
                            </p>

                            {/* Mobile Upload Section */}
                            <div className='block md:hidden w-full space-y-4'>
                                <div
                                    {...getRootProps()}
                                    className={`
                                        p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 bg-white shadow-sm border-[var(--purple-4)] relative overflow-hidden
                                        ${isDragActive ? 'bg-[var(--purple-1)]/50' : 'active:scale-95'}
                                    `}
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--purple-4)]" />
                                    <input {...getInputProps()} />
                                    <div className='w-14 h-14 bg-[var(--purple-1)] rounded-full flex items-center justify-center text-3xl mb-2 text-[var(--purple-4)]'>
                                        📄
                                    </div>
                                    <span className='text-sm font-bold uppercase tracking-widest text-[var(--purple-4)]'>
                                        {fileName ? 'Resume Uploaded' : 'Tap to Upload'}
                                    </span>
                                </div>

                                {/* Mobile JD Input */}
                                <div className='animate-fade-in-up'>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Optional: Paste Job Description..."
                                        className='w-full h-24 p-3 text-xs bg-white border border-[var(--border-light)] rounded-xl resize-none focus:outline-none focus:border-[var(--purple-4)]'
                                    />
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={!resumeText || loading}
                                    className={`
                                        w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all
                                        ${!resumeText || loading
                                            ? 'bg-[var(--bg-2)] text-muted'
                                            : 'bg-indigo-600 text-white'}
                                    `}
                                >
                                    {loading ? 'Analyzing...' : 'Generate Questions'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results List */}
                    {questions && (
                        <div className='flex-grow overflow-auto p-4 md:p-8 scrollbar-hide z-10 flex flex-col items-center w-full'>
                            <div className='w-full max-w-3xl space-y-6 pb-20'>
                                <div className='flex items-center justify-between mb-2'>
                                    <h2 className='text-lg font-bold text-[var(--fg-4)] flex items-center gap-2'>
                                        <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                                        Screening Analysis
                                    </h2>
                                    <span className='text-[10px] font-bold uppercase tracking-wider text-muted bg-[var(--bg-2)] border border-[var(--border-light)] px-2 py-1 rounded-lg'>{questions.length} Questions</span>
                                </div>

                                {questions.map((q, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={q.id}
                                        className='bg-white rounded-2xl border border-[var(--border-light)] shadow-sm overflow-hidden hover:border-[var(--purple-2)] transition-colors'
                                    >
                                        <div
                                            onClick={() => toggleExpand(q.id)}
                                            className='p-6 cursor-pointer flex gap-5'
                                        >
                                            <div className='flex-shrink-0 w-8 h-8 rounded-full bg-[var(--bg-2)] text-[var(--fg-4)] font-bold flex items-center justify-center text-sm border border-[var(--border-light)] mt-1'>
                                                {idx + 1}
                                            </div>
                                            <div className='flex-grow'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--purple-4)] bg-[var(--purple-1)] px-2 py-0.5 rounded-full'>
                                                        {q.topic}
                                                    </span>
                                                </div>
                                                <h3 className='text-base font-semibold text-[var(--fg-4)] leading-relaxed mb-1'>
                                                    {q.question}
                                                </h3>
                                                <div className='flex items-center gap-2 text-xs text-muted'>
                                                    <span>Why ask: {q.context}</span>
                                                </div>
                                            </div>
                                            <div className={`transform transition-transform text-muted duration-300 ${expandedIds.includes(q.id) ? 'rotate-180' : ''}`}>
                                                ▼
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedIds.includes(q.id) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className='bg-[var(--bg-2)]/50 border-t border-[var(--border-light)]'
                                                >
                                                    <div className='p-6 pl-[4.5rem] grid grid-cols-1 md:grid-cols-2 gap-8'>
                                                        <div>
                                                            <h4 className='text-[10px] font-bold uppercase tracking-widest text-green-600 mb-3 flex items-center gap-2'>
                                                                <span className='text-sm'>✅</span> Positive Signals
                                                            </h4>
                                                            <ul className='space-y-2'>
                                                                {q.greenFlags.map((flag, i) => (
                                                                    <li key={i} className='text-sm text-[var(--fg-4)] flex items-start gap-2 leading-relaxed'>
                                                                        <span className='text-green-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0' />
                                                                        {flag}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className='text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2'>
                                                                <span className='text-sm'>🚩</span> Warning Signs
                                                            </h4>
                                                            <p className='text-sm text-[var(--fg-4)] bg-red-50/50 p-3 rounded-xl border border-red-100/50 leading-relaxed'>
                                                                {q.redFlags}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                            <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                                <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                    <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Menu</span>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                                </div>
                                <div className='p-4 space-y-4'>
                                    <div>
                                        <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-2'>Role Context</h3>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste Job Description..."
                                            className='w-full h-24 p-3 text-xs bg-white border border-[var(--border-light)] rounded-xl resize-none focus:outline-none focus:border-[var(--purple-4)]'
                                        />
                                    </div>
                                    <button
                                        onClick={() => { handleGenerate(); setIsMobileMenuOpen(false); }}
                                        disabled={!resumeText || loading}
                                        className='w-full py-3 bg-[var(--purple-4)] text-white rounded-xl font-bold uppercase tracking-widest text-xs'
                                    >
                                        {loading ? 'Analyzing...' : 'Generate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
