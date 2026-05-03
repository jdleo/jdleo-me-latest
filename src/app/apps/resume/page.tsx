'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';
import MessageItem, { Message } from '@/components/chat/MessageItem';
import ChatInput from '@/components/chat/ChatInput';
import { useBufferedStream } from '@/components/chat/useBufferedStream';
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

    useBufferedStream(streamBufferRef, isLoading, setStreamingMessage);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom(isLoading ? 'auto' : 'smooth');
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
            <main className='jd-home jd-app-runtime is-loaded'>
                <header className='jd-nav-wrap jd-app-runtime-nav'>
                    <Link href='/apps' className='jd-back-link'>
                        <ArrowLeftIcon aria-hidden='true' />
                        <span className='hidden sm:inline'>Back to Apps</span>
                        <span className='sm:hidden'>Apps</span>
                    </Link>
                    <nav className='jd-nav' aria-label='Resume app navigation'>
                        <Link href='/' className='jd-nav-link'>
                            Home
                        </Link>
                        <Link href='/blog' className='jd-nav-link'>
                            Blog
                        </Link>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer' className='jd-nav-link'>
                            GitHub
                        </a>
                    </nav>
                    <div className='jd-nav-actions'>
                        <button
                            onClick={() => setIsMobileSuggestionsOpen(true)}
                            className='md:hidden jd-runtime-suggestions-btn'
                        >
                            Suggestions
                            <ChevronDownIcon aria-hidden='true' />
                        </button>
                        <a href={`mailto:${strings.EMAIL}`} className='jd-top-cta'>
                            Contact
                        </a>
                    </div>
                </header>

                <div className='jd-runtime-layout'>
                    <aside className='hidden md:flex jd-runtime-sidebar'>
                        <div className='jd-runtime-sidebar-main'>
                            <div className='jd-runtime-eyebrow'>Suggested Questions</div>
                            <div className='jd-runtime-question-list'>
                                {suggestedQueries.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className='jd-runtime-question'
                                    >
                                        <QuestionMarkCircleIcon aria-hidden='true' />
                                        <span>{q}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='jd-runtime-sidebar-footer'>
                            <button
                                onClick={() => { setMessages([]); setShowWelcome(true); }}
                                className='notion-chat-clear-btn'
                            >
                                Clear Conversation
                            </button>
                        </div>
                    </aside>

                    <div className='jd-runtime-chat'>
                        <div className='jd-runtime-scroll scrollbar-hide'>
                            {showWelcome && (
                                <div className='jd-runtime-welcome'>
                                    <div>
                                        <p className='jd-runtime-kicker'>Chat w/ John</p>
                                        <h1>Hi! I know everything about John.</h1>
                                        <p>Ask me anything about his experience, skills, projects, or background.</p>
                                    </div>
                                    <div className='jd-runtime-suggestion-grid'>
                                        {suggestedQueries.slice(0, 4).map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => sendMessage(q)}
                                                className='jd-runtime-suggestion'
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
                                        <div className='jd-runtime-message-label'>
                                            Thinking...
                                        </div>
                                        <div className='notion-blog-content jd-prose'>
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

                        <div className='jd-runtime-input'>
                            <ChatInput
                                onSend={sendMessage}
                                isLoading={isLoading}
                                placeholder='Ask about John...'
                            />
                        </div>
                    </div>
                </div>

                {isMobileSuggestionsOpen && (
                    <div className='notion-mobile-overlay jd-runtime-overlay' onClick={() => setIsMobileSuggestionsOpen(false)}>
                        <div className='notion-mobile-panel jd-runtime-panel' onClick={e => e.stopPropagation()}>
                            <div className='notion-mobile-panel-header jd-runtime-panel-header'>
                                <span>Suggested Questions</span>
                                <button onClick={() => setIsMobileSuggestionsOpen(false)} className='notion-mobile-close'>✕</button>
                            </div>
                            <div className='jd-runtime-panel-body'>
                                {suggestedQueries.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className='jd-runtime-question'
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
