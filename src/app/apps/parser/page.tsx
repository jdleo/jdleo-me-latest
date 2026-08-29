'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    DocumentArrowUpIcon,
    ClipboardIcon,
    CheckIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    return pdfjs;
};

export default function Parser() {
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

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
            const pdfjsLib = await loadPdfJs();
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
            setError('Failed to parse PDF');
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

    const copyToClipboard = () => {
        if (parsedData) {
            navigator.clipboard.writeText(parsedData);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
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
                            <h1>Resume Parser</h1>
                            <p className='el-hero-sub'>
                                Upload a PDF resume to extract structured data using AI.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    {!parsedData && !loading && (
                        <div className='el-chart-block'>
                            <div className='el-chart-title'>
                                <span className='el-chart-title-label'>
                                    <DocumentArrowUpIcon aria-hidden='true' />
                                    Upload Document
                                </span>
                                <span className='el-chart-pill'>PDF only</span>
                            </div>
                            <div {...getRootProps()} className={`el-dropzone ${isDragActive ? 'is-active' : ''}`}>
                                <input {...getInputProps()} />
                                <DocumentArrowUpIcon className='el-dropzone-icon' aria-hidden='true' />
                                <h2>{isDragActive ? 'Drop PDF Here' : 'Click or drag to upload'}</h2>
                                <p>PDF files only</p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className='el-chart-block'>
                            <div className='el-chart-title'>
                                <span className='el-chart-title-label'>Extracting Entities...</span>
                                <span className='el-chart-pill'>{fileName}</span>
                            </div>
                            <div className='el-file-card el-parser-loading'>
                                <div className='ecl-loading-ring' aria-hidden='true' />
                                <p>Reading the PDF, calling the model, and structuring the output.</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className='el-file-card el-diagram-error'>
                            {error}
                        </div>
                    )}

                    {parsedData && !loading && (
                        <div className='el-chart-block'>
                            <div className='el-chart-title'>
                                <span className='el-chart-title-label'>
                                    <DocumentTextIcon aria-hidden='true' />
                                    Extraction Results
                                </span>
                                <div className='el-parser-actions'>
                                    <button onClick={copyToClipboard} className='el-btn el-btn-light el-btn-sm'>
                                        <ClipboardIcon aria-hidden='true' />
                                        {copied ? 'Copied' : 'Copy JSON'}
                                    </button>
                                    <button
                                        onClick={() => { setParsedData(null); setFileName(null); }}
                                        className='el-btn el-btn-dark el-btn-sm'
                                    >
                                        <DocumentArrowUpIcon aria-hidden='true' />
                                        Upload Another
                                    </button>
                                </div>
                            </div>
                            <div className='el-file-card el-parser-output'>
                                <SyntaxHighlighter
                                    language="json"
                                    style={oneLight}
                                    customStyle={{ margin: 0, padding: '20px', fontSize: '12px', lineHeight: 1.6, maxHeight: '600px', overflow: 'auto', backgroundColor: 'transparent' }}
                                    showLineNumbers={true}
                                    wrapLongLines={true}
                                >
                                    {parsedData}
                                </SyntaxHighlighter>
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
