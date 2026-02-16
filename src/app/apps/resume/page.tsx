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
import { strings } from '../../constants/strings';
import { ArrowLeftIcon, SparklesIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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
                    model: 'anthropic/claude-sonnet-4.5',
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
                                            model: "John's Resume AI",
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
            <main className='notion-page' style={{ height: '100vh', overflow: 'hidden' }}>
                {/* Header */}
                <header className='notion-header loaded' style={{ position: 'sticky' }}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '100%' }}>
                        <Link href='/apps' className='notion-nav-link'>
                            <ArrowLeftIcon className='notion-nav-icon' />
                            <span className='hidden sm:inline'>Back to Apps</span>
                            <span className='sm:hidden'>Apps</span>
                        </Link>
                        <button
                            onClick={() => setIsMobileSuggestionsOpen(true)}
                            className='md:hidden notion-nav-link'
                            style={{ padding: '4px 10px' }}
                        >
                            <span className='text-xs'>Suggestions</span>
                            <ChevronDownIcon className='notion-nav-icon' style={{ width: '12px', height: '12px' }} />
                        </button>
                        <Link href='/' className='notion-nav-link hidden md:flex' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                    </div>
                </header>

                <div style={{ display: 'flex', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>
                    {/* Left Sidebar (Desktop) */}
                    <aside className='hidden md:flex flex-col' style={{ width: '280px', borderRight: '1px solid rgba(55, 53, 47, 0.09)', backgroundColor: '#ffffff' }}>
                        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(55, 53, 47, 0.09)' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                                Suggested Questions
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {suggestedQueries.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className='notion-chat-model-btn'
                                        style={{ backgroundColor: 'transparent', borderColor: 'transparent' }}
                                    >
                                        <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <SparklesIcon style={{ width: '16px', height: '16px', color: 'rgba(55, 53, 47, 0.5)', strokeWidth: 2 }} />
                                        </div>
                                        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#37352f' }}>
                                                {q}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid rgba(55, 53, 47, 0.09)' }}>
                            <button
                                onClick={() => { setMessages([]); setShowWelcome(true); }}
                                className='notion-chat-clear-btn'
                            >
                                Clear Conversation
                            </button>
                        </div>
                    </aside>

                    {/* Main Chat Area */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' }}>
                        <div className='scrollbar-hide' style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: '120px' }}>
                            {showWelcome && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '16px' }}>
                                    <div>
                                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#37352f', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                                            Hi! I know everything about John.
                                        </h1>
                                        <p style={{ fontSize: '15px', color: 'rgba(55, 53, 47, 0.6)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                                            Ask me anything about his experience, skills, projects, or background.
                                        </p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', maxWidth: '600px', width: '100%' }}>
                                        {suggestedQueries.slice(0, 4).map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => sendMessage(q)}
                                                style={{ padding: '14px 16px', background: 'rgba(55, 53, 47, 0.04)', border: '1px solid rgba(55, 53, 47, 0.08)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#37352f', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(55, 53, 47, 0.06)'; e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.12)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(55, 53, 47, 0.04)'; e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.08)'; }}
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
                                <div className='notion-chat-message-wrapper'>
                                    <div className='notion-chat-message notion-chat-message-ai'>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(55, 53, 47, 0.06)' }}>
                                            Thinking...
                                        </div>
                                        <div className='notion-blog-content'>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    code: CodeBlock as any,
                                                    table: ({ children }) => <div className="table-wrapper"><table>{children}</table></div>,
                                                }}
                                            >
                                                {streamingMessage}
                                            </ReactMarkdown>
                                            <span className='notion-chat-cursor' />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isLoading && !streamingMessage && (
                                <div className='notion-chat-message-wrapper'>
                                    <div className='notion-chat-message notion-chat-message-ai'>
                                        <div className='notion-chat-loading'>
                                            <div className='notion-chat-loading-dot' style={{ animationDelay: '0ms' }} />
                                            <div className='notion-chat-loading-dot' style={{ animationDelay: '150ms' }} />
                                            <div className='notion-chat-loading-dot' style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(55, 53, 47, 0.09)', backgroundColor: '#ffffff' }}>
                            <ChatInput
                                onSend={sendMessage}
                                isLoading={isLoading}
                                placeholder='Ask about John...'
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Suggestions Overlay */}
                {isMobileSuggestionsOpen && (
                    <div className='notion-mobile-overlay' onClick={() => setIsMobileSuggestionsOpen(false)}>
                        <div className='notion-mobile-panel' onClick={e => e.stopPropagation()}>
                            <div className='notion-mobile-panel-header'>
                                <span>Suggested Questions</span>
                                <button onClick={() => setIsMobileSuggestionsOpen(false)} className='notion-mobile-close'>✕</button>
                            </div>
                            <div style={{ padding: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
                                {suggestedQueries.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className='notion-chat-model-btn'
                                        style={{ backgroundColor: 'transparent', borderColor: 'transparent', marginBottom: '6px' }}
                                    >
                                        <SparklesIcon style={{ width: '18px', height: '18px', color: 'rgba(55, 53, 47, 0.5)', strokeWidth: 2 }} />
                                        <div style={{ flex: 1, textAlign: 'left' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#37352f' }}>{q}</div>
                                        </div>
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
