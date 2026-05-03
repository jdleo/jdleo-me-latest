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
        { id: 'anthropic/claude-sonnet-4.6', name: 'Claude 4.6 Sonnet', description: "Flagship", icon: '/claude.png' },
        { id: 'openai/gpt-5.5', name: 'GPT 5.5', description: "Newest gen", icon: '/chatgpt.png' },
        { id: 'openai/gpt-5.4-nano', name: 'GPT 5.4 Nano', description: 'Compact reasoning', icon: '/chatgpt.png' },
        { id: 'google/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', description: "Google Enhanced", icon: '/gemini.png' },
        { id: 'google/gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite', description: "Fast & Efficient", icon: '/gemini.png' },
        { id: 'x-ai/grok-4.20', name: 'Grok 4.20', description: "Advanced reasoning", icon: '/grok.png' },
    ];

    const currentModel = availableModels.find(m => m.id === selectedModel);

    return (
        <>
            <WebVitals />
            <main className={`resend-home resend-app-runtime ${isLoaded ? 'is-loaded' : ''}`}>
                <header className='resend-nav-wrap resend-app-runtime-nav'>
                    <Link href='/apps' className='resend-logo resend-back-logo'>
                        <ArrowLeftIcon />
                        <span>Apps</span>
                    </Link>
                    <nav className='resend-nav' aria-label='Primary navigation'>
                        <Link href='/' className='resend-nav-link'>Home</Link>
                        <Link href='/blog' className='resend-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='resend-nav-link'>Resume</Link>
                    </nav>
                    <div className='resend-nav-actions'>
                        <button
                            onClick={() => setIsMobileModelSelectorOpen(true)}
                            className='resend-runtime-suggestions-btn md:hidden'
                        >
                            <span>{currentModel?.name.split(' ')[0]}</span>
                            <ChevronDownIcon />
                        </button>
                        <button
                            onClick={() => setIsMobileSettingsOpen(true)}
                            className='resend-runtime-icon-btn md:hidden'
                            aria-label='Open chat settings'
                        >
                            <Cog6ToothIcon />
                        </button>
                        <Link href='/' className='resend-top-cta'>John Leonardo</Link>
                    </div>
                </header>

                <div className='resend-runtime-layout'>
                    <aside className='hidden md:flex resend-runtime-sidebar resend-runtime-sidebar-wide'>
                        <div className='resend-runtime-sidebar-main'>
                            <div className='resend-runtime-eyebrow'>Select Model</div>
                            <div className='resend-runtime-question-list'>
                                {availableModels.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedModel(m.id)}
                                        className={`resend-runtime-question resend-runtime-model-option ${selectedModel === m.id ? 'is-selected' : ''}`}
                                    >
                                        <Image src={m.icon} alt={m.name} width={20} height={20} className='object-contain' />
                                        <span>
                                            <strong>{m.name}</strong>
                                            <small>{m.description}</small>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='resend-runtime-system'>
                            <div className='resend-runtime-eyebrow'>System Prompt</div>
                            <textarea
                                value={systemPrompt}
                                onChange={e => setSystemPrompt(e.target.value)}
                                className='notion-chat-textarea'
                                rows={8}
                                placeholder='Enter system prompt...'
                            />
                        </div>

                        <div className='resend-runtime-sidebar-footer'>
                            <button onClick={() => setMessages([])} className='notion-chat-clear-btn'>
                                Clear History
                            </button>
                        </div>
                    </aside>

                    <section className='resend-runtime-chat'>
                        <div className='resend-runtime-scroll scrollbar-hide'>
                            {showWelcome && (
                                <div className='resend-runtime-welcome resend-chat-welcome'>
                                    <div>
                                        <p className='resend-runtime-kicker'>AI Chat</p>
                                        <h1>Feel free to chat and ask anything.</h1>
                                        <p>
                                            Your chats are <strong>never saved</strong> anywhere. This is totally free for now, so have fun.
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
                                        <div className='resend-runtime-message-label'>Thinking...</div>
                                        <div className='notion-blog-content'>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    code: CodeBlock as any,
                                                    table: ({ children }) => <div className='table-wrapper'><table>{children}</table></div>,
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

                        <div className='resend-runtime-input'>
                            <ChatInput
                                onSend={sendMessage}
                                isLoading={isLoading}
                                modelName={currentModel?.name}
                            />
                        </div>
                    </section>
                </div>

                {isMobileModelSelectorOpen && (
                    <div className='notion-mobile-overlay' onClick={() => setIsMobileModelSelectorOpen(false)}>
                        <div className='notion-mobile-panel resend-runtime-panel' onClick={e => e.stopPropagation()}>
                            <div className='notion-mobile-panel-header resend-runtime-panel-header'>
                                <span>Select Model</span>
                                <button onClick={() => setIsMobileModelSelectorOpen(false)} className='notion-mobile-close'>x</button>
                            </div>
                            <div className='resend-runtime-panel-body'>
                                {availableModels.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setSelectedModel(m.id);
                                            setIsMobileModelSelectorOpen(false);
                                        }}
                                        className={`resend-runtime-question resend-runtime-model-option ${selectedModel === m.id ? 'is-selected' : ''}`}
                                    >
                                        <Image src={m.icon} alt={m.name} width={20} height={20} className='object-contain' />
                                        <span>
                                            <strong>{m.name}</strong>
                                            <small>{m.description}</small>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {isMobileSettingsOpen && (
                    <div className='notion-mobile-overlay' onClick={() => setIsMobileSettingsOpen(false)}>
                        <div className='notion-mobile-panel resend-runtime-panel' onClick={e => e.stopPropagation()}>
                            <div className='notion-mobile-panel-header resend-runtime-panel-header'>
                                <span>System Prompt</span>
                                <button onClick={() => setIsMobileSettingsOpen(false)} className='notion-mobile-close'>x</button>
                            </div>
                            <div className='resend-runtime-panel-body resend-runtime-settings-body'>
                                <textarea
                                    value={systemPrompt}
                                    onChange={e => setSystemPrompt(e.target.value)}
                                    className='notion-chat-textarea'
                                    rows={8}
                                    placeholder='Enter system prompt...'
                                />
                                <div className='resend-runtime-settings-actions'>
                                    <button onClick={() => setMessages([])} className='notion-chat-clear-btn'>
                                        Clear History
                                    </button>
                                    <button onClick={() => setIsMobileSettingsOpen(false)} className='resend-action-btn'>
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
