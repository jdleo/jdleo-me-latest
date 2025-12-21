'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { WebVitals } from '@/components/SEO/WebVitals';

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

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    return !inline && match ? (
        <div className='relative rounded-lg overflow-hidden bg-[#0D0D0E] border border-[var(--color-border)] my-4'>
            {language && (
                <div className='flex items-center justify-between px-4 py-1.5 bg-black/40 border-b border-[var(--color-border)]'>
                    <span className='text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider'>{language}</span>
                </div>
            )}
            <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag='div'
                customStyle={{
                    margin: 0,
                    background: 'transparent',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    lineHeight: '1.5',
                }}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className='bg-white/5 text-[var(--color-accent-blue)] px-1.5 py-0.5 rounded text-sm font-mono' {...props}>
            {children}
        </code>
    );
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');
    const [streamingMessage, setStreamingMessage] = useState('');
    const [systemPrompt, setSystemPrompt] = useState(
        "You are a helpful AI assistant. Today's date is {{currentDate}}."
    );
    const [showSystemPrompt, setShowSystemPrompt] = useState(false);
    const [isMobileModelSelectorOpen, setIsMobileModelSelectorOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
                                    setStreamingMessage(accumulatedContent);
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
                                    setIsLoading(false);
                                    return;
                                }
                            } catch (e) { }
                        }
                    }
                }
            }
        } catch (error) {
            setMessages([...updatedMessages, { content: "ERROR: Failed to connect to terminal.", isUser: false }]);
        } finally {
            setIsLoading(false);
            setStreamingMessage('');
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
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                    <div className='absolute inset-0' style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/ai-chat</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Pane: Controls & Settings */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:flex flex-col gap-8'>
                                <div>
                                    <div className='flex items-center gap-2 mb-6 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>Session</span>
                                    </div>
                                    <div className='flex flex-col gap-4'>
                                        <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                        <button
                                            onClick={() => setMessages([])}
                                            className='text-left text-lg text-red-400/70 hover:text-red-400 transition-colors'
                                        >
                                            ~/clear_history
                                        </button>
                                    </div>
                                </div>

                                <div className='space-y-6 flex-grow overflow-y-auto scrollbar-hide'>
                                    <div className='font-mono'>
                                        <span className='text-[var(--color-text)] opacity-70'>$ select --model</span>
                                        <div className='mt-4 flex flex-col gap-2'>
                                            {availableModels.map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setSelectedModel(m.id)}
                                                    className={`p-3 text-left border rounded transition-all flex items-center gap-3 ${selectedModel === m.id ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-text-dim)]'}`}
                                                >
                                                    <div className='w-5 h-5 rounded-sm bg-white flex items-center justify-center p-0.5 shrink-0'>
                                                        <Image src={m.icon} alt={m.name} width={16} height={16} className='object-contain' />
                                                    </div>
                                                    <span className='text-xs font-bold uppercase tracking-tighter truncate'>{m.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='font-mono'>
                                        <span className='text-[var(--color-text)] opacity-70'>$ config --system</span>
                                        <textarea
                                            value={systemPrompt}
                                            onChange={e => setSystemPrompt(e.target.value)}
                                            className='mt-3 w-full bg-black/40 border border-[var(--color-border)] p-3 text-xs text-[var(--color-text-dim)] rounded focus:border-[var(--color-accent)] outline-none transition-colors'
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Pane: Chat Interface */}
                            <div className='terminal-pane bg-black/20 flex flex-col p-0 overflow-hidden w-full'>
                                <div className='flex-grow overflow-y-auto p-6 scrollbar-hide flex flex-col gap-8'>
                                    {showWelcome && (
                                        <div className='opacity-40 font-mono text-sm leading-relaxed border border-dashed border-[var(--color-border)] p-8 rounded-xl'>
                                            <div className='text-[var(--color-accent)] mb-4'>[TERMINAL READY]</div>
                                            <p className='mb-4'>Welcome to the multi-model AI console. Compare responses from leading LLMs in a secure, technical environment.</p>
                                            <p className='mb-4'>All models are routed via OpenRouter and session history is stored locally in-memory.</p>
                                            <div className='flex flex-wrap gap-2 text-xs'>
                                                <span className='px-2 py-1 bg-white/5 border border-[var(--color-border)] rounded text-[var(--color-text-dim)]'>CTRL+L to clear</span>
                                                <span className='px-2 py-1 bg-white/5 border border-[var(--color-border)] rounded text-[var(--color-text-dim)]'>Markdown supported</span>
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((m, i) => (
                                        <div key={i} className='flex flex-col gap-3 group'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-2'>
                                                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${m.isUser ? 'text-[var(--color-accent-blue)]' : 'text-[var(--color-accent)]'}`}>
                                                        [{m.isUser ? 'USER' : m.model?.toUpperCase().replace(/\s+/g, '_') || 'AI'}]
                                                    </span>
                                                    {!m.isUser && m.usage && (
                                                        <span className='text-[10px] text-[var(--color-text-dim)] opacity-0 group-hover:opacity-100 transition-opacity font-mono'>
                                                            (latency: {m.usage.response_time_ms}ms | cost: ${m.usage.estimated_cost?.toFixed(5)})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`font-mono text-sm leading-relaxed ${m.isUser ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'}`}>
                                                {!m.isUser ? (
                                                    <div className='prose prose-invert prose-sm max-w-none'>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm as any]}
                                                            rehypePlugins={[rehypeRaw as any]}
                                                            components={{ code: CodeBlock }}
                                                        >
                                                            {m.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p>{m.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {streamingMessage && (
                                        <div className='flex flex-col gap-3'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-[var(--color-accent)] text-xs font-mono font-bold uppercase tracking-wider'>
                                                    [{availableModels.find(m => m.id === selectedModel)?.name.toUpperCase().replace(/\s+/g, '_') || 'AI'}]
                                                </span>
                                            </div>
                                            <div className='font-mono text-sm text-[var(--color-text-dim)] leading-relaxed'>
                                                <div className='prose prose-invert prose-sm max-w-none'>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm as any]}
                                                        rehypePlugins={[rehypeRaw as any]}
                                                        components={{ code: CodeBlock }}
                                                    >
                                                        {streamingMessage}
                                                    </ReactMarkdown>
                                                </div>
                                                <span className='inline-block w-2 h-4 bg-[var(--color-accent)] ml-1 animate-pulse' />
                                            </div>
                                        </div>
                                    )}

                                    {isLoading && !streamingMessage && (
                                        <div className='flex items-center gap-2 text-[var(--color-text-dim)] text-xs font-mono italic animate-pulse'>
                                            <span>Establishing secure link...</span>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Terminal Input Field */}
                                <div className='p-4 bg-black/40 border-t border-[var(--color-border)]'>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                                        className='flex items-center gap-3 px-3 py-2 bg-white/5 border border-[var(--color-border)] rounded focus-within:border-[var(--color-accent)] transition-colors'
                                    >
                                        <span className='text-[var(--color-accent)] font-mono'>$</span>
                                        <input
                                            type='text'
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder='Transmit command...'
                                            className='flex-grow bg-transparent border-none outline-none text-sm font-mono text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] placeholder:opacity-40'
                                            disabled={isLoading}
                                        />
                                        <button
                                            type='submit'
                                            disabled={isLoading || !input.trim()}
                                            className='text-[var(--color-accent)] hover:scale-110 transition-transform disabled:opacity-30'
                                        >
                                            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                                                <path d='M5 12h14M12 5l7 7-7 7' />
                                            </svg>
                                        </button>
                                    </form>
                                    <div className='mt-4 flex items-center justify-between'>
                                        <div className='flex items-center gap-4 text-[10px] font-mono text-[var(--color-text-dim)] tracking-widest opacity-40 uppercase'>
                                            <span>Buffer: OK</span>
                                            <span>Stream: ACTIVE</span>
                                            <span>Network: SECURE</span>
                                        </div>
                                        <div className='flex items-center gap-2 md:hidden'>
                                            <button
                                                type='button'
                                                onClick={() => setIsMobileModelSelectorOpen(true)}
                                                className='text-[10px] font-mono text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-0.5 rounded bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10 transition-colors flex items-center gap-1.5'
                                            >
                                                <span>{availableModels.find(m => m.id === selectedModel)?.name}</span>
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Model Selector Overlay */}
                            {isMobileModelSelectorOpen && (
                                <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 md:hidden' onClick={() => setIsMobileModelSelectorOpen(false)}>
                                    <div className='w-full max-w-sm terminal-window animate-slide-up' onClick={e => e.stopPropagation()}>
                                        <div className='terminal-header'>
                                            <div className='terminal-title'>SELECT_MODEL</div>
                                            <button onClick={() => setIsMobileModelSelectorOpen(false)} className='text-[var(--color-text-dim)] hover:text-[var(--color-text)] font-mono text-xs'>[CLOSE]</button>
                                        </div>
                                        <div className='p-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto scrollbar-hide'>
                                            {availableModels.map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        setSelectedModel(m.id);
                                                        setIsMobileModelSelectorOpen(false);
                                                    }}
                                                    className={`p-4 text-left border rounded transition-all flex items-center justify-between ${selectedModel === m.id ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-dim)]'}`}
                                                >
                                                    <div className='flex items-center gap-4'>
                                                        <div className='w-6 h-6 rounded bg-white flex items-center justify-center p-0.5 shrink-0'>
                                                            <Image src={m.icon} alt={m.name} width={20} height={20} className='object-contain' />
                                                        </div>
                                                        <div className='flex flex-col'>
                                                            <span className='text-xs font-bold uppercase tracking-widest'>{m.name}</span>
                                                            <span className='text-[10px] opacity-60'>{m.description}</span>
                                                        </div>
                                                    </div>
                                                    {selectedModel === m.id && <span className='text-[var(--color-accent)] font-mono text-xs'>[ACTIVE]</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
