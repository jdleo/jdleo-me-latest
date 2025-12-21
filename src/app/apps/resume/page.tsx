'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { WebVitals } from '@/components/SEO/WebVitals';

type Message = {
    content: string;
    isUser: boolean;
    model?: string;
};

// Custom code component with syntax highlighting
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    return !inline && match ? (
        <div className='relative rounded-lg overflow-hidden bg-[#0D0D0E] border border-[var(--color-border)] my-4'>
            {language && (
                <div className='flex items-center justify-between px-4 py-1.5 bg-black/40 border-b border-[var(--color-border)]'>
                    <span className='text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider'>{language}</span>
                </div>
            )}
            <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag='div'
                customStyle={{
                    margin: 0,
                    background: 'transparent',
                    padding: '1rem',
                    fontSize: '0.8rem',
                    lineHeight: '1.5',
                }}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className='bg-white/5 text-[var(--color-accent-blue)] px-1.5 py-0.5 rounded text-sm font-mono' {...props}>
            {children}
        </code>
    );
};

export default function Resume() {
    const [messages, setMessages] = useState<Message[]>([
        {
            content: "Hey! I'm John's personal AI assistant. Ask me anything about his experience, skills, projects, or background!",
            isUser: false,
            model: "johns_resume_ai",
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
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const sendMessage = async (message: string) => {
        if (!message.trim() || isLoading) return;

        setInput('');
        const updatedMessages = [...messages, { content: message, isUser: true }];
        setMessages(updatedMessages);
        setIsLoading(true);
        setStreamingMessage('');

        try {
            const apiMessages = updatedMessages.slice(-10);
            const systemPromptResponse = await fetch('/api/resume-prompt');
            const { systemPrompt: resumeSystemPrompt } = await systemPromptResponse.json();

            const response = await fetch('/api/chat-openrouter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    model: 'openai/gpt-5.2-chat',
                    systemPrompt: resumeSystemPrompt,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

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
                                    setMessages([
                                        ...updatedMessages,
                                        {
                                            content: accumulatedContent,
                                            isUser: false,
                                            model: "johns_resume_ai",
                                        },
                                    ]);
                                    setStreamingMessage('');
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
        }
    };

    return (
        <>
            <WebVitals />
            <main className='min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 md:p-8 selection:bg-[var(--color-accent)] selection:text-[var(--color-bg)]'>
                <div className='fixed inset-0 overflow-hidden pointer-events-none'>
                    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(62,175,124,0.03),transparent_60%)]' />
                    <div className='absolute inset-0' style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className={`w-full max-w-6xl h-[85vh] transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className='terminal-window flex flex-col h-full'>
                        <div className='terminal-header'>
                            <div className='terminal-controls'>
                                <div className='terminal-control red' />
                                <div className='terminal-control yellow' />
                                <div className='terminal-control green' />
                            </div>
                            <div className='terminal-title'>johnleonardo — ~/resume-ai</div>
                        </div>

                        <div className='terminal-split flex-grow overflow-hidden'>
                            {/* Left Pane: Info & Presets */}
                            <div className='terminal-pane border-r border-[var(--color-border)] hidden md:block'>
                                <div className='mb-8'>
                                    <div className='flex items-center gap-2 mb-4 text-[var(--color-accent)]'>
                                        <span className='terminal-prompt'>➜</span>
                                        <span className='text-sm uppercase tracking-widest font-bold'>System</span>
                                    </div>
                                    <nav className='flex flex-col gap-2'>
                                        <Link href='/' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/home</Link>
                                        <Link href='/apps' className='text-lg hover:text-[var(--color-accent)] transition-colors'>~/apps</Link>
                                    </nav>
                                </div>

                                <div className='space-y-6'>
                                    <div className='font-mono'>
                                        <span className='text-[var(--color-text)] opacity-70'>$ help --ai</span>
                                        <div className='mt-2 text-xs text-[var(--color-text-dim)] leading-relaxed italic border-l-2 border-[var(--color-border)] pl-4'>
                                            "I have deep access to John's experience, from distributed systems at Roblox to AI at Amazon."
                                        </div>
                                    </div>

                                    <div className='pt-4'>
                                        <span className='text-[var(--color-text)] opacity-70 text-xs font-mono font-bold uppercase block mb-4 tracking-wider'>Suggested Queries:</span>
                                        <div className='flex flex-col gap-2'>
                                            {[
                                                "What's his work history?",
                                                "Experience with Distributed Systems?",
                                                "His tech stack?",
                                                "Open to new roles?"
                                            ].map((q) => (
                                                <button
                                                    key={q}
                                                    onClick={() => sendMessage(q)}
                                                    className='text-left text-sm text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-2 group'
                                                >
                                                    <span className='opacity-0 group-hover:opacity-100 transition-opacity'>&gt;</span> {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Pane: Chat Interface */}
                            <div className='terminal-pane bg-black/20 flex flex-col p-0 overflow-hidden w-full'>
                                <div className='flex-grow overflow-y-auto p-6 scrollbar-hide flex flex-col gap-6'>
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex flex-col ${m.isUser ? 'items-end' : 'items-start'}`}>
                                            <div className='flex items-center gap-2 mb-2'>
                                                {!m.isUser && <span className='text-[var(--color-accent)] text-xs font-mono font-bold'>[RESUME_AI]</span>}
                                                {m.isUser && <span className='text-[var(--color-accent-blue)] text-xs font-mono font-bold'>[USER]</span>}
                                            </div>
                                            <div className={`max-w-[90%] md:max-w-[85%] font-mono text-sm leading-relaxed ${m.isUser ? 'text-right text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'}`}>
                                                {!m.isUser ? (
                                                    <div className='prose prose-invert prose-sm max-w-none'>
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm as any]}
                                                            rehypePlugins={[rehypeRaw as any]}
                                                            components={{ code: CodeBlock }}
                                                        >
                                                            {m.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p>{m.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {streamingMessage && (
                                        <div className='flex flex-col items-start'>
                                            <div className='flex items-center gap-2 mb-2'>
                                                <span className='text-[var(--color-accent)] text-xs font-mono font-bold'>[RESUME_AI]</span>
                                            </div>
                                            <div className='max-w-[90%] md:max-w-[85%] font-mono text-sm text-[var(--color-text-dim)] leading-relaxed'>
                                                <div className='prose prose-invert prose-sm max-w-none'>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm as any]}
                                                        rehypePlugins={[rehypeRaw as any]}
                                                        components={{ code: CodeBlock }}
                                                    >
                                                        {streamingMessage}
                                                    </ReactMarkdown>
                                                </div>
                                                <span className='inline-block w-2 h-4 bg-[var(--color-accent)] ml-1 animate-pulse' />
                                            </div>
                                        </div>
                                    )}

                                    {isLoading && !streamingMessage && (
                                        <div className='flex items-center gap-2 text-[var(--color-text-dim)] text-xs font-mono italic animate-pulse'>
                                            <span>Searching database...</span>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Terminal Input Field */}
                                <div className='p-4 bg-black/40 border-t border-[var(--color-border)]'>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                                        className='flex items-center gap-3 px-3 py-2 bg-white/5 border border-[var(--color-border)] rounded focus-within:border-[var(--color-accent)] transition-colors'
                                    >
                                        <span className='text-[var(--color-accent)] font-mono'>$</span>
                                        <input
                                            type='text'
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder='Ask about John...'
                                            className='flex-grow bg-transparent border-none outline-none text-sm font-mono text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] placeholder:opacity-40'
                                            disabled={isLoading}
                                        />
                                        <button
                                            type='submit'
                                            disabled={isLoading || !input.trim()}
                                            className='text-[var(--color-accent)] hover:scale-110 transition-transform disabled:opacity-30'
                                        >
                                            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                                                <path d='M5 12h14M12 5l7 7-7 7' />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
