'use client';

import { strings } from '../../constants/strings';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';

type Message = {
    content: string;
    isUser: boolean;
    model?: string;
};

// Custom code component with syntax highlighting and language labels
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    return !inline && match ? (
        <div className='relative rounded-lg overflow-hidden bg-gray-900 my-4'>
            {/* Language label */}
            {language && (
                <div className='flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700'>
                    <span className='text-xs font-mono text-gray-300 uppercase tracking-wide'>{language}</span>
                    <button
                        onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                        className='text-xs text-gray-400 hover:text-gray-200 transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-700'
                        title='Copy code'
                    >
                        📋 Copy
                    </button>
                </div>
            )}
            <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag='div'
                customStyle={{
                    margin: 0,
                    borderRadius: language ? '0 0 0.5rem 0.5rem' : '0.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                }}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className='bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono' {...props}>
            {children}
        </code>
    );
};

export default function Resume() {
    const [messages, setMessages] = useState<Message[]>([
        {
            content:
                "Hey! I'm John's personal AI assistant. Ask me anything about his experience, skills, projects, or background!",
            isUser: false,
            model: "John's Resume AI",
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Apps', href: '/apps' },
        { label: 'Resume Chat', href: '/apps/resume' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, streamingMessage]);

    useEffect(() => {
        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        sendMessage(userMessage);
    };

    const sendMessage = async (message: string) => {
        setInput('');

        // Add user message to the conversation
        const updatedMessages = [...messages, { content: message, isUser: true }];
        setMessages(updatedMessages);
        setIsLoading(true);
        setStreamingMessage('');

        try {
            // Keep only last 10 messages for API context (to manage token usage)
            const apiMessages = updatedMessages.slice(-10);

            // Get the resume system prompt from the server
            const systemPromptResponse = await fetch('/api/resume-prompt');
            const { systemPrompt: resumeSystemPrompt } = await systemPromptResponse.json();

            const response = await fetch('/api/chat-openrouter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    model: 'openai/gpt-5-chat',
                    systemPrompt: resumeSystemPrompt,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

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
                                } else if (data.type === 'done') {
                                    // Finalize the message
                                    setMessages([
                                        ...updatedMessages,
                                        {
                                            content: accumulatedContent,
                                            isUser: false,
                                            model: "John's Resume AI",
                                        },
                                    ]);
                                    setStreamingMessage('');
                                    setIsLoading(false);
                                    return;
                                } else if (data.type === 'error') {
                                    throw new Error(data.error);
                                }
                            } catch (parseError) {
                                console.error('Error parsing chunk:', parseError);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Streaming error:', error);
            setMessages([
                ...updatedMessages,
                { content: "Sorry, I'm having trouble connecting right now. Please try again!", isUser: false },
            ]);
        } finally {
            setIsLoading(false);
            setStreamingMessage('');
        }
    };

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
            {/* Breadcrumbs for SEO */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* Subtle background gradients */}
            <div
                className='fixed inset-0 opacity-40 pointer-events-none'
                style={{
                    background:
                        'radial-gradient(ellipse at 30% 20%, rgba(94, 106, 210, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
                }}
            />

            {/* Strong Navigation Bar */}
            <nav className='nav-container'>
                <div className='nav-content'>
                    <Link href='/' className='nav-logo'>
                        JL
                    </Link>
                    <div className='nav-links'>
                        <Link href='/apps' className='nav-link'>
                            Apps
                        </Link>
                        <Link href='/' className='nav-link'>
                            Home
                        </Link>
                        <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            LinkedIn
                        </a>
                        <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='nav-link'>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            <main className='main-content flex flex-col' style={{ height: 'calc(100vh - 80px)' }}>
                <div className='container-responsive flex-1 flex flex-col max-w-6xl'>
                    {/* Hero Section */}
                    <section className={`text-center mb-6 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                        <h1 className='text-h1 gradient-text mb-4'>Chat with John's AI</h1>
                        <p className='text-body opacity-80'>
                            Ask about experience, skills, projects, or anything else!
                        </p>
                    </section>

                    {/* Chat Container */}
                    <div
                        className={`flex-1 flex flex-col min-h-0 animate-reveal animate-reveal-delay-1 ${
                            isLoaded ? '' : 'opacity-0'
                        }`}
                    >
                        {/* Messages Area */}
                        <div className='flex-1 glass-card-enhanced mb-4 flex flex-col overflow-hidden'>
                            {/* Scrollable Messages Container */}
                            <div className='flex-1 overflow-y-auto p-4 md:p-6 pt-4'>
                                <div className='space-y-4'>
                                    {messages.map((message, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] md:max-w-[75%] ${
                                                    message.isUser ? 'ml-4' : 'mr-4'
                                                }`}
                                            >
                                                {!message.isUser && (
                                                    <div className='flex items-center gap-2 mb-2'>
                                                        <div className='w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center'>
                                                            <span className='text-white text-xs font-bold'>AI</span>
                                                        </div>
                                                        <span className='text-small opacity-60'>
                                                            {message.model || "John's Assistant"}
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`p-3 md:p-4 rounded-2xl text-body leading-relaxed ${
                                                        message.isUser
                                                            ? 'bg-[var(--color-text-dark)] text-[var(--color-bg-light)] border border-gray-300'
                                                            : 'glass-card-subtle border border-gray-200'
                                                    }`}
                                                >
                                                    {message.isUser ? (
                                                        <p>{message.content}</p>
                                                    ) : (
                                                        <div className='prose prose-sm max-w-none'>
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm as any]}
                                                                rehypePlugins={[rehypeRaw as any]}
                                                                remarkRehypeOptions={{ passThrough: ['link'] }}
                                                                components={{
                                                                    code: CodeBlock,
                                                                }}
                                                            >
                                                                {message.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    )}
                                                </div>
                                                {message.isUser && (
                                                    <div className='flex justify-end mt-1'>
                                                        <span className='text-small opacity-60'>You</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Conversation Starters - Only show when no user messages */}
                                    {messages.length === 1 && !isLoading && !streamingMessage && (
                                        <div className='flex flex-col gap-3 mt-6'>
                                            <p className='text-small opacity-60 text-center mb-2'>Try asking:</p>
                                            <div className='flex flex-col gap-2'>
                                                <button
                                                    onClick={() => sendMessage("What's his work history?")}
                                                    className='glass-card-subtle hover:glass-card border border-gray-200 p-3 rounded-xl text-left text-body transition-all duration-200 hover:-translate-y-0.5'
                                                >
                                                    What's his work history?
                                                </button>
                                                <button
                                                    onClick={() => sendMessage('How much experience does he have?')}
                                                    className='glass-card-subtle hover:glass-card border border-gray-200 p-3 rounded-xl text-left text-body transition-all duration-200 hover:-translate-y-0.5'
                                                >
                                                    How much experience does he have?
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        sendMessage('What stacks does he have experience with?')
                                                    }
                                                    className='glass-card-subtle hover:glass-card border border-gray-200 p-3 rounded-xl text-left text-body transition-all duration-200 hover:-translate-y-0.5'
                                                >
                                                    What stacks does he have experience with?
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Streaming Message */}
                                    {streamingMessage && (
                                        <div className='flex justify-start'>
                                            <div className='max-w-[85%] md:max-w-[75%] mr-4'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <div className='w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center'>
                                                        <span className='text-white text-xs font-bold'>AI</span>
                                                    </div>
                                                    <span className='text-small opacity-60'>John's Resume AI</span>
                                                </div>
                                                <div className='glass-card-subtle border border-gray-200 p-3 md:p-4 rounded-2xl'>
                                                    <div className='prose prose-sm max-w-none text-body leading-relaxed'>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm as any]}
                                                            rehypePlugins={[rehypeRaw as any]}
                                                            remarkRehypeOptions={{ passThrough: ['link'] }}
                                                            components={{
                                                                code: CodeBlock,
                                                            }}
                                                        >
                                                            {streamingMessage}
                                                        </ReactMarkdown>
                                                        <span className='inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse'></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Loading State */}
                                    {isLoading && !streamingMessage && (
                                        <div className='flex justify-start'>
                                            <div className='max-w-[85%] md:max-w-[75%] mr-4'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <div className='w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center'>
                                                        <span className='text-white text-xs font-bold'>AI</span>
                                                    </div>
                                                    <span className='text-small opacity-60'>John's Resume AI</span>
                                                </div>
                                                <div className='glass-card-subtle border border-gray-200 p-3 md:p-4 rounded-2xl'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='flex gap-1'>
                                                            <div
                                                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                                                style={{ animationDelay: '0ms' }}
                                                            ></div>
                                                            <div
                                                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                                                style={{ animationDelay: '150ms' }}
                                                            ></div>
                                                            <div
                                                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                                                style={{ animationDelay: '300ms' }}
                                                            ></div>
                                                        </div>
                                                        <span className='text-body opacity-70'>Thinking...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className={`animate-reveal animate-reveal-delay-2 ${isLoaded ? '' : 'opacity-0'}`}>
                            <form onSubmit={handleSubmit} className='glass-card p-4 flex gap-3'>
                                <input
                                    type='text'
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Ask John's Resume AI anything about John..."
                                    className='flex-1 p-3 rounded-xl bg-white border border-gray-200 text-body placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                                    disabled={isLoading}
                                />
                                <button
                                    type='submit'
                                    disabled={isLoading || !input.trim()}
                                    className='button-primary disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    <span>Send</span>
                                    <svg
                                        width='16'
                                        height='16'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    >
                                        <path d='M22 2L11 13' />
                                        <path d='M22 2l-7 20-4-9-9-4 20-7z' />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
