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
                            <h1>Resume Screener</h1>
                            <p className='el-hero-sub'>
                                Generate tailored interview questions from a candidate resume —
                                built for non-technical recruiters.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    {!fileName ? (
                        <div {...getRootProps()} className={`el-dropzone ${isDragActive ? 'is-active' : ''}`}>
                            <input {...getInputProps()} />
                            <DocumentMagnifyingGlassIcon className='el-dropzone-icon' aria-hidden='true' />
                            <h2>{isDragActive ? 'Drop the PDF here' : 'Click or drop resume PDF'}</h2>
                            <p>
                                Upload a resume and I&apos;ll turn it into focused interview questions
                                with signal to watch for.
                            </p>
                        </div>
                    ) : (
                        <div className='el-file-card'>
                            <div className='el-file-row'>
                                <span className='el-file-name'>
                                    <DocumentTextIcon aria-hidden='true' />
                                    {fileName}
                                </span>
                                <button
                                    onClick={() => { setFileName(null); setResumeText(null); setQuestions(null); }}
                                    className='el-btn el-btn-light el-btn-sm'
                                >
                                    Change
                                </button>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={e => setJobDescription(e.target.value)}
                                placeholder='Optional: paste the job description to tailor the questions...'
                                className='el-textarea'
                                rows={6}
                            />
                            <button onClick={handleGenerate} disabled={loading} className='el-btn el-btn-dark el-generate-btn'>
                                {loading ? 'Analyzing...' : 'Generate Questions'}
                            </button>
                            {error && <div className='el-error-text'>{error}</div>}
                        </div>
                    )}

                    {questions && (
                        <div className='el-chart-block'>
                            <div className='el-chart-title'>
                                <span className='el-chart-title-label'>
                                    <ClipboardDocumentListIcon aria-hidden='true' />
                                    Screening Questions
                                </span>
                                <span className='el-chart-pill'>{questions.length} questions</span>
                            </div>
                            <div className='el-question-list'>
                                {questions.map((q) => (
                                    <article
                                        key={q.id}
                                        className='el-question-card'
                                        onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                    >
                                        <div className='el-question-num'>{q.id}</div>
                                        <div className='el-question-body'>
                                            <span className='el-tag'>{q.topic}</span>
                                            <h3>{q.question}</h3>
                                            <p className='el-question-context'>{q.context}</p>

                                            {expandedQuestion === q.id && (
                                                <div className='el-flag-grid'>
                                                    <div>
                                                        <h4 className='el-flag-green'>
                                                            <CheckCircleIcon aria-hidden='true' />
                                                            Green Flags
                                                        </h4>
                                                        <ul>
                                                            {q.greenFlags.map((flag, i) => (
                                                                <li key={i}>{flag}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className='el-flag-red'>
                                                            <ExclamationTriangleIcon aria-hidden='true' />
                                                            Red Flags
                                                        </h4>
                                                        <p>{q.redFlags}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
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
