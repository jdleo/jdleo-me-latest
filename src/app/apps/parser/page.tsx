'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { WebVitals } from '@/components/SEO/WebVitals';

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
                            <div className='terminal-title'>johnleonardo — ~/resume-extraction-kernel</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Sidebar: Ingestion & Metadata */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Ingestion</span>
                                    </div>
                                    <nav className='flex flex-col gap-4 mb-10'>
                                        <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${isDragActive ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5' : 'border-[var(--color-border)] hover:border-white/20'}`}>
                                            <input {...getInputProps()} />
                                            <span className='text-[10px] font-mono uppercase tracking-widest opacity-60'>
                                                {isDragActive ? '[DROP_PDF_NOW]' : '[UPLOAD_RESUME]'}
                                            </span>
                                        </div>
                                        <Link href='/' className='text-sm hover:text-[var(--color-accent)] mt-4'>~/home</Link>
                                        <Link href='/apps' className='text-sm hover:text-[var(--color-accent)]'>~/apps</Link>
                                    </nav>

                                    <div className='space-y-6 font-mono'>
                                        <div>
                                            <span className='text-[var(--color-text)] opacity-40 text-[10px] uppercase tracking-widest block mb-4'>$ file info</span>
                                            <div className='space-y-2'>
                                                <div className='text-[10px] flex justify-between uppercase opacity-60'>
                                                    <span>Target:</span>
                                                    <span className='text-[var(--color-accent)]'>{fileName || 'NULL'}</span>
                                                </div>
                                                <div className='text-[10px] flex justify-between uppercase opacity-60'>
                                                    <span>Stream:</span>
                                                    <span>{loading ? 'PROCESSING' : 'IDLE'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {error && (
                                            <div className='p-3 border border-red-500/30 bg-red-500/5 rounded text-[10px] text-red-400 font-mono animate-shake'>
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='mt-auto pt-8 border-t border-[var(--color-border)] opacity-30 font-mono text-[9px] uppercase tracking-tighter'>
                                    "Probabilistic entity extraction via spectral PDF vectorization."
                                </div>
                            </div>

                            {/* Main Display: JSON Output */}
                            <div className='terminal-pane bg-black/40 flex flex-col p-8 overflow-y-auto w-full'>
                                {loading && (
                                    <div className='flex flex-col items-center justify-center h-full gap-4 opacity-40'>
                                        <div className='w-12 h-12 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin' />
                                        <span className='font-mono text-[10px] uppercase tracking-[0.5em]'>Parsing_Entities...</span>
                                    </div>
                                )}

                                {parsedData && !loading && (
                                    <div className='animate-reveal h-full flex flex-col'>
                                        <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)] font-mono'>
                                            <span className='terminal-prompt'>$</span>
                                            <span className='text-[10px] uppercase tracking-widest opacity-60'>Serialized_Output.json</span>
                                        </div>
                                        <div className='flex-grow bg-black/60 border border-[var(--color-border)] rounded-lg p-6 font-mono text-xs overflow-auto selection:bg-[var(--color-accent)] selection:text-black'>
                                            <pre className='text-[var(--color-text-dim)] leading-relaxed whitespace-pre-wrap'>
                                                {parsedData}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {!parsedData && !loading && (
                                    <div className='flex flex-col items-center justify-center h-full opacity-20'>
                                        <div className='text-4xl font-mono mb-4 text-[var(--color-accent)]'>[AWAITING_PAYLOAD]</div>
                                        <div className='text-xs font-mono uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed'>
                                            Drop a PDF localized bitstream to begin structural analysis
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
