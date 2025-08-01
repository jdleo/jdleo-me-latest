'use client';

import { strings } from '../../constants/strings';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type Message = {
    content: string;
    isUser: boolean;
};

export default function Resume() {
    const [messages, setMessages] = useState<Message[]>([
        {
            content:
                "Hey! I'm John's personal AI assistant. Ask me anything about his experience, skills, projects, or background!",
            isUser: false,
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: updatedMessages }),
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
                                    setMessages([...updatedMessages, { content: accumulatedContent, isUser: false }]);
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

            <main className='main-content h-screen flex flex-col'>
                <div className='container-responsive flex-1 flex flex-col max-w-4xl'>
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
                        <div className='flex-1 glass-card-enhanced p-4 md:p-6 mb-4 overflow-auto'>
                            <div className='space-y-4'>
                                {messages.map((message, i) => (
                                    <div key={i} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[85%] md:max-w-[75%] ${message.isUser ? 'ml-4' : 'mr-4'}`}
                                        >
                                            {!message.isUser && (
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <div className='w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
                                                        <span className='text-white text-xs font-bold'>AI</span>
                                                    </div>
                                                    <span className='text-small opacity-60'>John's Assistant</span>
                                                </div>
                                            )}
                                            <div
                                                className={`p-3 md:p-4 rounded-2xl text-body leading-relaxed ${
                                                    message.isUser
                                                        ? 'bg-[var(--color-text-dark)] text-[var(--color-bg-light)] border border-gray-300'
                                                        : 'glass-card-subtle border border-gray-200'
                                                }`}
                                            >
                                                <p>{message.content}</p>
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
                                                onClick={() => sendMessage('What stacks does he have experience with?')}
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
                                                <div className='w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
                                                    <span className='text-white text-xs font-bold'>AI</span>
                                                </div>
                                                <span className='text-small opacity-60'>John's Assistant</span>
                                            </div>
                                            <div className='glass-card-subtle border border-gray-200 p-3 md:p-4 rounded-2xl'>
                                                <p className='text-body leading-relaxed'>
                                                    {streamingMessage}
                                                    <span className='inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse'></span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isLoading && !streamingMessage && (
                                    <div className='flex justify-start'>
                                        <div className='max-w-[85%] md:max-w-[75%] mr-4'>
                                            <div className='flex items-center gap-2 mb-2'>
                                                <div className='w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
                                                    <span className='text-white text-xs font-bold'>AI</span>
                                                </div>
                                                <span className='text-small opacity-60'>John's Assistant</span>
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

                        {/* Input Area */}
                        <div className={`animate-reveal animate-reveal-delay-2 ${isLoaded ? '' : 'opacity-0'}`}>
                            <form onSubmit={handleSubmit} className='glass-card p-4 flex gap-3'>
                                <input
                                    type='text'
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder='Ask me anything about John...'
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
