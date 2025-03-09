'use client';

import { strings } from '../../constants/strings';
import { useState, useRef, useEffect } from 'react';

type Message = {
    content: string;
    isUser: boolean;
};

type Particle = {
    id: number;
    width: string;
    height: string;
    backgroundColor: string;
    boxShadow: string;
    left: string;
    top: string;
    animationDuration: string;
    animationDelay: string;
};

export default function Resume() {
    const [messages, setMessages] = useState<Message[]>([
        {
            content: "hey! i'm John's personal AI. ask me anything about his experience, skills, or background!",
            isUser: false,
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        setIsLoaded(true);

        // Generate particles once on component mount
        const newParticles = Array.from({ length: 8 }, (_, i) => {
            return {
                id: i,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: `rgba(${150 + Math.random() * 100}, ${150 + Math.random() * 100}, ${
                    200 + Math.random() * 55
                }, ${0.3 + Math.random() * 0.3})`,
                boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(${150 + Math.random() * 100}, ${
                    150 + Math.random() * 100
                }, ${200 + Math.random() * 55}, 0.3)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
            };
        });

        setParticles(newParticles);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message to the conversation
        const updatedMessages = [...messages, { content: userMessage, isUser: true }];
        setMessages(updatedMessages);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ messages: updatedMessages }),
            });
            const data = await response.json();
            setMessages([...updatedMessages, { content: data.message, isUser: false }]);
        } catch (error) {
            console.error(error);
            setMessages([
                ...updatedMessages,
                { content: "Sorry, I'm having trouble connecting right now.", isUser: false },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-[color:var(--background)] overflow-hidden orbital-grid'>
            {/* Background gradient effects */}
            <div className='fixed inset-0 bg-[color:var(--background)] z-[-2]' />
            <div
                className='fixed top-[-50%] left-[-20%] w-[140%] h-[140%] z-[-1] opacity-30 animate-spin-slow'
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(94, 106, 210, 0.1) 0%, transparent 70%)',
                    transformOrigin: 'center center',
                    animationDuration: '120s',
                }}
            />

            {/* Header */}
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-[color:var(--foreground)] text-opacity-70 text-sm sm:text-base'>
                    <a href='/apps' className='linear-link'>
                        Apps
                    </a>
                    <a href='/' className='linear-link'>
                        Home
                    </a>
                    <a href={`mailto:${strings.EMAIL}`} className='linear-link'>
                        Email
                    </a>
                    <a href={strings.LINKEDIN_URL} target='_blank' rel='noopener noreferrer' className='linear-link'>
                        LinkedIn
                    </a>
                    <a href={strings.GITHUB_URL} target='_blank' rel='noopener noreferrer' className='linear-link'>
                        GitHub
                    </a>
                </nav>
            </header>

            <main
                className={`flex-1 flex flex-col max-w-3xl mx-auto w-full h-screen pt-24 px-4 transition-opacity duration-700 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className='mb-6'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-center'>
                        <span className='gradient-text'>Chat with John's AI</span>
                    </h1>
                </div>

                <div className='flex-1 space-y-4 overflow-auto glass-card p-4 rounded-xl mb-4'>
                    {messages.map((message, i) => (
                        <div
                            key={i}
                            className={`flex ${
                                message.isUser ? 'justify-end' : 'justify-start'
                            } transition-all duration-300`}
                        >
                            <div
                                className={`
                                    max-w-[80%] p-3 sm:p-4 rounded-xl sm:rounded-2xl text-sm sm:text-base
                                    ${
                                        message.isUser
                                            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-orbital-glow-sm'
                                            : 'bg-[color:var(--secondary)] border border-[color:var(--border)] text-[color:var(--foreground)]'
                                    }
                                    transition-all duration-300 hover:shadow-orbital-glow-sm
                                `}
                            >
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className='flex justify-start'>
                            <div className='max-w-[80%] p-3 sm:p-4 rounded-xl sm:rounded-2xl text-sm sm:text-base bg-[color:var(--secondary)] border border-[color:var(--border)] text-[color:var(--foreground)] animate-pulse-slow'>
                                <p>thinking...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className='mb-6'>
                    <form onSubmit={handleSubmit} className='relative'>
                        <input
                            type='text'
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder='Ask me anything...'
                            className='w-full p-3 sm:p-4 pr-24 rounded-lg sm:rounded-xl 
                                     bg-[color:var(--secondary)] border border-[color:var(--border)]
                                     text-sm sm:text-base text-[color:var(--foreground)]
                                     placeholder:text-[color:var(--foreground)] placeholder:text-opacity-50 
                                     focus:outline-none focus:border-[color:var(--primary)] focus:border-opacity-50
                                     transition-all duration-300'
                            disabled={isLoading}
                        />
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='absolute right-2 top-1/2 -translate-y-1/2 
                                     px-4 py-2 rounded-lg
                                     bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500
                                     text-white text-sm sm:text-base font-bold
                                     hover:shadow-orbital-glow-sm transition-all duration-300 disabled:opacity-50'
                        >
                            Send
                        </button>
                    </form>
                </div>

                {/* Floating particles for orbital effect */}
                <div className='fixed inset-0 pointer-events-none'>
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className='absolute rounded-full animate-float'
                            style={{
                                width: particle.width,
                                height: particle.height,
                                backgroundColor: particle.backgroundColor,
                                boxShadow: particle.boxShadow,
                                left: particle.left,
                                top: particle.top,
                                animationDuration: particle.animationDuration,
                                animationDelay: particle.animationDelay,
                            }}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
