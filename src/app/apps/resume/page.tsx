'use client';

import { strings } from '../../constants/strings';
import { useState, useRef, useEffect } from 'react';

type Message = {
    content: string;
    isUser: boolean;
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { content: userMessage, isUser: true }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ message: userMessage }),
            });
            const data = await response.json();
            setMessages(prev => [...prev, { content: data.message, isUser: false }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [
                ...prev,
                { content: "Sorry, I'm having trouble connecting right now.", isUser: false },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex min-h-screen bg-[#1d1d1d] overflow-hidden'>
            <header className='absolute top-0 right-0 p-4 sm:p-6'>
                <nav className='flex gap-4 sm:gap-6 text-white/70 font-nunito text-sm sm:text-base'>
                    <a href='/apps' className='hover:text-white transition-colors'>
                        Apps
                    </a>
                    <a href={`mailto:${strings.EMAIL}`} className='hover:text-white transition-colors'>
                        Email
                    </a>
                    <a
                        href={strings.LINKEDIN_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        LinkedIn
                    </a>
                    <a
                        href={strings.GITHUB_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:text-white transition-colors'
                    >
                        GitHub
                    </a>
                </nav>
            </header>

            <main className='flex-1 flex flex-col max-w-3xl mx-auto w-full h-screen pt-24'>
                <div className='flex-1 space-y-3 overflow-auto px-4'>
                    {messages.map((message, i) => (
                        <div key={i} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`
                                    max-w-[80%] p-3 sm:p-4 rounded-xl sm:rounded-2xl text-sm sm:text-base
                                    ${
                                        message.isUser
                                            ? 'bg-gradient-to-r from-purple-400/90 via-pink-400/90 to-blue-400/90 text-white backdrop-blur-sm'
                                            : 'bg-white/8 backdrop-blur-md border border-white/10 text-white/90'
                                    }
                                    shadow-lg hover:shadow-xl transition-all duration-300
                                `}
                            >
                                <p className='font-nunito'>{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className='flex justify-start'>
                            <div className='max-w-[80%] p-3 sm:p-4 rounded-xl sm:rounded-2xl text-sm sm:text-base bg-white/8 backdrop-blur-md border border-white/10 shadow-lg'>
                                <p className='font-nunito text-white/90'>thinking...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className='p-3 sm:p-4 border-t border-white/10 bg-[#1d1d1d]/95 backdrop-blur-md'>
                    <form onSubmit={handleSubmit} className='relative'>
                        <input
                            type='text'
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder='Ask me anything...'
                            className='w-full p-3 sm:p-4 pr-20 sm:pr-24 rounded-lg sm:rounded-xl 
                                     bg-white/5 backdrop-blur-sm border border-white/10 
                                     text-sm sm:text-base text-white font-nunito 
                                     placeholder:text-white/50 focus:outline-none focus:border-white/20
                                     shadow-lg'
                            disabled={isLoading}
                        />
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='absolute right-2 top-1/2 -translate-y-1/2 
                                     px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg
                                     bg-gradient-to-r from-purple-400/80 via-pink-400/80 to-blue-400/80
                                     text-white text-sm sm:text-base font-nunito font-bold
                                     hover:opacity-90 transition-opacity disabled:opacity-50
                                     backdrop-blur-sm shadow-lg'
                        >
                            Send
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
