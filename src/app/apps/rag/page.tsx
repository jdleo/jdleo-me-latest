'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { WebVitals } from '@/components/SEO/WebVitals';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// Use local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Chunk {
    id: number;
    text: string;
    embedding?: number[];
    score?: number;
}

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

export default function RagInspectorApp() {
    // Document State
    const [fileName, setFileName] = useState<string | null>(null);
    const [pdfText, setPdfText] = useState<string | null>(null);
    const [chunks, setChunks] = useState<Chunk[]>([]);

    // Processing State
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState<string>(''); // 'Reading PDF' | 'Embedding' | 'Searching'
    const [isEmbedded, setIsEmbedded] = useState(false);
    const [showEmbedSuccess, setShowEmbedSuccess] = useState(false);

    // Settings
    const [chunkSize, setChunkSize] = useState<number | string>(250);
    const [overlapPercent, setOverlapPercent] = useState<number | string>(10);

    // Search & Results State
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [topChunks, setTopChunks] = useState<Chunk[]>([]);

    // UI State
    const [selectedChunk, setSelectedChunk] = useState<Chunk | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- Logic ---

    // Process PDF
    const processFile = async (file: File) => {
        try {
            setLoading(true);
            setLoadingStep('Reading PDF...');
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
            alert('Failed to read PDF');
            setLoading(false);
        }
    };

    // Re-chunk (Client Side)
    useEffect(() => {
        if (!pdfText) return;

        const words = pdfText.split(/\s+/);
        const newChunks: Chunk[] = [];
        const safeChunkSize = Number(chunkSize) || 250;
        const safeOverlap = Math.min(Number(overlapPercent) || 10, 50);

        const overlapSize = Math.floor(safeChunkSize * (safeOverlap / 100));
        const stride = safeChunkSize - overlapSize;

        for (let i = 0; i < words.length; i += stride) {
            const end = Math.min(i + safeChunkSize, words.length);
            const chunkText = words.slice(i, end).join(' ');
            newChunks.push({ id: i, text: chunkText });
            if (end === words.length) break;
        }

        setChunks(newChunks);
        setIsEmbedded(false); // Invalidate old embeddings
        setAnswer(null);
        setTopChunks([]);
    }, [pdfText, chunkSize, overlapPercent]);

    // Generate Embeddings
    const handleEmbed = async () => {
        if (chunks.length === 0) return;
        setLoading(true);
        setLoadingStep('Generating Embeddings...');

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
            setShowEmbedSuccess(true);
            setTimeout(() => setShowEmbedSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Failed to generate embeddings');
        } finally {
            setLoading(false);
            setLoadingStep('');
        }
    };

    // Ask Question (Single Turn)
    const handleAsk = async () => {
        if (!query.trim() || !isEmbedded) return;

        setLoading(true);
        setLoadingStep('Searching & Analyzing...');
        setAnswer(null);
        setTopChunks([]);

        try {
            // 1. Embed Query
            const embResponse = await fetch('/api/rag/embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: query }),
            });
            const embData = await embResponse.json();
            const queryVector = embData.data[0].embedding;

            // 2. Rank Chunks
            const scoredChunks = chunks
                .filter(c => c.embedding)
                .map(c => ({
                    ...c,
                    score: cosineSimilarity(queryVector, c.embedding!)
                }))
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, 5); // Take Top 5 as requested

            setTopChunks(scoredChunks);

            // 3. Generate Answer
            const context = scoredChunks.map(c => c.text).join('\n\n---\n\n');
            const chatResponse = await fetch('/api/rag/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: `You are a helpful and precise document assistant. Answer the user's question based ONLY on the following context. If the answer is not in the context, say "I couldn't find that in the document."\n\nContext:\n${context}` },
                        { role: 'user', content: query }
                    ]
                }),
            });

            const chatData = await chatResponse.json();
            setAnswer(chatData.choices[0].message.content);

        } catch (err) {
            console.error(err);
            setAnswer('Error generating response. Please try again.');
        } finally {
            setLoading(false);
            setLoadingStep('');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => {
            const file = files[0];
            if (file) processFile(file);
        },
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
                    <button onClick={() => setIsMobileMenuOpen(true)} className='px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full text-xs font-bold uppercase text-[var(--fg-4)]'>Menu</button>
                </header>

                {/* Sidebar */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>PDF Chat (Embeddings)</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar'>
                        {/* File Upload */}
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>1. Document</h3>
                            <div
                                {...getRootProps()}
                                className={`
                                    p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group
                                    ${isDragActive
                                        ? 'border-[var(--purple-4)] bg-[var(--purple-1)]/50'
                                        : fileName
                                            ? 'border-green-500/50 bg-green-50/50'
                                            : 'border-[var(--border-light)] hover:border-[var(--purple-4)] hover:bg-[var(--bg-2)]'}
                                `}
                            >
                                <input {...getInputProps()} />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${fileName ? 'bg-green-100 text-green-600' : 'bg-[var(--bg-2)] text-muted group-hover:text-[var(--purple-4)]'}`}>
                                    <span className='text-xl'>{fileName ? '✓' : '📄'}</span>
                                </div>
                                <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--fg-4)] truncate max-w-full px-2'>
                                    {fileName || 'Upload PDF'}
                                </span>
                            </div>
                        </div>

                        {/* Settings */}
                        {pdfText && (
                            <div className='animate-fade-in-up'>
                                <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>2. Calibration</h3>
                                <div className='space-y-4'>
                                    <div>
                                        <label className='text-xs font-medium text-[var(--fg-4)] mb-1 block'>Chunk Size (tokens)</label>
                                        <input
                                            type="number"
                                            value={chunkSize}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setChunkSize(val === '' ? '' : Number(val));
                                            }}
                                            className='w-full p-2 text-xs border border-[var(--border-light)] rounded-lg focus:border-[var(--purple-4)] outline-none'
                                        />
                                    </div>
                                    <div>
                                        <label className='text-xs font-medium text-[var(--fg-4)] mb-1 block'>Overlap (%)</label>
                                        <input
                                            type="number"
                                            value={overlapPercent}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') {
                                                    setOverlapPercent('');
                                                } else {
                                                    const num = Number(val);
                                                    if (num <= 50) setOverlapPercent(num);
                                                }
                                            }}
                                            className='w-full p-2 text-xs border border-[var(--border-light)] rounded-lg focus:border-[var(--purple-4)] outline-none'
                                        />
                                    </div>

                                    <div className='p-3 bg-[var(--bg-2)] rounded-lg flex justify-between items-center text-xs'>
                                        <span className='text-muted'>Total Chunks</span>
                                        <span className='font-bold text-[var(--fg-4)]'>{chunks.length}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleEmbed}
                                    disabled={loading || isEmbedded}
                                    className={`
                                        w-full mt-4 py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all transform active:scale-[0.99]
                                        ${isEmbedded
                                            ? 'bg-emerald-500 text-white shadow-emerald-200 cursor-default'
                                            : loading
                                                ? 'bg-indigo-600 text-white cursor-wait opacity-90'
                                                : 'bg-[var(--purple-4)] hover:bg-[#5b2ee0] text-white shadow-indigo-200'}
                                    `}
                                >
                                    {isEmbedded ? 'Document Ready' : loading ? 'Processing...' : 'Embed Document'}
                                </button>

                                {showEmbedSuccess && (
                                    <div className='mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-[10px] font-bold text-center animate-fade-in-up'>
                                        ✨ Successfully Embedded!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className='flex-grow flex flex-col h-full bg-[#fafbff] relative overflow-y-auto'>
                    {loading && (
                        <div className='absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center animate-fade-in'>
                            <div className='w-16 h-16 border-4 border-[var(--purple-1)] border-t-[var(--purple-4)] rounded-full animate-spin mb-4' />
                            <p className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>{loadingStep}</p>
                        </div>
                    )}

                    <div className='max-w-4xl mx-auto w-full p-6 md:p-12 space-y-8 min-h-full'>

                        {/* 1. Header & Input */}
                        <div className='space-y-6 text-center'>
                            <div className='space-y-2'>
                                <h1 className='text-3xl font-bold text-[var(--fg-4)]'>PDF Chat (Embeddings)</h1>
                                <p className='text-muted'>Ask questions and trace the answers back to the source.</p>
                            </div>

                            <div className='relative max-w-2xl mx-auto space-y-4'>
                                {/* Mobile/Inline Upload & Embed Controls */}
                                <div className='md:hidden space-y-3'>
                                    {!fileName && (
                                        <div
                                            {...getRootProps()}
                                            className={`
                                                p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 bg-white
                                                ${isDragActive ? 'border-[var(--purple-4)] bg-[var(--purple-1)]/20' : 'border-[var(--border-light)]'}
                                            `}
                                        >
                                            <input {...getInputProps()} />
                                            <div className='w-10 h-10 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-xl'>📄</div>
                                            <div>
                                                <p className='text-sm font-bold text-[var(--fg-4)]'>Tap to Upload PDF</p>
                                                <p className='text-[10px] text-muted'>Required to start</p>
                                            </div>
                                        </div>
                                    )}

                                    {fileName && !isEmbedded && (
                                        <div className='animate-fade-in-up bg-white p-4 rounded-xl border border-[var(--border-light)] shadow-sm'>
                                            <div className='flex items-center justify-between mb-3'>
                                                <div className='flex items-center gap-2 overflow-hidden'>
                                                    <span className='text-lg'>📄</span>
                                                    <span className='text-xs font-bold truncate text-[var(--fg-4)]'>{fileName}</span>
                                                </div>
                                                <button
                                                    onClick={() => setFileName(null)}
                                                    className='text-[10px] text-red-500 font-bold uppercase tracking-wider'
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className='grid grid-cols-2 gap-2 mb-3'>
                                                <div>
                                                    <label className='text-[10px] font-bold text-muted uppercase tracking-wider mb-1 block'>Resize Chunks</label>
                                                    <input
                                                        type="number"
                                                        value={chunkSize}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setChunkSize(val === '' ? '' : Number(val));
                                                        }}
                                                        className='w-full p-2 text-xs border border-[var(--border-light)] rounded-lg'
                                                    />
                                                </div>
                                                <div>
                                                    <label className='text-[10px] font-bold text-muted uppercase tracking-wider mb-1 block'>Overlap %</label>
                                                    <input
                                                        type="number"
                                                        value={overlapPercent}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === '') {
                                                                setOverlapPercent('');
                                                            } else {
                                                                const num = Number(val);
                                                                if (num <= 50) setOverlapPercent(num);
                                                            }
                                                        }}
                                                        className='w-full p-2 text-xs border border-[var(--border-light)] rounded-lg'
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleEmbed}
                                                disabled={loading}
                                                className='w-full py-3 bg-[var(--purple-4)] text-white rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2'
                                            >
                                                {loading ? 'Processing...' : 'Embed & Start Inspector'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className='relative'>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                                        disabled={!isEmbedded || loading}
                                        placeholder={!fileName ? "Upload a document first..." : isEmbedded ? "Ask a specific question..." : "Embed document to start..."}
                                        className='w-full p-5 pr-14 bg-white border border-[var(--border-light)] rounded-2xl shadow-sm text-lg focus:outline-none focus:border-[var(--purple-4)] focus:ring-4 focus:ring-[var(--purple-1)]/20 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed'
                                    />
                                    <button
                                        onClick={handleAsk}
                                        disabled={!query.trim() || !isEmbedded || loading}
                                        className='absolute right-2 top-2 bottom-2 aspect-square bg-[var(--purple-4)] text-white rounded-xl flex items-center justify-center hover:bg-[#5b2ee0] disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                                    >
                                        🔍
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Results Section */}
                        {answer && (
                            <div className='space-y-8 animate-fade-in-up'>
                                {/* Answer Panel */}
                                <div className='bg-white rounded-2xl border border-[var(--border-light)] shadow-sm overflow-hidden'>
                                    <div className='px-6 py-4 border-b border-[var(--border-light)] bg-[var(--bg-2)] flex items-center gap-2'>
                                        <div className='w-4 h-4 bg-[var(--purple-4)] rounded-full flex items-center justify-center text-[8px] text-white'>AI</div>
                                        <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Generated Answer</span>
                                    </div>
                                    <div className='p-6 md:p-8 prose prose-sm max-w-none text-[var(--fg-4)]'>
                                        <ReactMarkdown>{answer}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Top Sources Grid */}
                                <div>
                                    <h3 className='text-xs font-bold uppercase tracking-widest text-muted mb-4 flex items-center gap-2'>
                                        <span>Top 5 Sources</span>
                                        <span className='w-full h-px bg-[var(--border-light)]' />
                                    </h3>

                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {topChunks.map((chunk, idx) => (
                                            <motion.div
                                                key={chunk.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                onClick={() => setSelectedChunk(chunk)}
                                                className='bg-white p-4 rounded-xl border border-[var(--border-light)] hover:border-[var(--purple-4)] hover:shadow-md cursor-pointer transition-all group flex flex-col h-48 relative overflow-hidden'
                                            >
                                                {/* Header: Score */}
                                                <div className='flex justify-between items-center mb-3'>
                                                    <span className='text-[10px] font-bold text-muted uppercase'>Chunk #{chunk.id}</span>
                                                    <div className={`
                                                        px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                        ${(chunk.score || 0) > 0.7 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                                    `}>
                                                        {Math.round((chunk.score || 0) * 100)}% Match
                                                    </div>
                                                </div>

                                                {/* Text Snippet */}
                                                <p className='text-xs text-[var(--fg-4)] leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity line-clamp-4'>
                                                    "{chunk.text}"
                                                </p>

                                                {/* Footer: Expand hint */}
                                                <div className='mt-auto pt-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--purple-4)] opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0'>
                                                    <span>View Details</span>
                                                    <span>→</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!answer && isEmbedded && (
                            <div className='text-center py-20 opacity-30'>
                                <div className='w-24 h-24 bg-[var(--purple-1)] rounded-full mx-auto mb-6 flex items-center justify-center text-4xl'>
                                    👀
                                </div>
                                <h3 className='text-lg font-bold text-[var(--fg-4)]'>Ready to Inspect</h3>
                                <p className='text-sm'>Enter a query to find the most relevant parts of your document.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Source Detail Modal */}
                <AnimatePresence>
                    {selectedChunk && (
                        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4' onClick={() => setSelectedChunk(null)}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className='absolute inset-0 bg-black/40 backdrop-blur-sm'
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className='relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]'
                            >
                                <div className='p-6 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-8 h-8 rounded-lg bg-[var(--purple-1)] flex items-center justify-center text-[var(--purple-4)] font-bold text-xs'>
                                            #{selectedChunk.id}
                                        </div>
                                        <div>
                                            <h3 className='text-sm font-bold text-[var(--fg-4)]'>Source Chunk Details</h3>
                                            <p className='text-[10px] text-muted uppercase tracking-wider'>
                                                Relevance Score: <span className='text-green-600 font-bold'>{Math.round((selectedChunk.score || 0) * 100)}%</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedChunk(null)}
                                        className='w-8 h-8 rounded-full hover:bg-[var(--border-light)] flex items-center justify-center transition-colors text-muted'
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className='p-6 overflow-y-auto custom-scrollbar bg-[#fafbff]'>
                                    <div className='p-6 bg-white rounded-xl border border-[var(--border-light)] shadow-sm'>
                                        <p className='text-sm text-[var(--fg-4)] leading-relaxed whitespace-pre-wrap font-mono'>
                                            {selectedChunk.text}
                                        </p>
                                    </div>

                                    <div className='mt-6 grid grid-cols-2 gap-4'>
                                        <div className='p-4 bg-white rounded-xl border border-[var(--border-light)]'>
                                            <span className='text-[10px] uppercase tracking-widest text-muted block mb-1'>Token Count (Approx)</span>
                                            <span className='text-lg font-bold text-[var(--fg-4)]'>~{Math.round(selectedChunk.text.length / 4)}</span>
                                        </div>
                                        <div className='p-4 bg-white rounded-xl border border-[var(--border-light)]'>
                                            <span className='text-[10px] uppercase tracking-widest text-muted block mb-1'>Character Count</span>
                                            <span className='text-lg font-bold text-[var(--fg-4)]'>{selectedChunk.text.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileMenuOpen(false)}>
                        <div className='w-full bg-white rounded-t-2xl p-6' onClick={e => e.stopPropagation()}>
                            <h3 className='font-bold mb-4'>Upload Document</h3>
                            {/* Simplified mobile upload flow would go here, relying on same logic */}
                            <div {...getRootProps()} className='p-4 border-dashed border-2 rounded-xl text-center mb-4'>
                                <input {...getInputProps()} />
                                <p>{fileName || "Tap to upload"}</p>
                            </div>
                            {pdfText && (
                                <button onClick={() => { handleEmbed(); setIsMobileMenuOpen(false); }} className='w-full py-3 bg-[var(--purple-4)] text-white rounded-xl font-bold'>
                                    Embed Document
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
