'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import CodeBlock from '@/components/CodeBlock';
import MessageItem, { Message } from '@/components/chat/MessageItem';
import ChatInput from '@/components/chat/ChatInput';
import { useBufferedStream } from '@/components/chat/useBufferedStream';
import { WebVitals } from '@/components/SEO/WebVitals';
import { ArrowLeftIcon, Cog6ToothIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const availableModels = [
    { id: 'z-ai/glm-5.3-flash', name: 'GLM 5.3 Flash', icon: '/zai.jpg' },
    { id: 'google/gemini-3.7-flash', name: 'Gemini 3.7 Flash', icon: '/gemini.png' },
    { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', icon: '/chatgpt.png' },
    { id: 'anthropic/claude-sonnet-5', name: 'Claude Sonnet 5', icon: '/claude.png' },
    { id: 'openai/gpt-5.6-luna', name: 'GPT 5.6 Luna', icon: '/chatgpt.png' },
    { id: 'x-ai/grok-4.6', name: 'Grok 4.6', icon: '/grok.png' },
];

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('openai/gpt-5.6-luna');
    const [streamingMessage, setStreamingMessage] = useState('');
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(
        "You are a helpful AI assistant. Today's date is {{currentDate}}."
    );
    const [isMobileModelSelectorOpen, setIsMobileModelSelectorOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamBufferRef = useRef('');

    useBufferedStream(streamBufferRef, isLoading, setStreamingMessage);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        scrollToBottom(isLoading ? 'auto' : 'smooth');
    }, [messages, isLoading, streamingMessage]);

    useEffect(() => {
        const savedSystemPrompt = localStorage.getItem('chatSystemPrompt');
        if (savedSystemPrompt) setSystemPrompt(savedSystemPrompt);
    }, []);

    useEffect(() => {
        localStorage.setItem('chatSystemPrompt', systemPrompt);
    }, [systemPrompt]);

    const sendMessage = async (message: string) => {
        if (!message.trim() || isLoading) return;
        setShowWelcome(false);
        const updatedMessages = [...messages, { content: message, isUser: true }];
        setMessages(updatedMessages);
        setIsLoading(true);
        setStreamingMessage('');
        const startTime = Date.now();

        try {
            const apiMessages = updatedMessages.slice(-10);
            const currentDate = new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            });
            const processedSystemPrompt = systemPrompt.replace(/\{\{currentDate\}\}/g, currentDate);

            const response = await fetch('/api/chat-openrouter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    model: selectedModel,
                    systemPrompt: processedSystemPrompt,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';
            let usageData: any = null;

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
                                    streamBufferRef.current = accumulatedContent;
                                } else if (data.type === 'usage') {
                                    usageData = data.usage;
                                } else if (data.type === 'done') {
                                    const endTime = Date.now();
                                    const responseTimeMs = endTime - startTime;
                                    let processedUsage = null;
                                    if (usageData) {
                                        const tokensPerSecond = usageData.completion_tokens / (responseTimeMs / 1000);
                                        const estimatedCost = usageData.prompt_tokens * 0.000001 + usageData.completion_tokens * 0.000002;
                                        processedUsage = {
                                            ...usageData,
                                            tokens_per_second: Math.round(tokensPerSecond * 10) / 10,
                                            estimated_cost: Math.round(estimatedCost * 100000) / 100000,
                                            response_time_ms: responseTimeMs,
                                        };
                                    }
                                    setMessages([...updatedMessages, {
                                        content: accumulatedContent,
                                        isUser: false,
                                        model: availableModels.find(m => m.id === selectedModel)?.name,
                                        usage: processedUsage,
                                    }]);
                                    setStreamingMessage('');
                                    streamBufferRef.current = '';
                                    setIsLoading(false);
                                    return;
                                }
                            } catch (e) { }
                        }
                    }
                }
            }
        } catch (error) {
            setMessages([...updatedMessages, { content: "ERROR: Failed to connect to service.", isUser: false }]);
        } finally {
            setIsLoading(false);
            setStreamingMessage('');
            streamBufferRef.current = '';
        }
    };

    const currentModel = availableModels.find(m => m.id === selectedModel);

    const modelRows = (onPick?: () => void) =>
        availableModels.map(m => (
            <button
                key={m.id}
                onClick={() => {
                    setSelectedModel(m.id);
                    onPick?.();
                }}
                className={`ecl-model ${selectedModel === m.id ? 'is-selected' : ''}`}
            >
                <Image src={m.icon} alt='' width={18} height={18} className='ecl-model-icon' />
                <span>{m.name}</span>
            </button>
        ));

    return (
        <>
            <WebVitals />
            <main className='el-page el-chat'>
                <header className='el-nav'>
                    <Link href='/apps' className='el-back'>
                        <ArrowLeftIcon aria-hidden='true' />
                        Apps
                    </Link>
                    <nav className='el-nav-links' aria-label='Primary navigation'>
                        <Link href='/' className='el-nav-link'>Home</Link>
                        <Link href='/blog' className='el-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='el-nav-link'>Resume</Link>
                    </nav>
                    <div className='el-nav-actions'>
                        <button
                            onClick={() => setIsMobileModelSelectorOpen(true)}
                            className='ecl-pill-btn md:hidden'
                        >
                            <span>{currentModel?.name.split(' ')[0]}</span>
                            <ChevronDownIcon aria-hidden='true' />
                        </button>
                        <button
                            onClick={() => setIsMobileSettingsOpen(true)}
                            className='ecl-pill-btn ecl-icon-btn md:hidden'
                            aria-label='Open chat settings'
                        >
                            <Cog6ToothIcon aria-hidden='true' />
                        </button>
                        <Link href='/' className='el-btn el-btn-dark el-btn-sm'>John Leonardo</Link>
                    </div>
                </header>

                <div className='ecl-layout'>
                    <aside className='ecl-side hidden md:flex'>
                        <div className='ecl-side-block'>
                            <div className='el-eyebrow'>
                                <span className='el-eyebrow-label'>Select Model</span>
                            </div>
                            <div className='ecl-models'>{modelRows()}</div>
                        </div>

                        <div className='ecl-side-block ecl-side-system'>
                            <div className='el-eyebrow'>
                                <span className='el-eyebrow-label'>System Prompt</span>
                            </div>
                            <textarea
                                value={systemPrompt}
                                onChange={e => setSystemPrompt(e.target.value)}
                                className='notion-chat-textarea'
                                rows={8}
                                placeholder='Enter system prompt...'
                            />
                        </div>

                        <div className='ecl-side-footer'>
                            <button onClick={() => setMessages([])} className='ecl-clear-btn'>
                                Clear History
                            </button>
                        </div>
                    </aside>

                    <section className='ecl-main'>
                        <div className='ecl-scroll scrollbar-hide'>
                            {showWelcome && (
                                <div className='ecl-welcome'>
                                    <div className='el-eyebrow'>
                                        <span className='el-eyebrow-label'>AI Chat</span>
                                    </div>
                                    <h1>Feel free to chat and ask anything.</h1>
                                    <p>
                                        Your chats are <strong>never saved</strong> anywhere. This is totally free for now, so have fun.
                                    </p>
                                </div>
                            )}

                            {messages.map((m, i) => (
                                <MessageItem key={i} message={m} />
                            ))}

                            {streamingMessage && (
                                <div className='notion-chat-message-wrapper'>
                                    <div className='notion-chat-message notion-chat-message-ai'>
                                        <div className='ecl-message-label'>Thinking...</div>
                                        <div className='notion-blog-content'>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    code: CodeBlock as any,
                                                    table: ({ children }) => <div className='table-wrapper'><table>{children}</table></div>,
                                                }}
                                            >
                                                {streamingMessage}
                                            </ReactMarkdown>
                                            <span className='notion-chat-cursor' />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isLoading && !streamingMessage && (
                                <div className='notion-chat-message-wrapper'>
                                    <div className='notion-chat-message notion-chat-message-ai'>
                                        <div className='notion-chat-loading'>
                                            <div className='notion-chat-loading-dot' style={{ animationDelay: '0ms' }} />
                                            <div className='notion-chat-loading-dot' style={{ animationDelay: '150ms' }} />
                                            <div className='notion-chat-loading-dot' style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className='ecl-inputbar'>
                            <ChatInput
                                onSend={sendMessage}
                                isLoading={isLoading}
                                modelName={currentModel?.name}
                            />
                        </div>
                    </section>
                </div>

                {isMobileModelSelectorOpen && (
                    <div className='notion-mobile-overlay' onClick={() => setIsMobileModelSelectorOpen(false)}>
                        <div className='ecl-panel' onClick={e => e.stopPropagation()}>
                            <div className='ecl-panel-header'>
                                <span>Select Model</span>
                                <button onClick={() => setIsMobileModelSelectorOpen(false)} className='ecl-panel-close'>x</button>
                            </div>
                            <div className='ecl-models ecl-panel-models'>{modelRows(() => setIsMobileModelSelectorOpen(false))}</div>
                        </div>
                    </div>
                )}

                {isMobileSettingsOpen && (
                    <div className='notion-mobile-overlay' onClick={() => setIsMobileSettingsOpen(false)}>
                        <div className='ecl-panel' onClick={e => e.stopPropagation()}>
                            <div className='ecl-panel-header'>
                                <span>System Prompt</span>
                                <button onClick={() => setIsMobileSettingsOpen(false)} className='ecl-panel-close'>x</button>
                            </div>
                            <div className='ecl-panel-body'>
                                <textarea
                                    value={systemPrompt}
                                    onChange={e => setSystemPrompt(e.target.value)}
                                    className='notion-chat-textarea'
                                    rows={8}
                                    placeholder='Enter system prompt...'
                                />
                                <div className='ecl-panel-actions'>
                                    <button onClick={() => setMessages([])} className='ecl-clear-btn'>
                                        Clear History
                                    </button>
                                    <button onClick={() => setIsMobileSettingsOpen(false)} className='el-btn el-btn-dark el-btn-sm'>
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}
