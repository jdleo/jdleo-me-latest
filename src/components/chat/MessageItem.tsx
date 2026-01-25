import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';

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
        <div className={`notion-chat-message-wrapper ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`notion-chat-message ${message.isUser ? 'notion-chat-message-user' : 'notion-chat-message-ai'}`}>
                {!message.isUser && message.model && (
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(55, 53, 47, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{message.model}</span>
                        {message.usage && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'rgba(55, 53, 47, 0.3)' }}>
                                <span>{message.usage.response_time_ms}ms</span>
                                <span>{message.usage.tokens_per_second?.toFixed(1)} tok/s</span>
                            </div>
                        )}
                    </div>
                )}
                <div className='notion-blog-content'>
                    {message.isUser ? (
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{message.content}</p>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                code: CodeBlock as any,
                                table: ({ children }) => <div className="table-wrapper"><table>{children}</table></div>,
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
