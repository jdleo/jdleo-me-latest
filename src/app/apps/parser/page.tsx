'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { WebVitals } from '@/components/SEO/WebVitals';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Use local worker to avoid version mismatches
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface ParsedData {
    name?: string;
    email?: string;
    skills?: string[];
    experience?: any[];
    education?: any[];
    [key: string]: any;
}

export default function Parser() {
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        try {
            setLoading(true);
            setError(null);

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + ' ';
            }

            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: fullText }),
            });

            const data = await response.json();
            setParsedData(JSON.stringify(data, null, 4));
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsMobileMenuOpen(false);
            }
        } catch (err) {
            setError('CRITICAL_EXTRACTION_FAILURE: PDF_READ_ERROR');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
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
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Parser Engine</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Upload Document</h3>
                            <div
                                {...getRootProps()}
                                className={`
                                    p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group
                                    ${isDragActive
                                        ? 'border-[var(--purple-4)] bg-[var(--purple-1)]/50'
                                        : 'border-[var(--border-light)] hover:border-[var(--purple-4)] hover:bg-[var(--bg-2)]'}
                                `}
                            >
                                <input {...getInputProps()} />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDragActive ? 'bg-[var(--purple-4)] text-white' : 'bg-[var(--bg-2)] text-muted group-hover:text-[var(--purple-4)]'}`}>
                                    <span className='text-xl'>📄</span>
                                </div>
                                <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]'>
                                    {isDragActive ? 'Drop PDF Here' : 'Upload Resume'}
                                </span>
                                <span className='text-[10px] text-muted'>PDF files only</span>
                            </div>
                        </div>

                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Status</h3>
                            <div className='space-y-3 font-mono text-xs p-4 bg-[var(--bg-2)] rounded-xl border border-[var(--border-light)]'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-muted'>Target:</span>
                                    <span className='text-[var(--fg-4)] truncate max-w-[120px]'>{fileName || '—'}</span>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <span className='text-muted'>State:</span>
                                    <span className={`${loading ? 'text-[var(--purple-4)] animate-pulse' : 'text-[var(--fg-4)]'}`}>{loading ? 'PROCESSING...' : 'IDLE'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff] overflow-hidden'>
                    {/* Floating decorations */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-auto p-4 md:p-8 scrollbar-hide z-10 flex flex-col items-center'>
                        {loading && (
                            <div className='flex flex-col items-center justify-center h-full gap-6 animate-fade-in-up'>
                                <div className='w-16 h-16 border-4 border-[var(--purple-1)] border-t-[var(--purple-4)] rounded-full animate-spin' />
                                <span className='font-bold text-xs uppercase tracking-[0.2em] text-[var(--fg-4)]'>Extracting Entities...</span>
                            </div>
                        )}

                        {parsedData && !loading && (
                            <div className='w-full max-w-4xl h-full flex flex-col animate-fade-in-up'>
                                <div className='flex items-center justify-between mb-4'>
                                    <h2 className='text-lg font-bold text-[var(--fg-4)] flex items-center gap-2'>
                                        <span className='w-2 h-2 rounded-full bg-green-500' />
                                        Extraction Results
                                    </h2>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(parsedData)}
                                        className='text-xs font-bold uppercase tracking-wider text-[var(--purple-4)] hover:bg-[var(--purple-1)] px-3 py-1.5 rounded-lg transition-colors'
                                    >
                                        Copy JSON
                                    </button>
                                </div>
                                <div className='flex-grow bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden shadow-sm custom-scrollbar'>
                                    <SyntaxHighlighter
                                        language="json"
                                        style={oneLight}
                                        customStyle={{ margin: 0, padding: '1.5rem', height: '100%', fontSize: '0.75rem', lineHeight: '1.6' }}
                                        showLineNumbers={true}
                                        wrapLongLines={true}
                                    >
                                        {parsedData}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        )}

                        {!parsedData && !loading && (
                            <div className='flex flex-col items-center justify-center h-full opacity-100 text-center max-w-sm mx-auto'>
                                <div className='w-24 h-24 bg-[var(--purple-1)] rounded-3xl flex items-center justify-center mb-6 text-5xl -rotate-6 shadow-lg opacity-40'>
                                    📋
                                </div>
                                <h2 className='text-2xl font-bold text-[var(--fg-4)] mb-2'>No Data Parsed</h2>
                                <p className='text-sm text-muted leading-relaxed mb-6'>
                                    Upload a resume via the sidebar to see structural analysis and entity extraction.
                                </p>

                                {/* Mobile Upload Card (Visible only on mobile/empty state) */}
                                <div className='block md:hidden w-full'>
                                    <div
                                        {...getRootProps()}
                                        className={`
                                            p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-[var(--purple-4)] relative overflow-hidden
                                            ${isDragActive ? 'bg-[var(--purple-1)]/50' : 'active:scale-95'}
                                        `}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--purple-4)]" />
                                        <input {...getInputProps()} />
                                        <div className='w-14 h-14 bg-[var(--purple-1)] rounded-full flex items-center justify-center text-3xl mb-2 text-[var(--purple-4)]'>
                                            📄
                                        </div>
                                        <span className='text-sm font-bold uppercase tracking-widest text-[var(--purple-4)]'>
                                            Tap here to Upload Resume
                                        </span>
                                        <span className='text-[10px] text-muted font-bold uppercase tracking-widest bg-[var(--bg-2)] px-2 py-1 rounded-md'>
                                            PDF Only
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className='fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-full shadow-lg animate-shake flex items-center gap-2 z-50'>
                                <span className='w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-[10px]'>!</span>
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Parser Engine</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-4 space-y-6'>
                                <div
                                    {...getRootProps()}
                                    className={`
                                        p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3
                                        ${isDragActive
                                            ? 'border-[var(--purple-4)] bg-[var(--purple-1)]/50'
                                            : 'border-[var(--border-light)] hover:border-[var(--purple-4)] hover:bg-[var(--bg-2)]'}
                                    `}
                                >
                                    <input {...getInputProps()} />
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDragActive ? 'bg-[var(--purple-4)] text-white' : 'bg-[var(--bg-2)] text-muted'}`}>
                                        <span className='text-xl'>📄</span>
                                    </div>
                                    <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)]'>
                                        {isDragActive ? 'Drop PDF Here' : 'Tap to Upload'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
