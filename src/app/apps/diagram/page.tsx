'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Breadcrumbs } from '@/components/SEO/Breadcrumbs';

// Dynamically import Mermaid component to avoid SSR issues
const Mermaid = dynamic(() => import('../../../components/Mermaid'), {
    ssr: false,
});

// Light theme styles for Mermaid diagrams
const MermaidStyles = () => <style jsx global>{``}</style>;

export default function DiagramGenerator() {
    const [description, setDescription] = useState('');
    const [diagramCode, setDiagramCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Small delay for smoother loading animation
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const generateDiagram = async () => {
        if (!description.trim()) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/diagram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                setDiagramCode(null);
            } else {
                setDiagramCode(data.diagram);
            }
        } catch (err) {
            setError('Failed to generate diagram. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generateDiagram();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            generateDiagram();
        }
    };

    const examplePrompts = [
        'Flowchart of user authentication process',
        'Sequence diagram of API request handling',
        'Class diagram for a blog application',
        'Entity relationship diagram for an e-commerce database',
        'State diagram for a shopping cart checkout process',
    ];

    const handleExampleClick = (example: string) => {
        setDescription(example);
        // Wait for state update before generating
        setTimeout(() => {
            generateDiagram();
        }, 100);
    };

    return (
        <div className='min-h-screen bg-[var(--color-bg-light)] relative'>
            <MermaidStyles />

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

            <main className='main-content'>
                <div className='container-responsive max-w-5xl'>
                    {/* Hero Section */}
                    <section className={`text-center mb-8 animate-reveal ${isLoaded ? '' : 'opacity-0'}`}>
                        <h1 className='text-h1 gradient-text mb-4'>AI Diagram Generator</h1>
                        <p className='text-body opacity-80 max-w-2xl mx-auto'>
                            Describe the diagram you want, and AI will generate a professional Mermaid diagram for you.
                        </p>
                    </section>

                    {/* Input Section */}
                    <section className={`mb-8 animate-reveal animate-reveal-delay-1 ${isLoaded ? '' : 'opacity-0'}`}>
                        <form onSubmit={handleSubmit}>
                            <div className='glass-card-enhanced p-6'>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Describe the diagram you want to generate (e.g., 'Flowchart of user authentication process')"
                                    className='w-full bg-transparent border-none outline-none text-body placeholder:opacity-60 resize-y min-h-[120px] focus:ring-0'
                                />
                                <div className='flex justify-between items-center mt-4 pt-4 border-t border-gray-200'>
                                    <span className='text-small opacity-60'>Press Ctrl+Enter to generate</span>
                                    <button
                                        type='submit'
                                        disabled={loading || !description.trim()}
                                        className='button-primary disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        <span>{loading ? 'Generating...' : 'Generate Diagram'}</span>
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
                                            <path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z' />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </section>

                    {/* Example Prompts */}
                    <section className={`mb-8 animate-reveal animate-reveal-delay-2 ${isLoaded ? '' : 'opacity-0'}`}>
                        <p className='text-small opacity-60 text-center mb-4'>Try these examples:</p>
                        <div className='flex flex-wrap gap-3 justify-center'>
                            {examplePrompts.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleExampleClick(example)}
                                    className='glass-card-subtle hover:glass-card border border-gray-200 px-4 py-2 rounded-xl text-small transition-all duration-200 hover:-translate-y-0.5'
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Error Display */}
                    {error && (
                        <section className='mb-8'>
                            <div className='glass-card border-red-200 bg-red-50 p-4 rounded-xl'>
                                <div className='flex items-center gap-3'>
                                    <svg
                                        width='20'
                                        height='20'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='text-red-500 flex-shrink-0'
                                    >
                                        <circle cx='12' cy='12' r='10' />
                                        <line x1='15' x2='9' y1='9' y2='15' />
                                        <line x1='9' x2='15' y1='9' y2='15' />
                                    </svg>
                                    <p className='text-body text-red-700'>{error}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <section className='mb-8'>
                            <div className='glass-card-enhanced p-8 text-center'>
                                <div className='flex items-center justify-center gap-3 mb-4'>
                                    <div className='flex gap-1'>
                                        <div
                                            className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                                            style={{ animationDelay: '0ms' }}
                                        ></div>
                                        <div
                                            className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                                            style={{ animationDelay: '150ms' }}
                                        ></div>
                                        <div
                                            className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                                            style={{ animationDelay: '300ms' }}
                                        ></div>
                                    </div>
                                </div>
                                <p className='text-body opacity-80'>Generating your diagram...</p>
                            </div>
                        </section>
                    )}

                    {/* Diagram Display */}
                    {diagramCode && (
                        <section className={`animate-reveal animate-reveal-delay-3 ${isLoaded ? '' : 'opacity-0'}`}>
                            <div className='glass-card-enhanced p-6 overflow-auto'>
                                <div className='min-w-full'>
                                    <Mermaid chart={diagramCode} id='mermaid-diagram' />
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
