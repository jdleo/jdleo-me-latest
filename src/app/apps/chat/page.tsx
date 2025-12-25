'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';
import { WebVitals } from '@/components/SEO/WebVitals';
import { strings } from '../../constants/strings';

type Message = {
    content: string;
    isUser: boolean;
    model?: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        tokens_per_second?: number;
        estimated_cost?: number;
        response_time_ms?: number;
    };
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');
    const [streamingMessage, setStreamingMessage] = useState('');
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(
        "You are a helpful AI assistant. Today's date is {{currentDate}}."
    );
    const [isMobileModelSelectorOpen, setIsMobileModelSelectorOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamBufferRef = useRef('');

    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            if (streamBufferRef.current && streamingMessage !== streamBufferRef.current) {
                setStreamingMessage(prev => {
                    const diff = streamBufferRef.current.length - prev.length;
                    if (diff <= 0) return streamBufferRef.current; // Catch up if buffer reset or smaller (shouldn't happen usually)

                    // Throttling logic: larger jump if falling behind
                    const jump = Math.max(1, Math.min(diff, Math.ceil(diff / 8)));
                    return streamBufferRef.current.slice(0, prev.length + jump);
                });
            } else if (!streamBufferRef.current && streamingMessage) {
                // Buffer cleared but message exists (e.g. finished), clear it? 
                // Handled by sendMessage finally block usually, but let's be safe
                // setStreamingMessage('');
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

    useEffect(() => {
        const savedSystemPrompt = localStorage.getItem('chatSystemPrompt');
        if (savedSystemPrompt) setSystemPrompt(savedSystemPrompt);
    }, []);

    useEffect(() => {
        localStorage.setItem('chatSystemPrompt', systemPrompt);
    }, [systemPrompt]);

    const sendMessage = async (message: string) => {
        if (!message.trim() || isLoading) return;
        setInput('');
        setShowWelcome(false);
        const updatedMessages = [...messages, { content: message, isUser: true }];
        setMessages(updatedMessages);
        setIsLoading(true);
        setStreamingMessage('');
        const startTime = Date.now();

        try {
            const apiMessages = updatedMessages.slice(-10);
            const currentDate = new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            });
            const processedSystemPrompt = systemPrompt.replace(/\{\{currentDate\}\}/g, currentDate);

            const response = await fetch('/api/chat-openrouter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    model: selectedModel,
                    systemPrompt: processedSystemPrompt,
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
                                    setMessages([...updatedMessages, {
                                        content: accumulatedContent,
                                        isUser: false,
                                        model: availableModels.find(m => m.id === selectedModel)?.name,
                                        usage: processedUsage,
                                    }]);
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
            setMessages([...updatedMessages, { content: "ERROR: Failed to connect to service.", isUser: false }]);
        } finally {
            setIsLoading(false);
            setStreamingMessage('');
            streamBufferRef.current = '';
        }
    };

    const availableModels = [
        { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', description: "Small & fast", icon: '/chatgpt.png' },
        { id: 'anthropic/claude-sonnet-4.5', name: 'Claude 4.5 Sonnet', description: "Flagship", icon: '/claude.png' },
        { id: 'openai/gpt-5.2-chat', name: 'GPT 5.2 Chat', description: "Newest gen", icon: '/chatgpt.png' },
        { id: 'openai/o4-mini', name: 'O4-Mini', description: 'Compact reasoning', icon: '/chatgpt.png' },
        { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro', description: "Google Enhanced", icon: '/gemini.png' },
        { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: "Fast & Efficient", icon: '/gemini.png' },
        { id: 'x-ai/grok-4', name: 'Grok 4', description: "Advanced reasoning", icon: '/grok.png' },
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
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => setIsMobileModelSelectorOpen(true)}
                            className='flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full shadow-sm text-xs font-bold uppercase tracking-wider text-[var(--fg-4)]'
                        >
                            <span>{availableModels.find(m => m.id === selectedModel)?.name}</span>
                            <span className='text-[10px]'>▼</span>
                        </button>
                        <button
                            onClick={() => setIsMobileSettingsOpen(true)}
                            className='w-8 h-8 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-[var(--fg-4)] shadow-sm'
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Left Sidebar (Desktop) */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>AI Studio</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-4 space-y-6'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4 px-2'>Select Model</h3>
                            <div className='space-y-2'>
                                {availableModels.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedModel(m.id)}
                                        className={`w-full p-3 text-left rounded-xl transition-all flex items-center gap-3 group ${selectedModel === m.id
                                            ? 'bg-white shadow-md border border-[var(--purple-2)] ring-1 ring-[var(--purple-2)]'
                                            : 'hover:bg-white/60 border border-transparent hover:border-[var(--border-light)]'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center p-1 transition-colors ${selectedModel === m.id ? 'bg-[var(--purple-1)]' : 'bg-white border border-[var(--border-light)]'}`}>
                                            <Image src={m.icon} alt={m.name} width={20} height={20} className='object-contain' />
                                        </div>
                                        <div>
                                            <div className={`text-xs font-bold uppercase tracking-wider ${selectedModel === m.id ? 'text-[var(--purple-4)]' : 'text-[var(--fg-4)]'}`}>
                                                {m.name}
                                            </div>
                                            <div className='text-[10px] text-muted font-medium opacity-70'>
                                                {m.description}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4 px-2'>System Configuration</h3>
                            <textarea
                                value={systemPrompt}
                                onChange={e => setSystemPrompt(e.target.value)}
                                className='w-full bg-white border border-[var(--border-light)] p-3 text-xs rounded-xl focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none transition-all resize-none shadow-sm text-muted font-medium leading-relaxed'
                                rows={6}
                                placeholder="Enter system prompt..."
                            />
                        </div>
                    </div>

                    <div className='p-4 border-t border-[var(--border-light)]'>
                        <button
                            onClick={() => setMessages([])}
                            className='w-full py-2 px-4 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2'
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                            Clear History
                        </button>
                    </div>
                </aside>

                {/* Main Chat Area */}
                <div className='flex-grow flex flex-col h-full relative bg-[#fafbff]'>
                    {/* Floating decorations for main area */}
                    <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--purple-1)] opacity-30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2' />

                    <div className='flex-grow overflow-y-auto p-4 md:p-8 scrollbar-hide space-y-6 pb-32 z-10'>
                        {showWelcome && (
                            <div className='flex flex-col items-center justify-center h-full text-center space-y-6 opacity-0 animate-fade-in-up' style={{ animationFillMode: 'forwards' }}>
                                <div>
                                    <h1 className='text-2xl font-bold text-[var(--fg-4)] mb-2'>Feel free to chat and ask anything!</h1>
                                    <p className='text-muted max-w-lg mx-auto leading-relaxed'>
                                        Your chats are <span className='font-bold text-[var(--purple-4)]'>NEVER EVER</span> saved anywhere.
                                        <br />
                                        This is totally free (for now), so have fun! ✨
                                    </p>
                                </div>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                <div className={`max-w-[90%] md:max-w-3xl ${m.isUser
                                    ? 'bg-[var(--fg-4)] text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg'
                                    : 'bg-white rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm border border-[var(--border-light)]'
                                    }`}>
                                    {!m.isUser && (
                                        <div className='flex items-center gap-2 mb-3 pb-3 border-b border-gray-100'>
                                            <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--purple-4)]'>
                                                {m.model}
                                            </span>
                                            {m.usage && (
                                                <div className='flex items-center gap-3 text-[10px] text-muted opacity-60 font-medium'>
                                                    <span>{m.usage.response_time_ms}ms</span>
                                                    <span>{m.usage.tokens_per_second?.toFixed(1)} tok/s</span>
                                                    <span>${m.usage.estimated_cost?.toFixed(5)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className={`prose prose-sm max-w-none ${m.isUser ? 'prose-invert' : 'blog-content'}`}>
                                        {m.isUser ? (
                                            <p className='whitespace-pre-wrap leading-relaxed'>{m.content}</p>
                                        ) : (
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
                                                {m.content}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            </div>
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
                        <div className='max-w-3xl mx-auto'>
                            <form
                                onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                                className='relative group'
                            >
                                <input
                                    type='text'
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder='Ask anything...'
                                    className='w-full bg-white border border-[var(--border-light)] rounded-full pl-6 pr-14 py-4 shadow-sm focus:shadow-lg focus:border-[var(--purple-4)] outline-none transition-all text-sm font-medium text-[var(--fg-4)] placeholder:text-muted/60'
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <button
                                    type='submit'
                                    disabled={isLoading || !input.trim()}
                                    className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--fg-4)] hover:bg-[var(--purple-4)] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-[var(--fg-4)] shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                                >
                                    {isLoading ? (
                                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                    ) : (
                                        <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                                            <path d='M5 12h14M12 5l7 7-7 7' />
                                        </svg>
                                    )}
                                </button>
                            </form>
                            <div className='text-center mt-3'>
                                <span className='text-[10px] text-muted font-medium opacity-60 uppercase tracking-widest'>
                                    Powered by {availableModels.find(m => m.id === selectedModel)?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Model Selector Overlay */}
                {isMobileModelSelectorOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileModelSelectorOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Select Model</span>
                                <button onClick={() => setIsMobileModelSelectorOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-2 max-h-[60vh] overflow-y-auto'>
                                {availableModels.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedModel(m.id);
                                            setIsMobileModelSelectorOpen(false);
                                        }}
                                        className={`w-full p-3 text-left rounded-xl transition-all flex items-center gap-3 ${selectedModel === m.id ? 'bg-[var(--purple-1)] border border-[var(--purple-2)]' : 'hover:bg-[var(--bg-2)] border border-transparent'}`}
                                    >
                                        <Image src={m.icon} alt={m.name} width={24} height={24} className='object-contain bg-white rounded-md p-0.5 border border-[var(--border-light)]' />
                                        <div className='flex flex-col'>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${selectedModel === m.id ? 'text-[var(--purple-4)]' : 'text-[var(--fg-4)]'}`}>{m.name}</span>
                                            <span className='text-[10px] text-muted'>{m.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Settings Overlay */}
                {isMobileSettingsOpen && (
                    <div className='fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileSettingsOpen(false)}>
                        <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-slide-up overflow-hidden border border-[var(--border-light)]' onClick={e => e.stopPropagation()}>
                            <div className='p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-2)]'>
                                <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>System Configuration</span>
                                <button onClick={() => setIsMobileSettingsOpen(false)} className='w-6 h-6 rounded-full bg-white border border-[var(--border-light)] flex items-center justify-center text-muted'>✕</button>
                            </div>
                            <div className='p-4'>
                                <textarea
                                    value={systemPrompt}
                                    onChange={e => setSystemPrompt(e.target.value)}
                                    className='w-full bg-[var(--bg-2)] border border-[var(--border-light)] p-3 text-xs rounded-xl focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] outline-none transition-all resize-none shadow-sm text-muted font-medium leading-relaxed'
                                    rows={8}
                                    placeholder="Enter system prompt..."
                                />
                                <div className='mt-4 flex justify-end gap-2'>
                                    <button
                                        onClick={() => setMessages([])}
                                        className='py-2 px-4 rounded-lg border border-red-100 bg-red-50 text-red-500 text-xs font-bold uppercase tracking-wider transition-colors'
                                    >
                                        Clear History
                                    </button>
                                    <button
                                        onClick={() => setIsMobileSettingsOpen(false)}
                                        className='py-2 px-4 rounded-lg bg-[var(--fg-4)] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md'
                                    >
                                        Save & Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
