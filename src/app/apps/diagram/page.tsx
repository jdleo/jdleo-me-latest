'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Mermaid component to avoid SSR issues
const Mermaid = dynamic(() => import('../../../components/Mermaid'), {
    ssr: false,
});

// Custom styles for Mermaid diagrams
const MermaidStyles = () => (
    <style jsx global>{`
        .mermaid {
            background-color: transparent !important;
        }
        .mermaid text {
            fill: var(--foreground) !important;
            color: var(--foreground) !important;
            font-family: 'Inter', sans-serif !important;
        }
        .mermaid .node rect,
        .mermaid .node circle,
        .mermaid .node ellipse,
        .mermaid .node polygon,
        .mermaid .node path {
            stroke: var(--primary) !important;
            fill: transparent !important;
        }
        .mermaid .edgePath .path {
            stroke: var(--foreground) !important;
        }
        .mermaid .edgeLabel {
            background-color: var(--secondary) !important;
            color: var(--foreground) !important;
        }
        .mermaid .cluster rect {
            fill: transparent !important;
            stroke: var(--primary) !important;
        }
        .mermaid .label {
            color: var(--foreground) !important;
        }
    `}</style>
);

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

export default function DiagramGenerator() {
    const [description, setDescription] = useState('');
    const [diagramCode, setDiagramCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

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
        <div className='min-h-screen bg-[color:var(--background)] overflow-hidden orbital-grid'>
            <MermaidStyles />

            {/* Background gradient effects */}
            <div className='fixed inset-0 bg-[color:var(--background)] z-[-2] pointer-events-none' />
            <div
                className='fixed top-[-50%] left-[-20%] w-[140%] h-[140%] z-[-1] opacity-30 animate-spin-slow pointer-events-none'
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(94, 106, 210, 0.1) 0%, transparent 70%)',
                    transformOrigin: 'center center',
                    animationDuration: '120s',
                }}
            />

            {/* Header */}
            <header className='absolute top-0 right-0 p-4 sm:p-6 z-10 w-full flex justify-end'>
                <nav className='flex gap-4 sm:gap-6 text-[color:var(--foreground)] text-opacity-70 text-sm sm:text-base'>
                    <Link href='/apps' className='linear-link relative z-10'>
                        Apps
                    </Link>
                    <Link href='/' className='linear-link relative z-10'>
                        Home
                    </Link>
                    <a href={`mailto:${strings.EMAIL}`} className='linear-link relative z-10'>
                        Email
                    </a>
                    <a
                        href={strings.LINKEDIN_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='linear-link relative z-10'
                    >
                        LinkedIn
                    </a>
                    <a
                        href={strings.GITHUB_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='linear-link relative z-10'
                    >
                        GitHub
                    </a>
                </nav>
            </header>

            <main
                className={`flex-1 flex flex-col items-center pt-24 sm:pt-28 px-4 pb-12 transition-opacity duration-700 relative z-1 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className='mb-8 text-center'>
                    <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                        <span className='gradient-text'>AI Diagram Generator</span>
                    </h1>
                    <p className='text-[color:var(--foreground)] text-opacity-70 max-w-md'>
                        Describe the diagram you want, and AI will generate it for you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='w-full max-w-[800px] mb-6'>
                    <div className='glass-card p-4 rounded-xl'>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe the diagram you want to generate (e.g., 'Flowchart of user authentication process')"
                            className='w-full bg-transparent border-none outline-none text-[color:var(--foreground)] placeholder:text-[color:var(--foreground)] placeholder:text-opacity-50 resize-y min-h-[100px]'
                        />
                        <div className='flex justify-between items-center mt-2 text-xs text-[color:var(--foreground)] text-opacity-50'>
                            <span>Press Ctrl+Enter to generate</span>
                            <button
                                type='submit'
                                disabled={loading || !description.trim()}
                                className={`linear-button px-4 py-2 rounded-lg ${
                                    loading || !description.trim()
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:shadow-orbital-glow-sm'
                                }`}
                            >
                                {loading ? 'Generating...' : 'Generate Diagram'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className='w-full max-w-[800px] mb-6'>
                    <div className='flex flex-wrap gap-2 justify-center'>
                        {examplePrompts.map((example, index) => (
                            <button
                                key={index}
                                onClick={() => handleExampleClick(example)}
                                className='text-xs bg-[color:var(--secondary)] text-[color:var(--foreground)] text-opacity-70 px-3 py-1 rounded-full hover:bg-opacity-80 transition-colors'
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className='mt-6 text-red-400 bg-red-400 bg-opacity-10 px-4 py-2 rounded-lg border border-red-400 border-opacity-20 w-full max-w-[800px]'>
                        {error}
                    </div>
                )}

                {loading && (
                    <div className='mt-6 glass-card px-6 py-3 rounded-lg animate-pulse-slow w-full max-w-[800px] text-center'>
                        <span className='text-[color:var(--foreground)] text-opacity-80'>Generating diagram...</span>
                    </div>
                )}

                {diagramCode && (
                    <div className='mt-6 w-full max-w-[800px] transition-all duration-300'>
                        <Mermaid chart={diagramCode} id='mermaid-diagram' />
                    </div>
                )}

                {/* Floating particles for orbital effect */}
                <div className='fixed inset-0 pointer-events-none z-0'>
                    {particles.map(particle => (
                        <div
                            key={particle.id}
                            className='absolute rounded-full animate-float pointer-events-none'
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
