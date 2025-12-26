import { useState } from 'react';

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
            <form onSubmit={handleSubmit} className='relative group'>
                <input
                    type='text'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={placeholder}
                    className='w-full bg-white border border-[var(--border-light)] rounded-full pl-6 pr-14 py-4 shadow-sm focus:shadow-lg focus:border-[var(--purple-4)] outline-none transition-all text-sm font-medium text-[var(--fg-4)] placeholder:text-muted/60'
                    disabled={isLoading}
                    autoFocus
                />
                <button
                    type='submit'
                    disabled={isLoading || !input.trim()}
                    className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--fg-4)] hover:bg-[var(--purple-4)] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-[var(--fg-4)] shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                >
                    {isLoading ? (
                        <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    ) : (
                        <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M5 12h14M12 5l7 7-7 7' />
                        </svg>
                    )}
                </button>
            </form>
            {modelName && (
                <div className='text-center mt-3'>
                    <span className='text-[10px] text-muted font-medium opacity-60 uppercase tracking-widest'>
                        Powered by {modelName}
                    </span>
                </div>
            )}
        </div>
    );
}
