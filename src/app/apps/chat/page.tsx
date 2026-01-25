'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';
import MessageItem, { Message } from '@/components/chat/MessageItem';
import ChatInput from '@/components/chat/ChatInput';
import { WebVitals } from '@/components/SEO/WebVitals';
import { strings } from '../../constants/strings';
import { ArrowLeftIcon, Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
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

    useEffect(() => {
        const savedSystemPrompt = localStorage.getItem('chatSystemPrompt');
        if (savedSystemPrompt) setSystemPrompt(savedSystemPrompt);
    }, []);

    useEffect(() => {
        localStorage.setItem('chatSystemPrompt', systemPrompt);
    }, [systemPrompt]);

    const sendMessage = async (message: string) => {
        if (!message.trim() || isLoading) return;
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
            <main className='notion-page' style={{ height: '100vh', overflow: 'hidden' }}>
                {/* Header */}
                <header className='notion-header loaded' style={{ position: 'sticky' }}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '100%' }}>
                        <Link href='/apps' className='notion-nav-link'>
                            <ArrowLeftIcon className='notion-nav-icon' />
                            <span className='hidden sm:inline'>Back to Apps</span>
                            <span className='sm:hidden'>Apps</span>
                        </Link>
                        <div className='md:hidden flex items-center gap-1.5'>
                            <button
                                onClick={() => setIsMobileModelSelectorOpen(true)}
                                className='notion-nav-link'
                                style={{ padding: '4px 8px' }}
                            >
                                <span className='text-xs'>{availableModels.find(m => m.id === selectedModel)?.name.split(' ')[0]}</span>
                                <ChevronDownIcon className='notion-nav-icon' style={{ width: '12px', height: '12px' }} />
                            </button>
                            <button
                                onClick={() => setIsMobileSettingsOpen(true)}
                                className='notion-nav-link'
                                style={{ padding: '6px' }}
                            >
                                <Cog6ToothIcon className='notion-nav-icon' />
                            </button>
                        </div>
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
                                Select Model
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {availableModels.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedModel(m.id)}
                                        className='notion-chat-model-btn'
                                        style={{
                                            backgroundColor: selectedModel === m.id ? 'rgba(55, 53, 47, 0.06)' : 'transparent',
                                            borderColor: selectedModel === m.id ? 'rgba(55, 53, 47, 0.12)' : 'transparent',
                                        }}
                                    >
                                        <Image src={m.icon} alt={m.name} width={18} height={18} className='object-contain' />
                                        <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#37352f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {m.name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)' }}>
                                                {m.description}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '20px 16px', flex: 1, overflowY: 'auto' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                                System Prompt
                            </div>
                            <textarea
                                value={systemPrompt}
                                onChange={e => setSystemPrompt(e.target.value)}
                                className='notion-chat-textarea'
                                rows={8}
                                placeholder="Enter system prompt..."
                            />
                        </div>

                        <div style={{ padding: '16px', borderTop: '1px solid rgba(55, 53, 47, 0.09)' }}>
                            <button
                                onClick={() => setMessages([])}
                                className='notion-chat-clear-btn'
                            >
                                Clear History
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
                                            Feel free to chat and ask anything!
                                        </h1>
                                        <p style={{ fontSize: '15px', color: 'rgba(55, 53, 47, 0.6)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                                            Your chats are <span style={{ fontWeight: 600, color: '#37352f' }}>NEVER EVER</span> saved anywhere.
                                            <br />
                                            This is totally free (for now), so have fun!
                                        </p>
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
                                modelName={availableModels.find(m => m.id === selectedModel)?.name}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Model Selector Overlay */}
                {isMobileModelSelectorOpen && (
                    <div className='notion-mobile-overlay' onClick={() => setIsMobileModelSelectorOpen(false)}>
                        <div className='notion-mobile-panel' onClick={e => e.stopPropagation()}>
                            <div className='notion-mobile-panel-header'>
                                <span>Select Model</span>
                                <button onClick={() => setIsMobileModelSelectorOpen(false)} className='notion-mobile-close'>✕</button>
                            </div>
                            <div style={{ padding: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
                                {availableModels.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedModel(m.id);
                                            setIsMobileModelSelectorOpen(false);
                                        }}
                                        className='notion-chat-model-btn'
                                        style={{
                                            backgroundColor: selectedModel === m.id ? 'rgba(55, 53, 47, 0.06)' : 'transparent',
                                            borderColor: selectedModel === m.id ? 'rgba(55, 53, 47, 0.12)' : 'transparent',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        <Image src={m.icon} alt={m.name} width={20} height={20} className='object-contain' />
                                        <div style={{ flex: 1, textAlign: 'left' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 500, color: '#37352f' }}>{m.name}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.5)' }}>{m.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Settings Overlay */}
                {isMobileSettingsOpen && (
                    <div className='notion-mobile-overlay' onClick={() => setIsMobileSettingsOpen(false)}>
                        <div className='notion-mobile-panel' onClick={e => e.stopPropagation()}>
                            <div className='notion-mobile-panel-header'>
                                <span>System Prompt</span>
                                <button onClick={() => setIsMobileSettingsOpen(false)} className='notion-mobile-close'>✕</button>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <textarea
                                    value={systemPrompt}
                                    onChange={e => setSystemPrompt(e.target.value)}
                                    className='notion-chat-textarea'
                                    rows={8}
                                    placeholder="Enter system prompt..."
                                />
                                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setMessages([])}
                                        className='notion-chat-clear-btn'
                                        style={{ flex: 1 }}
                                    >
                                        Clear History
                                    </button>
                                    <button
                                        onClick={() => setIsMobileSettingsOpen(false)}
                                        className='notion-action-btn notion-action-primary'
                                        style={{ flex: 1 }}
                                    >
                                        Done
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
