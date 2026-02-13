'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    DocumentMagnifyingGlassIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    return pdfjs;
};

interface Question {
    id: number;
    topic: string;
    question: string;
    context: string;
    greenFlags: string[];
    redFlags: string;
}

export default function ScreenApp() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [resumeText, setResumeText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const processFile = async (file: File) => {
        try {
            setLoading(true);
            const arrayBuffer = await file.arrayBuffer();
            const pdfjsLib = await loadPdfJs();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + ' ';
            }
            setFileName(file.name);
            setResumeText(fullText);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to read PDF');
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!resumeText) return;
        setLoading(true);
        setError(null);
        setQuestions(null);
        try {
            const response = await fetch('/api/screen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, jobDescription: jobDescription.trim() || undefined }),
            });
            if (!response.ok) throw new Error('Generation failed');
            const data = await response.json();
            if (!data.questions || data.questions.length === 0) throw new Error('No questions generated');
            setQuestions(data.questions);
        } catch (err) {
            setError('Generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => { if (files[0]) processFile(files[0]); },
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
    });

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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1000px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Resume Screener</h1>
                        <div className='notion-subtitle'>Generate tailored interview questions based on candidate resumes</div>
                    </div>

                    <div className='notion-divider' />

                    {!fileName ? (
                        <div className='notion-section'>
                            <div
                                {...getRootProps()}
                                style={{
                                    padding: '64px',
                                    border: `2px dashed ${isDragActive ? '#6366f1' : 'rgba(55, 53, 47, 0.16)'}`,
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isDragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <input {...getInputProps()} />
                                <div style={{ fontSize: '32px', marginBottom: '16px' }}>📋</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#37352f' }}>
                                    {isDragActive ? 'Drop PDF Here' : 'Click or drop Resume PDF'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='notion-section'>
                            <div className='notion-card' style={{ padding: '24px', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <DocumentTextIcon style={{ width: '18px', height: '18px', color: '#6366f1' }} />
                                        {fileName}
                                    </span>
                                    <button onClick={() => { setFileName(null); setResumeText(null); }} className='notion-action-btn'>Change</button>
                                </div>
                                <textarea
                                    value={jobDescription}
                                    onChange={e => setJobDescription(e.target.value)}
                                    placeholder='Optional: Paste Job Description to tailor questions...'
                                    className='notion-textarea'
                                    style={{ height: '100px', fontSize: '13px', marginBottom: '16px' }}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className='notion-action-btn notion-action-primary'
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {loading ? 'Analyzing...' : 'Generate Questions'}
                                </button>
                                {error && <div style={{ marginTop: '12px', color: '#dc2626', fontSize: '13px' }}>{error}</div>}
                            </div>
                        </div>
                    )}

                    {questions && (
                        <div className='notion-section'>
                            <div className='notion-section-title'>
                                <ClipboardDocumentListIcon className='notion-section-icon' />
                                Screening Questions
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                                {questions.map((q) => (
                                    <div
                                        key={q.id}
                                        className='notion-card'
                                        style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                        onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                    >
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(55, 53, 47, 0.06)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                {q.id}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                                        {q.topic}
                                                    </span>
                                                </div>
                                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#37352f', marginBottom: '4px' }}>{q.question}</h3>
                                                <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.6)' }}>Context: {q.context}</p>

                                                {expandedQuestion === q.id && (
                                                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(55, 53, 47, 0.09)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                                <CheckCircleIcon style={{ width: '14px', height: '14px', color: '#059669' }} />
                                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Green Flags</span>
                                                            </div>
                                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                {q.greenFlags.map((flag, i) => (
                                                                    <li key={i} style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.7)', marginBottom: '4px', paddingLeft: '12px', position: 'relative' }}>
                                                                        <span style={{ position: 'absolute', left: 0, top: '6px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#059669' }} />
                                                                        {flag}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                                <ExclamationTriangleIcon style={{ width: '14px', height: '14px', color: '#dc2626' }} />
                                                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Red Flags</span>
                                                            </div>
                                                            <p style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.7)', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '8px' }}>
                                                                {q.redFlags}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
