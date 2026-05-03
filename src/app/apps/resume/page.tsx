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
import { ArrowLeftIcon, ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

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

            const response = await fetch('/api/chat-openrouter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    model: 'anthropic/claude-sonnet-4.6',
                    promptVariant: 'resume',
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
            <main className='resend-home resend-app-runtime is-loaded'>
                <header className='resend-nav-wrap resend-app-runtime-nav'>
                    <Link href='/apps' className='resend-back-link'>
                        <ArrowLeftIcon aria-hidden='true' />
                        <span className='hidden sm:inline'>Back to Apps</span>
                        <span className='sm:hidden'>Apps</span>
                    </Link>
                    <nav className='resend-nav' aria-label='Resume app navigation'>
                        <Link href='/' className='resend-nav-link'>
                            Home
                        </Link>
                        <Link href='/blog' className='resend-nav-link'>
                            Blog
                        </Link>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer' className='resend-nav-link'>
                            GitHub
                        </a>
                    </nav>
                    <div className='resend-nav-actions'>
                        <button
                            onClick={() => setIsMobileSuggestionsOpen(true)}
                            className='md:hidden resend-runtime-suggestions-btn'
                        >
                            Suggestions
                            <ChevronDownIcon aria-hidden='true' />
                        </button>
                        <a href={`mailto:${strings.EMAIL}`} className='resend-top-cta'>
                            Contact
                        </a>
                    </div>
                </header>

                <div className='resend-runtime-layout'>
                    <aside className='hidden md:flex resend-runtime-sidebar'>
                        <div className='resend-runtime-sidebar-main'>
                            <div className='resend-runtime-eyebrow'>Suggested Questions</div>
                            <div className='resend-runtime-question-list'>
                                {suggestedQueries.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className='resend-runtime-question'
                                    >
                                        <QuestionMarkCircleIcon aria-hidden='true' />
                                        <span>{q}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='resend-runtime-sidebar-footer'>
                            <button
                                onClick={() => { setMessages([]); setShowWelcome(true); }}
                                className='notion-chat-clear-btn'
                            >
                                Clear Conversation
                            </button>
                        </div>
                    </aside>

                    <div className='resend-runtime-chat'>
                        <div className='resend-runtime-scroll scrollbar-hide'>
                            {showWelcome && (
                                <div className='resend-runtime-welcome'>
                                    <div>
                                        <p className='resend-runtime-kicker'>Chat w/ John</p>
                                        <h1>Hi! I know everything about John.</h1>
                                        <p>Ask me anything about his experience, skills, projects, or background.</p>
                                    </div>
                                    <div className='resend-runtime-suggestion-grid'>
                                        {suggestedQueries.slice(0, 4).map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => sendMessage(q)}
                                                className='resend-runtime-suggestion'
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
                                        <div className='resend-runtime-message-label'>
                                            Thinking...
                                        </div>
                                        <div className='notion-blog-content resend-prose'>
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

                        <div className='resend-runtime-input'>
                            <ChatInput
                                onSend={sendMessage}
                                isLoading={isLoading}
                                placeholder='Ask about John...'
                            />
                        </div>
                    </div>
                </div>

                {isMobileSuggestionsOpen && (
                    <div className='notion-mobile-overlay resend-runtime-overlay' onClick={() => setIsMobileSuggestionsOpen(false)}>
                        <div className='notion-mobile-panel resend-runtime-panel' onClick={e => e.stopPropagation()}>
                            <div className='notion-mobile-panel-header resend-runtime-panel-header'>
                                <span>Suggested Questions</span>
                                <button onClick={() => setIsMobileSuggestionsOpen(false)} className='notion-mobile-close'>✕</button>
                            </div>
                            <div className='resend-runtime-panel-body'>
                                {suggestedQueries.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className='resend-runtime-question'
                                    >
                                        <QuestionMarkCircleIcon aria-hidden='true' />
                                        <span>{q}</span>
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
