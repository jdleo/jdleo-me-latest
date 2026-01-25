'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import ReactMarkdown from 'react-markdown';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    DocumentPlusIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Chunk {
    id: number;
    text: string;
    embedding?: number[];
    score?: number;
}

function cosineSimilarity(a: number[], b: number[]) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

export default function RagInspectorApp() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [pdfText, setPdfText] = useState<string | null>(null);
    const [chunks, setChunks] = useState<Chunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');
    const [isEmbedded, setIsEmbedded] = useState(false);
    const [chunkSize, setChunkSize] = useState<number>(250);
    const [overlapPercent, setOverlapPercent] = useState<number>(10);
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [topChunks, setTopChunks] = useState<Chunk[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const processFile = async (file: File) => {
        try {
            setLoading(true);
            setStatus('Reading PDF...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + ' ';
            }
            setFileName(file.name);
            setPdfText(fullText);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setStatus('Error reading PDF');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!pdfText) return;
        const words = pdfText.split(/\s+/);
        const newChunks: Chunk[] = [];
        const safeOverlap = Math.min(overlapPercent, 50);
        const overlapSize = Math.floor(chunkSize * (safeOverlap / 100));
        const stride = chunkSize - overlapSize;

        for (let i = 0; i < words.length; i += stride) {
            const end = Math.min(i + chunkSize, words.length);
            const chunkText = words.slice(i, end).join(' ');
            newChunks.push({ id: i, text: chunkText });
            if (end === words.length) break;
        }

        setChunks(newChunks);
        setIsEmbedded(false);
        setAnswer(null);
        setTopChunks([]);
    }, [pdfText, chunkSize, overlapPercent]);

    const handleEmbed = async () => {
        if (chunks.length === 0) return;
        setLoading(true);
        setStatus('Generating Embeddings...');

        try {
            const batchSize = 20;
            const updatedChunks = [...chunks];
            for (let i = 0; i < updatedChunks.length; i += batchSize) {
                const batch = updatedChunks.slice(i, i + batchSize);
                const texts = batch.map(c => c.text);
                const response = await fetch('/api/rag/embeddings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ input: texts }),
                });
                if (!response.ok) throw new Error('Embedding failed');
                const data = await response.json();
                data.data.forEach((item: any, idx: number) => {
                    updatedChunks[i + idx].embedding = item.embedding;
                });
            }
            setChunks(updatedChunks);
            setIsEmbedded(true);
        } catch (err) {
            console.error(err);
            setStatus('Embedding Failed');
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    const handleAsk = async () => {
        if (!query.trim() || !isEmbedded) return;
        setLoading(true);
        setStatus('Thinking...');
        setAnswer(null);

        try {
            const embResponse = await fetch('/api/rag/embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: query }),
            });
            const embData = await embResponse.json();
            const queryVector = embData.data[0].embedding;

            const scoredChunks = chunks
                .filter(c => c.embedding)
                .map(c => ({ ...c, score: cosineSimilarity(queryVector, c.embedding!) }))
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, 4);

            setTopChunks(scoredChunks);

            const context = scoredChunks.map(c => c.text).join('\n\n---\n\n');
            const chatResponse = await fetch('/api/rag/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: `You are a helpful assistant. Answer based on context:\n${context}` },
                        { role: 'user', content: query }
                    ]
                }),
            });
            const chatData = await chatResponse.json();
            setAnswer(chatData.choices[0].message.content);
        } catch (e) {
            console.error(e);
            setStatus('Error answering');
        } finally {
            setLoading(false);
            setStatus('');
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
                        <h1 className='notion-title'>RAG Inspector</h1>
                        <div className='notion-subtitle'>Chat with your documents using Retrieval Augmented Generation</div>
                    </div>

                    <div className='notion-divider' />

                    {!fileName && (
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
                                <div style={{ fontSize: '32px', marginBottom: '16px' }}>📄</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#37352f' }}>
                                    {isDragActive ? 'Drop PDF Here' : 'Click or drop PDF to begin'}
                                </div>
                            </div>
                        </div>
                    )}

                    {fileName && (
                        <>
                            <div className='notion-card' style={{ padding: '24px', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <DocumentTextIcon style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                                        <span style={{ fontWeight: 600 }}>{fileName}</span>
                                    </div>
                                    <button onClick={() => { setFileName(null); setPdfText(null); setIsEmbedded(false); }} className='notion-action-btn'>
                                        Reset
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1px solid rgba(55, 53, 47, 0.09)', paddingTop: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Chunk Size</label>
                                        <input
                                            type='number'
                                            value={chunkSize}
                                            onChange={e => setChunkSize(Number(e.target.value))}
                                            className='notion-input'
                                            style={{ marginTop: '4px', width: '100%' }}
                                            disabled={isEmbedded || loading}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Chunks</label>
                                        <div style={{ marginTop: '8px', fontWeight: 600 }}>{chunks.length} segments</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'end' }}>
                                        <button
                                            onClick={handleEmbed}
                                            disabled={isEmbedded || loading}
                                            className='notion-action-btn notion-action-primary'
                                            style={{ width: '100%', justifyContent: 'center' }}
                                        >
                                            {isEmbedded ? 'Document Ready' : loading ? status : 'Process Embeddings'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isEmbedded && (
                                <div className='notion-section'>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                        <input
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleAsk()}
                                            disabled={loading}
                                            placeholder='Ask a question about the document...'
                                            className='notion-input'
                                            style={{ flex: 1 }}
                                        />
                                        <button onClick={handleAsk} disabled={!query.trim() || loading} className='notion-action-btn notion-action-primary'>
                                            <MagnifyingGlassIcon className='notion-action-icon' />
                                            {loading ? 'Searching...' : 'Ask'}
                                        </button>
                                    </div>

                                    {answer && (
                                        <div className='notion-card' style={{ padding: '24px', marginBottom: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                <ChatBubbleLeftRightIcon style={{ width: '16px', height: '16px', color: '#6366f1' }} />
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>AI Answer</span>
                                            </div>
                                            <div className='prose prose-sm' style={{ color: '#37352f' }}>
                                                <ReactMarkdown>{answer}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {topChunks.length > 0 && (
                                        <div className='notion-section'>
                                            <div className='notion-section-title'>
                                                <DocumentPlusIcon className='notion-section-icon' />
                                                Sources & Citations
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
                                                {topChunks.map(chunk => (
                                                    <div key={chunk.id} className='notion-card' style={{ padding: '16px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Chunk #{chunk.id}</span>
                                                            <span style={{ fontSize: '10px', fontWeight: 700, color: (chunk.score || 0) > 0.8 ? '#059669' : '#d97706' }}>
                                                                {Math.round((chunk.score || 0) * 100)}% Match
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '12px', color: 'rgba(55, 53, 47, 0.7)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            "{chunk.text}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
