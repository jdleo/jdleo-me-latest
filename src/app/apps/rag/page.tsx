'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import ReactMarkdown from 'react-markdown';
import {
    DocumentTextIcon,
    DocumentArrowUpIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const loadPdfJs = async () => {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    return pdfjs;
};

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
                            <h1>RAG Inspector</h1>
                            <p className='el-hero-sub'>
                                Chat with your documents using Retrieval Augmented Generation.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    {!fileName && (
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
                                <h2>{isDragActive ? 'Drop PDF Here' : 'Click or drop PDF to begin'}</h2>
                                <p>The document is chunked, embedded, and searchable — nothing is stored.</p>
                            </div>
                        </div>
                    )}

                    {fileName && (
                        <>
                            <div className='el-chart-block'>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        <DocumentTextIcon aria-hidden='true' />
                                        {fileName}
                                    </span>
                                    <button
                                        onClick={() => { setFileName(null); setPdfText(null); setIsEmbedded(false); }}
                                        className='el-btn el-btn-light el-btn-sm'
                                    >
                                        Reset
                                    </button>
                                </div>
                                <div className='el-file-card'>
                                    <div className='el-tax-input-grid'>
                                        <div>
                                            <label className='ecl-copy-label'>Chunk Size</label>
                                            <input
                                                type='number'
                                                value={chunkSize}
                                                onChange={e => setChunkSize(Number(e.target.value))}
                                                className='el-textarea el-el-input'
                                                disabled={isEmbedded || loading}
                                            />
                                        </div>
                                        <div>
                                            <label className='ecl-copy-label'>Chunks</label>
                                            <div className='el-rag-chunks'>{chunks.length} segments</div>
                                        </div>
                                        <div className='el-rag-embed-cell'>
                                            <button
                                                onClick={handleEmbed}
                                                disabled={isEmbedded || loading}
                                                className={`el-btn ${isEmbedded ? 'el-btn-light' : 'el-btn-dark'} el-generate-btn`}
                                            >
                                                {isEmbedded ? 'Document Ready' : loading ? status : 'Process Embeddings'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isEmbedded && (
                                <>
                                    <div className='el-chart-block'>
                                        <div className='el-chart-title'>
                                            <span className='el-chart-title-label'>
                                                <MagnifyingGlassIcon aria-hidden='true' />
                                                Query
                                            </span>
                                        </div>
                                        <div className='el-file-card'>
                                            <div className='el-copy-row'>
                                                <input
                                                    value={query}
                                                    onChange={e => setQuery(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAsk()}
                                                    disabled={loading}
                                                    placeholder='Ask a question about the document...'
                                                    className='el-textarea el-el-input'
                                                />
                                                <button
                                                    onClick={handleAsk}
                                                    disabled={!query.trim() || loading}
                                                    className='el-btn el-btn-dark el-btn-sm'
                                                >
                                                    <MagnifyingGlassIcon aria-hidden='true' />
                                                    {loading ? 'Searching...' : 'Ask'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {answer && (
                                        <div className='el-chart-block'>
                                            <div className='el-chart-title'>
                                                <span className='el-chart-title-label'>
                                                    <ChatBubbleLeftRightIcon aria-hidden='true' />
                                                    AI Answer
                                                </span>
                                            </div>
                                            <div className='el-file-card el-rag-answer'>
                                                <ReactMarkdown>{answer}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {topChunks.length > 0 && (
                                        <div className='el-chart-block'>
                                            <div className='el-chart-title'>
                                                <span className='el-chart-title-label'>Sources & Citations</span>
                                                <span className='el-chart-pill'>top {topChunks.length}</span>
                                            </div>
                                            <div className='el-privacy-grid'>
                                                {topChunks.map(chunk => (
                                                    <div key={chunk.id} className='el-info-card'>
                                                        <div className='el-info-card-head'>
                                                            <span className='el-kv-label'>Chunk #{chunk.id}</span>
                                                            <span className={`el-tag ${(chunk.score || 0) > 0.8 ? 'el-tag-green' : 'el-tag-purple'}`}>
                                                                {Math.round((chunk.score || 0) * 100)}% match
                                                            </span>
                                                        </div>
                                                        <p className='el-rag-chunk-text'>&quot;{chunk.text}&quot;</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
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
