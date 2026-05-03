'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import {
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
            <main className={`jd-home jd-apps-home ${isLoaded ? 'is-loaded' : ''}`}>
                <header className='jd-nav-wrap'>
                    <Link href='/' className='jd-logo'>{strings.NAME}</Link>
                    <nav className='jd-nav' aria-label='Primary navigation'>
                        <Link href='/apps' className='jd-nav-link'>Apps</Link>
                        <Link href='/blog' className='jd-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='jd-nav-link'>Resume</Link>
                    </nav>
                    <div className='jd-nav-actions'>
                        <Link href='/apps/chat' className='jd-login'>Chat</Link>
                        <Link href='/' className='jd-top-cta'>Home</Link>
                    </div>
                </header>

                <div className='jd-blog-shell jd-tool-shell'>
                    <section className='jd-blog-hero jd-tool-hero'>
                        <h1>Resume Screener</h1>
                        <p>Generate tailored interview questions from a candidate resume.</p>
                    </section>

                    {!fileName ? (
                        <section
                            {...getRootProps()}
                            className={`jd-dropzone ${isDragActive ? 'is-active' : ''}`}
                        >
                            <input {...getInputProps()} />
                            <div className='jd-dropzone-icon'>
                                <DocumentMagnifyingGlassIcon />
                            </div>
                            <h2>{isDragActive ? 'Drop the PDF here' : 'Click or drop resume PDF'}</h2>
                            <p>Upload a resume and I'll turn it into focused interview questions with signal to watch for.</p>
                        </section>
                    ) : (
                        <section className='jd-form-card'>
                            <div className='jd-file-row'>
                                <span>
                                    <DocumentTextIcon />
                                    {fileName}
                                </span>
                                <button onClick={() => { setFileName(null); setResumeText(null); setQuestions(null); }} className='jd-secondary-btn'>
                                    Change
                                </button>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                placeholder='Optional: paste the job description to tailor the questions...'
                                className='jd-textarea'
                            />
                            <button onClick={handleGenerate} disabled={loading} className='jd-action-btn'>
                                {loading ? 'Analyzing...' : 'Generate Questions'}
                            </button>
                            {error && <div className='jd-error-text'>{error}</div>}
                        </section>
                    )}

                    {questions && (
                        <section className='jd-question-section'>
                            <div className='jd-section-title'>
                                <span><ClipboardDocumentListIcon /> Screening Questions</span>
                            </div>
                            <div className='jd-question-list'>
                                {questions.map((q) => (
                                    <article
                                        key={q.id}
                                        className='jd-question-card'
                                        onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                    >
                                        <div className='jd-question-number'>{q.id}</div>
                                        <div>
                                            <span className='jd-tag'>{q.topic}</span>
                                            <h3>{q.question}</h3>
                                            <p>Context: {q.context}</p>

                                            {expandedQuestion === q.id && (
                                                <div className='jd-flag-grid'>
                                                    <div>
                                                        <h4 className='jd-green'><CheckCircleIcon /> Green Flags</h4>
                                                        <ul>
                                                            {q.greenFlags.map((flag, i) => (
                                                                <li key={i}>{flag}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className='jd-red'><ExclamationTriangleIcon /> Red Flags</h4>
                                                        <p>{q.redFlags}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <footer className='jd-footer'>
                    <span>&copy; 2026 {strings.NAME}</span>
                    <Link href='/apps'>Back to apps</Link>
                </footer>
            </main>
        </>
    );
}
