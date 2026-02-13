'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    DocumentArrowUpIcon,
    ClipboardIcon,
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
        if (parsedData) navigator.clipboard.writeText(parsedData);
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1000px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Resume Parser</h1>
                        <div className='notion-subtitle'>Upload a PDF resume to extract structured data using AI</div>
                    </div>

                    <div className='notion-divider' />

                    {!parsedData && !loading && (
                        <div className='notion-section'>
                            <div className='notion-section-title'>
                                <DocumentArrowUpIcon className='notion-section-icon' />
                                Upload Document
                            </div>
                            <div
                                {...getRootProps()}
                                style={{
                                    marginTop: '16px',
                                    padding: '48px',
                                    border: `2px dashed ${isDragActive ? '#6366f1' : 'rgba(55, 53, 47, 0.16)'}`,
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isDragActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <input {...getInputProps()} />
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    margin: '0 auto 16px',
                                    borderRadius: '50%',
                                    backgroundColor: isDragActive ? '#6366f1' : 'rgba(55, 53, 47, 0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px',
                                    transition: 'all 0.2s ease'
                                }}>
                                    📄
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#37352f', marginBottom: '4px' }}>
                                    {isDragActive ? 'Drop PDF Here' : 'Click or drag to upload'}
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)' }}>PDF files only</div>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 24px',
                                border: '4px solid rgba(99, 102, 241, 0.2)',
                                borderTopColor: '#6366f1',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#37352f', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Extracting Entities...</div>
                            <div style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.5)', marginTop: '8px' }}>{fileName}</div>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            color: '#dc2626',
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '24px'
                        }}>
                            <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>!</span>
                            {error}
                        </div>
                    )}

                    {parsedData && !loading && (
                        <div className='notion-section'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
                                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#37352f' }}>Extraction Results</span>
                                </div>
                                <button onClick={copyToClipboard} className='notion-action-btn'>
                                    <ClipboardIcon className='notion-action-icon' />
                                    Copy JSON
                                </button>
                            </div>
                            <div className='notion-card' style={{ padding: 0, overflow: 'hidden' }}>
                                <SyntaxHighlighter
                                    language="json"
                                    style={oneLight}
                                    customStyle={{ margin: 0, padding: '20px', fontSize: '12px', lineHeight: 1.6, maxHeight: '600px', overflow: 'auto' }}
                                    showLineNumbers={true}
                                    wrapLongLines={true}
                                >
                                    {parsedData}
                                </SyntaxHighlighter>
                            </div>
                            <div style={{ marginTop: '16px' }}>
                                <button
                                    onClick={() => { setParsedData(null); setFileName(null); }}
                                    className='notion-action-btn'
                                >
                                    <DocumentArrowUpIcon className='notion-action-icon' />
                                    Upload Another
                                </button>
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
