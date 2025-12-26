'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';
import MessageItem, { Message } from '@/components/chat/MessageItem';
import ChatInput from '@/components/chat/ChatInput';
import { WebVitals } from '@/components/SEO/WebVitals';



export default function Resume() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [isMobileSuggestionsOpen, setIsMobileSuggestionsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamBufferRef = useRef('');

    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            if (streamBufferRef.current && streamingMessage !== streamBufferRef.current) {
                setStreamingMessage(prev => {
                    const diff = streamBufferRef.current.length - prev.length;
                    if (diff <= 0) return streamBufferRef.current;
                    const jump = Math.max(1, Math.min(diff, Math.ceil(diff / 8)));
                    return streamBufferRef.current.slice(0, prev.length + jump);
                });
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        if (isLoading) {
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isLoading, streamingMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, streamingMessage]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const sendMessage = async (message: string) => {
        if (!message.trim() || isLoading) return;

        setShowWelcome(false);
        setIsMobileSuggestionsOpen(false);
        const updatedMessages = [...messages, { content: message, isUser: true }];
        setMessages(updatedMessages);
        setIsLoading(true);
        setStreamingMessage('');

        const startTime = Date.now();
        try {
            const apiMessages = updatedMessages.slice(-10);
            const systemPromptResponse = await fetch('/api/resume-prompt');
            const { systemPrompt: resumeSystemPrompt } = await systemPromptResponse.json();

            const response = await fetch('/api/chat-openrouter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    model: 'openai/gpt-5.2-chat',
                    systemPrompt: resumeSystemPrompt,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';
            let usageData: any = null;

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.type === 'content') {
                                    accumulatedContent += data.content;
                                    streamBufferRef.current = accumulatedContent;
                                } else if (data.type === 'usage') {
                                    usageData = data.usage;
                                } else if (data.type === 'done') {
                                    const endTime = Date.now();
                                    const responseTimeMs = endTime - startTime;
                                    let processedUsage = null;
                                    if (usageData) {
                                        const tokensPerSecond = usageData.completion_tokens / (responseTimeMs / 1000);
                                        const estimatedCost = usageData.prompt_tokens * 0.000001 + usageData.completion_tokens * 0.000002;
                                        processedUsage = {
                                            ...usageData,
                                            tokens_per_second: Math.round(tokensPerSecond * 10) / 10,
                                            estimated_cost: Math.round(estimatedCost * 100000) / 100000,
                                            response_time_ms: responseTimeMs,
                                        };
                                    }
                                    setMessages([
                                        ...updatedMessages,
                                        {
                                            content: accumulatedContent,
                                            isUser: false,
                                            model: "johns_resume_ai",
                                            usage: processedUsage,
                                        },
                                    ]);
                                    setStreamingMessage('');
                                    streamBufferRef.current = '';
                                    setIsLoading(false);
                                    return;
                                }
                            } catch (e) { }
                        }
                    }
                }
            }
        } catch (error) {
            setMessages([...updatedMessages, { content: "ERROR: Connection failed. Please retry.", isUser: false }]);
        } finally {
            setIsLoading(false);
            setStreamingMessage('');
            streamBufferRef.current = '';
        }
    };

    const suggestedQueries = [
        "What is John's work history?",
        "Tell me about his experience at Roblox.",
        "What is his tech stack?",
        "Is he open to new roles?",
        "What database technologies does he know?",
    ];

    return (
        <>
            <WebVitals />
            <main className='relative h-screen bg-[#fafbff] overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] flex flex-col md:flex-row'>

                {/* Mobile Header */}
                <header className='md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-white/80 backdrop-blur-md z-50'>
                    <Link href='/apps' className='text-sm font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)]'>
                        ← Apps
                    </Link>
                    <button
                        onClick={() => setIsMobileSuggestionsOpen(true)}
                        className='px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-[var(--fg-4)] flex items-center gap-1.5'
                    >
                        <span>Suggestions</span>
                        <span className='text-[10px]'>▼</span>
                    </button>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Resume Bot</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-4 space-y-6'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4 px-2'>Suggested Queries</h3>
                            <div className='space-y-2'>
                                {suggestedQueries.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className='w-full p-3 text-left rounded-xl hover:bg-white/60 border border-transparent hover:border-[var(--border-light)] transition-all flex items-center gap-2 group'
                                    >
                                        <div className='w-6 h-6 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-[var(--purple-4)] text-[10px] font-bold group-hover:bg-[var(--purple-1)] transition-colors'>
                                            ?
                                        </div>
                                        <span className='text-xs font-medium text-[var(--fg-4)]'>{q}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='p-4 border-t border-[var(--border-light)]'>
                        <button
                            onClick={() => { setMessages([]); setShowWelcome(true); }}
                            className='w-full py-2 px-4 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2'
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                            Clear Conversation
                        </button>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff]'>
                    {/* Floating decorations for main area */}
                    <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--purple-1)] opacity-40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-y-auto p-4 md:p-8 scrollbar-hide space-y-8 pb-32 z-10'>
                        {showWelcome && (
                            <div className='flex flex-col items-center justify-center h-full text-center space-y-6 opacity-0 animate-fade-in-up' style={{ animationFillMode: 'forwards' }}>
                                <div>
                                    <h1 className='text-2xl font-bold text-[var(--fg-4)] mb-2'>Hi! I know everything about John.</h1>
                                    <p className='text-muted max-w-md mx-auto'>
                                        Ask me anything about his experience, skills, projects, or background.
                                    </p>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full px-4'>
                                    {suggestedQueries.slice(0, 4).map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(q)}
                                            className='p-4 bg-white border border-[var(--border-light)] rounded-xl text-xs font-medium text-[var(--fg-4)] hover:border-[var(--purple-2)] hover:shadow-sm transition-all text-left'
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <MessageItem key={i} message={m} />
                        ))}

                        {streamingMessage && (
                            <div className='flex justify-start animate-fade-in-up'>
                                <div className='max-w-[90%] md:max-w-3xl bg-white rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm border border-[var(--border-light)]'>
                                    <div className='flex items-center gap-2 mb-3 pb-3 border-b border-gray-100'>
                                        <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--purple-4)]'>
                                            Thinking...
                                        </span>
                                    </div>
                                    <div className='prose prose-sm max-w-none blog-content'>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                code: CodeBlock as any,
                                                table: ({ children }) => <div className="table-wrapper"><table className="w-full">{children}</table></div>,
                                                thead: ({ children }) => <thead className="bg-[var(--gray-1)]">{children}</thead>,
                                                th: ({ children }) => <th className="p-3 text-left font-bold text-xs uppercase tracking-wider text-[var(--fg-4)] border-b border-[var(--border-light)]">{children}</th>,
                                                td: ({ children }) => <td className="p-3 border-b border-[var(--border-light)] text-sm">{children}</td>,
                                            }}
                                        >
                                            {streamingMessage}
                                        </ReactMarkdown>
                                        <span className='inline-block w-1.5 h-4 bg-[var(--purple-4)] ml-1 animate-pulse align-middle rounded-full' />
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoading && !streamingMessage && (
                            <div className='flex justify-start animate-fade-in-up'>
                                <div className='max-w-[90%] md:max-w-3xl bg-white rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm border border-[var(--border-light)]'>
                                    <div className='flex items-center gap-1.5'>
                                        <div className='w-2 h-2 rounded-full bg-[var(--purple-4)] animate-bounce' style={{ animationDelay: '0ms' }} />
                                        <div className='w-2 h-2 rounded-full bg-[var(--purple-4)] animate-bounce' style={{ animationDelay: '150ms' }} />
                                        <div className='w-2 h-2 rounded-full bg-[var(--purple-4)] animate-bounce' style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className='p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-[var(--border-light)] z-20'>
                        <ChatInput
                            onSend={sendMessage}
                            isLoading={isLoading}
                            placeholder='Ask about John...'
                        />
                    </div>
                </div>

                {/* Mobile Suggestions Overlay */}
                {isMobileSuggestionsOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileSuggestionsOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Suggested Queries</span>
                                <button onClick={() => setIsMobileSuggestionsOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-2 max-h-[60vh] overflow-y-auto'>
                                {suggestedQueries.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className='w-full p-3 text-left rounded-xl hover:bg-[var(--bg-2)] border border-transparent transition-all flex items-center gap-3'
                                    >
                                        <div className='w-6 h-6 rounded-full bg-[var(--purple-1)] flex items-center justify-center text-[var(--purple-4)] text-[10px] font-bold'>
                                            ?
                                        </div>
                                        <span className='text-xs font-medium text-[var(--fg-4)]'>{q}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

