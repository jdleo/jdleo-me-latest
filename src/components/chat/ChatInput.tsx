import { useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    placeholder?: string;
    modelName?: string;
}

export default function ChatInput({ onSend, isLoading, placeholder = 'Ask anything...', modelName }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    return (
        <div className='max-w-3xl mx-auto'>
            <form onSubmit={handleSubmit} className='relative'>
                <input
                    type='text'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className='notion-chat-input'
                    disabled={isLoading}
                    autoFocus
                />
                <button
                    type='submit'
                    disabled={isLoading || !input.trim()}
                    className='notion-chat-send-btn'
                >
                    {isLoading ? (
                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    ) : (
                        <PaperAirplaneIcon className='w-4 h-4' />
                    )}
                </button>
            </form>
            {modelName && (
                <div className='text-center mt-3'>
                    <span className='text-xs text-muted font-medium opacity-50'>
                        Powered by {modelName}
                    </span>
                </div>
            )}
        </div>
    );
}
