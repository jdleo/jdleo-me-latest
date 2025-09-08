'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // dark theme
import 'prismjs/components/prism-json'; // json support

// Use local worker to avoid version mismatches
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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

export default function Parser() {
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
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

    useEffect(() => {
        if (parsedData) {
            Prism.highlightAll();
        }
    }, [parsedData]);

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            setLoading(true);
            setError(null);

            // get text from PDF
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + ' ';
            }

            // send text to API
            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: fullText }),
            });

            const data = await response.json();
            setParsedData(JSON.stringify(data, null, 2));
        } catch (err) {
            setError('Failed to parse PDF. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 1,
    });

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
                className={`flex-1 flex flex-col items-center pt-24 px-4 pb-12 transition-opacity duration-700 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className='mb-8 text-center'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                        <span className='gradient-text'>Resume Parser</span>
                    </h1>
                    <p className='text-[color:var(--foreground)] text-opacity-70 max-w-md'>
                        Upload a PDF resume to extract and parse its contents.
                    </p>
                </div>

                <div
                    {...getRootProps()}
                    className={`
                        w-full max-w-[600px] p-8 rounded-xl
                        glass-card cursor-pointer
                        border-2 border-dashed transition-all duration-300
                        ${
                            isDragActive
                                ? 'border-[color:var(--primary)] shadow-orbital-glow-sm'
                                : 'border-[color:var(--border)] hover:border-[color:var(--border)] hover:border-opacity-50 hover:shadow-orbital-glow-sm'
                        }
                    `}
                >
                    <input {...getInputProps()} />
                    <div className='text-center'>
                        <p className='text-[color:var(--foreground)] text-opacity-80'>
                            {isDragActive ? 'Drop your resume here...' : 'Drag & drop your resume, or click to select'}
                        </p>
                        <p className='text-[color:var(--foreground)] text-opacity-50 text-sm mt-2'>
                            Only PDF files are accepted
                        </p>
                    </div>
                </div>

                {error && (
                    <div className='mt-6 text-red-400 bg-red-400 bg-opacity-10 px-4 py-2 rounded-lg border border-red-400 border-opacity-20'>
                        {error}
                    </div>
                )}

                {loading && (
                    <div className='mt-6 glass-card px-6 py-3 rounded-lg animate-pulse-slow'>
                        <span className='text-[color:var(--foreground)] text-opacity-80'>Processing...</span>
                    </div>
                )}

                {parsedData && (
                    <div className='mt-6 w-full max-w-[600px] transition-all duration-300'>
                        <div className='glass-card p-4 rounded-xl overflow-hidden'>
                            <pre className='w-full overflow-x-auto whitespace-pre-wrap'>
                                <code className='language-json'>{parsedData}</code>
                            </pre>
                        </div>
                    </div>
                )}

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
