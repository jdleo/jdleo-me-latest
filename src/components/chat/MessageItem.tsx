import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';
import Image from 'next/image';

export type Message = {
    content: string;
    isUser: boolean;
    model?: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        tokens_per_second?: number;
        estimated_cost?: number;
        response_time_ms?: number;
    };
};

interface MessageItemProps {
    message: Message;
}

const MessageItem = memo(({ message }: MessageItemProps) => {
    return (
        <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div className={`max-w-[90%] md:max-w-3xl ${message.isUser
                ? 'bg-[var(--fg-4)] text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg'
                : 'bg-white rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm border border-[var(--border-light)]'
                }`}>
                {!message.isUser && (
                    <div className='flex items-center gap-2 mb-3 pb-3 border-b border-gray-100'>
                        <span className='text-[10px] font-bold uppercase tracking-widest text-[var(--purple-4)]'>
                            {message.model || 'AI Assistant'}
                        </span>
                        {message.usage && (
                            <div className='flex items-center gap-3 text-[10px] text-muted opacity-60 font-medium'>
                                <span>{message.usage.response_time_ms}ms</span>
                                <span>{message.usage.tokens_per_second?.toFixed(1)} tok/s</span>
                                <span>${message.usage.estimated_cost?.toFixed(5)}</span>
                            </div>
                        )}
                    </div>
                )}
                <div className={`prose prose-sm max-w-none ${message.isUser ? 'prose-invert' : 'blog-content'}`}>
                    {message.isUser ? (
                        <p className='whitespace-pre-wrap leading-relaxed'>{message.content}</p>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code: CodeBlock as any,
                                table: ({ children }) => <div className="table-wrapper"><table className="w-full">{children}</table></div>,
                                thead: ({ children }) => <thead className="bg-[var(--gray-1)]">{children}</thead>,
                                th: ({ children }) => <th className="p-3 text-left font-bold text-xs uppercase tracking-wider text-[var(--fg-4)] border-b border-[var(--border-light)]">{children}</th>,
                                td: ({ children }) => <td className="p-3 border-b border-[var(--border-light)] text-sm">{children}</td>,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>
            </div>
        </div>
    );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
