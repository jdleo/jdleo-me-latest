'use client';

import { strings } from '../../constants/strings';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';

type Message = {
    content: string;
    isUser: boolean;
    model?: string;
};

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedModel, setSelectedModel] = useState('openai/gpt-oss-120b');
    const [streamingMessage, setStreamingMessage] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Apps', href: '/apps' },
        { label: 'AI Chat', href: '/apps/chat' },
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

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        sendMessage(userMessage);
    };

    const clearMessages = () => {
        setMessages([]);
        setShowWelcome(true);
        setStreamingMessage('');
    };

    const sendMessage = async (message: string) => {
        setInput('');

        // Hide welcome message on first user message
        setShowWelcome(false);

        // Add user message to the conversation
        const updatedMessages = [...messages, { content: message, isUser: true }];
        setMessages(updatedMessages);
        setIsLoading(true);
        setStreamingMessage('');

        try {
            // Keep only last 10 messages for API context (to manage token usage)
            const apiMessages = updatedMessages.slice(-10);

            const response = await fetch('/api/chat-openrouter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    model: selectedModel,
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
                                            model: availableModels.find(m => m.id === selectedModel)?.name,
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

    const availableModels = [
        {
            id: 'openai/gpt-oss-120b',
            name: 'GPT-OSS 120B',
            description: "OpenAI's small but powerful model",
            icon: '/chatgpt.png',
        },

        {
            id: 'anthropic/claude-sonnet-4',
            name: 'Claude Sonnet 4',
            description: "Anthropic's latest flagship model",
            icon: '/claude.png',
        },
        {
            id: 'openai/gpt-5-chat',
            name: 'GPT-5 Chat',
            description: "OpenAI's newest generation",
            icon: '/chatgpt.png',
        },
        { id: 'x-ai/grok-4', name: 'Grok 4', description: "xAI's advanced reasoning model", icon: '/grok.png' },
        {
            id: 'google/gemini-2.5-pro',
            name: 'Gemini 2.5 Pro',
            description: "Google's enhanced multimodal AI",
            icon: '/gemini.png',
        },
        {
            id: 'meta-llama/llama-4-maverick',
            name: 'Llama 4 Maverick',
            description: "Meta's cutting-edge model",
            icon: '/meta.png',
        },
        {
            id: 'amazon/nova-pro-v1',
            name: 'Nova Pro V1',
            description: "Amazon's professional AI model",
            icon: '/amazon_nova.png',
        },
    ];

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

            {/* Navigation Bar */}
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
                        <h1 className='text-h1 gradient-text mb-4'>AI Chat</h1>
                        <p className='text-body opacity-80'>
                            Chat with multiple AI models for free. Compare responses and find your perfect AI assistant.
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
                            {/* Header with Model Selection and Clear Button */}
                            <div className='p-4 md:p-6 pb-4 border-b border-gray-200 flex-shrink-0'>
                                <div className='flex items-center justify-between mb-3'>
                                    <h3 className='text-sm font-semibold text-[var(--color-text-dark)]'>AI Model</h3>
                                    <button
                                        onClick={clearMessages}
                                        className='text-xs px-3 py-1.5 rounded-lg glass-card-subtle border border-gray-200 hover:border-gray-300 transition-all duration-200 text-gray-600 hover:text-gray-800'
                                        disabled={isLoading}
                                    >
                                        🗑️ Clear Chat
                                    </button>
                                </div>
                                <div className='relative' ref={dropdownRef}>
                                    {/* Dropdown Button */}
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className='w-full glass-card-subtle border border-gray-200 hover:border-gray-300 p-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <Image
                                                src={
                                                    availableModels.find(m => m.id === selectedModel)?.icon ||
                                                    '/chatgpt.png'
                                                }
                                                alt={availableModels.find(m => m.id === selectedModel)?.name || 'AI'}
                                                width={20}
                                                height={20}
                                                className='rounded-sm'
                                            />
                                            <div>
                                                <div className='font-medium text-sm'>
                                                    {availableModels.find(m => m.id === selectedModel)?.name}
                                                </div>
                                                <div className='text-xs opacity-70'>
                                                    {availableModels.find(m => m.id === selectedModel)?.description}
                                                </div>
                                            </div>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${
                                                isDropdownOpen ? 'rotate-180' : ''
                                            }`}
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M19 9l-7 7-7-7'
                                            />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className='absolute top-full left-0 right-0 mt-2 glass-card border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto'>
                                            {availableModels.map(model => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => {
                                                        setSelectedModel(model.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full p-3 text-left hover:bg-gray-50 transition-all duration-200 flex items-center gap-3 ${
                                                        selectedModel === model.id
                                                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                                            : ''
                                                    } ${model === availableModels[0] ? 'rounded-t-xl' : ''} ${
                                                        model === availableModels[availableModels.length - 1]
                                                            ? 'rounded-b-xl'
                                                            : ''
                                                    }`}
                                                >
                                                    <Image
                                                        src={model.icon}
                                                        alt={model.name}
                                                        width={20}
                                                        height={20}
                                                        className='rounded-sm'
                                                    />
                                                    <div className='flex-1'>
                                                        <div className='font-medium text-sm'>{model.name}</div>
                                                        <div className='text-xs opacity-70 leading-tight'>
                                                            {model.description}
                                                        </div>
                                                    </div>
                                                    {selectedModel === model.id && (
                                                        <svg
                                                            className='w-4 h-4 text-blue-500'
                                                            fill='currentColor'
                                                            viewBox='0 0 20 20'
                                                        >
                                                            <path
                                                                fillRule='evenodd'
                                                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                                clipRule='evenodd'
                                                            />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable Messages Container */}
                            <div className='flex-1 overflow-y-auto p-4 md:p-6 pt-4'>
                                <div className='space-y-4'>
                                    {/* Welcome Message - UI Only */}
                                    {showWelcome && (
                                        <div className='flex justify-start'>
                                            <div className='max-w-[85%] md:max-w-[75%] mr-4'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <div className='w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center'>
                                                        <span className='text-white text-xs font-bold'>AI</span>
                                                    </div>
                                                    <span className='text-small opacity-60'>Assistant</span>
                                                </div>
                                                <div className='glass-card-subtle border border-gray-200 p-3 md:p-4 rounded-2xl text-body leading-relaxed'>
                                                    <p>
                                                        Welcome to my AI chat! Choose from multiple AI models and start
                                                        chatting. Pro tip: GPT 120B is the fastest, and still
                                                        intelligent. Claude 4 is my personal favorite for complex tasks.
                                                        This is completely free, and responses/chats are NEVER
                                                        saved/logged whatsoever.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                                        {message.model &&
                                                        availableModels.find(m => m.name === message.model) ? (
                                                            <Image
                                                                src={
                                                                    availableModels.find(m => m.name === message.model)!
                                                                        .icon
                                                                }
                                                                alt={message.model}
                                                                width={24}
                                                                height={24}
                                                                className='rounded-full'
                                                            />
                                                        ) : (
                                                            <div className='w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center'>
                                                                <span className='text-white text-xs font-bold'>AI</span>
                                                            </div>
                                                        )}
                                                        <span className='text-small opacity-60'>
                                                            {message.model || 'Assistant'}
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
                                                            <ReactMarkdown>{message.content}</ReactMarkdown>
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
                                    {showWelcome && messages.length === 0 && !isLoading && !streamingMessage && (
                                        <div className='flex flex-col gap-3 mt-6'>
                                            <p className='text-small opacity-60 text-center mb-2'>Try asking:</p>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                                <button
                                                    onClick={() =>
                                                        sendMessage('Explain quantum computing in simple terms')
                                                    }
                                                    className='glass-card-subtle hover:glass-card border border-gray-200 p-4 rounded-xl text-left text-body transition-all duration-200 hover:-translate-y-0.5'
                                                >
                                                    <div className='font-medium mb-1'>Explain quantum computing</div>
                                                    <div className='text-sm opacity-70'>
                                                        Get a clear explanation of complex topics
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        sendMessage(
                                                            'Write a Python function that sorts a list of dictionaries by a specific key'
                                                        )
                                                    }
                                                    className='glass-card-subtle hover:glass-card border border-gray-200 p-4 rounded-xl text-left text-body transition-all duration-200 hover:-translate-y-0.5'
                                                >
                                                    <div className='font-medium mb-1'>Write a Python function</div>
                                                    <div className='text-sm opacity-70'>Get help with coding tasks</div>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        sendMessage(
                                                            'Help me plan a weekend trip to a nearby city with recommendations for activities'
                                                        )
                                                    }
                                                    className='glass-card-subtle hover:glass-card border border-gray-200 p-4 rounded-xl text-left text-body transition-all duration-200 hover:-translate-y-0.5'
                                                >
                                                    <div className='font-medium mb-1'>Plan a weekend trip</div>
                                                    <div className='text-sm opacity-70'>
                                                        Get personalized recommendations
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        sendMessage(
                                                            'Compare the pros and cons of React vs Vue.js for a new project'
                                                        )
                                                    }
                                                    className='glass-card-subtle hover:glass-card border border-gray-200 p-4 rounded-xl text-left text-body transition-all duration-200 hover:-translate-y-0.5'
                                                >
                                                    <div className='font-medium mb-1'>Compare different approaches</div>
                                                    <div className='text-sm opacity-70'>Analyze pros and cons</div>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Streaming Message */}
                                    {streamingMessage && (
                                        <div className='flex justify-start'>
                                            <div className='max-w-[85%] md:max-w-[75%] mr-4'>
                                                <div className='flex items-center gap-2 mb-2'>
                                                    <Image
                                                        src={
                                                            availableModels.find(m => m.id === selectedModel)?.icon ||
                                                            '/claude.png'
                                                        }
                                                        alt={
                                                            availableModels.find(m => m.id === selectedModel)?.name ||
                                                            'AI'
                                                        }
                                                        width={24}
                                                        height={24}
                                                        className='rounded-full'
                                                    />
                                                    <span className='text-small opacity-60'>
                                                        {availableModels.find(m => m.id === selectedModel)?.name ||
                                                            'Assistant'}
                                                    </span>
                                                </div>
                                                <div className='glass-card-subtle border border-gray-200 p-3 md:p-4 rounded-2xl'>
                                                    <div className='prose prose-sm max-w-none text-body leading-relaxed'>
                                                        <ReactMarkdown>{streamingMessage}</ReactMarkdown>
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
                                                    <Image
                                                        src={
                                                            availableModels.find(m => m.id === selectedModel)?.icon ||
                                                            '/claude.png'
                                                        }
                                                        alt={
                                                            availableModels.find(m => m.id === selectedModel)?.name ||
                                                            'AI'
                                                        }
                                                        width={24}
                                                        height={24}
                                                        className='rounded-full'
                                                    />
                                                    <span className='text-small opacity-60'>
                                                        {availableModels.find(m => m.id === selectedModel)?.name ||
                                                            'Assistant'}
                                                    </span>
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
                                    placeholder={`Ask ${
                                        availableModels.find(m => m.id === selectedModel)?.name || 'AI'
                                    } anything...`}
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
