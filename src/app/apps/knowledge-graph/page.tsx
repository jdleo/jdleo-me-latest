'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { WebVitals } from '@/components/SEO/WebVitals';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    MarkerType,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

interface Relationship {
    subject: string;
    predicate: string;
    object: string;
}

// Dagre layout function
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: 30, ranksep: 50 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 120, height: 40 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 60,
                y: nodeWithPosition.y - 20,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

export default function KnowledgeGraph() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [text, setText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [highlightedPath, setHighlightedPath] = useState<{ nodes: string[], edges: string[] }>({ nodes: [], edges: [] });
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [isAsking, setIsAsking] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);

    const MAX_CHARS = 200000;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleTextChange = (value: string) => {
        if (value.length <= MAX_CHARS) {
            setText(value);
        }
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US');
    };

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // Memoize ReactFlow to prevent re-renders on query input changes
    const reactFlowComponent = useMemo(() => (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            attributionPosition="bottom-left"
        >
            <Background color="#a195ff" gap={16} />
            <Controls />
            <MiniMap
                nodeColor={(node) => highlightedPath.nodes.includes(node.id) ? '#33c758' : '#a195ff'}
                maskColor="rgba(161, 149, 255, 0.1)"
            />
        </ReactFlow>
    ), [nodes, edges, onNodesChange, onEdgesChange, onConnect, highlightedPath]);


    const generateGraph = async () => {
        if (!text.trim()) return;

        setIsGenerating(true);
        setProgress({ current: 0, total: 0 });
        setNodes([]);
        setEdges([]);
        setAnswer('');
        setShowAnswer(false);
        setHighlightedPath({ nodes: [], edges: [] });

        const nodeMap = new Map<string, Node>();
        const edgeMap = new Map<string, Edge>();

        try {
            const response = await fetch('/api/knowledge-graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) throw new Error('Failed to generate graph');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error('No response body');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === 'meta') {
                                setProgress({ current: 0, total: data.totalChunks });
                            } else if (data.type === 'relationships') {
                                setProgress((prev) => ({ ...prev, current: data.chunkIndex + 1 }));

                                const relationships: Relationship[] = data.relationships;

                                relationships.forEach((rel) => {
                                    const subject = rel.subject.toLowerCase().trim();
                                    const object = rel.object.toLowerCase().trim();
                                    const predicate = rel.predicate.toLowerCase().trim();

                                    if (!nodeMap.has(subject)) {
                                        const subjectNode: Node = {
                                            id: subject,
                                            data: { label: subject },
                                            position: { x: 0, y: 0 },
                                            type: 'default',
                                            style: {
                                                background: '#fff',
                                                border: '2px solid #a195ff',
                                                borderRadius: '8px',
                                                padding: '6px',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                            },
                                        };
                                        nodeMap.set(subject, subjectNode);
                                    }

                                    if (!nodeMap.has(object)) {
                                        const objectNode: Node = {
                                            id: object,
                                            data: { label: object },
                                            position: { x: 0, y: 0 },
                                            type: 'default',
                                            style: {
                                                background: '#fff',
                                                border: '2px solid #a195ff',
                                                borderRadius: '8px',
                                                padding: '6px',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                            },
                                        };
                                        nodeMap.set(object, objectNode);
                                    }

                                    const edgeId = `${subject}-${predicate}-${object}`;
                                    if (!edgeMap.has(edgeId)) {
                                        const edge: Edge = {
                                            id: edgeId,
                                            source: subject,
                                            target: object,
                                            label: predicate.replace(/_/g, ' '),
                                            type: 'smoothstep',
                                            animated: false,
                                            style: { stroke: '#a195ff' },
                                            markerEnd: {
                                                type: MarkerType.ArrowClosed,
                                                color: '#a195ff',
                                            },
                                            labelStyle: {
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                fill: '#666',
                                            },
                                        };
                                        edgeMap.set(edgeId, edge);
                                    }
                                });

                                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                                    Array.from(nodeMap.values()),
                                    Array.from(edgeMap.values())
                                );
                                setNodes(layoutedNodes);
                                setEdges(layoutedEdges);
                            } else if (data.type === 'done') {
                                setIsGenerating(false);
                            }
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Graph generation error:', error);
            setIsGenerating(false);
        }
    };

    const askQuestion = async () => {
        if (!query.trim() || isAsking || nodes.length === 0) return;

        setIsAsking(true);
        setShowAnswer(false);
        setHighlightedPath({ nodes: [], edges: [] });

        try {
            const response = await fetch('/api/knowledge-graph/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: query,
                    nodes: nodes.map(n => ({ id: n.id, label: n.data.label })),
                    edges: edges.map(e => ({
                        id: e.id,
                        source: e.source,
                        target: e.target,
                        predicate: e.label?.toString().replace(/ /g, '_') || '',
                    })),
                }),
            });

            if (!response.ok) throw new Error('Failed to get answer');

            const data = await response.json();
            setAnswer(data.answer);
            setShowAnswer(true);

            if (data.path) {
                setHighlightedPath(data.path);

                setEdges(edges.map(edge => ({
                    ...edge,
                    animated: data.path.edges.includes(edge.id),
                    style: {
                        ...edge.style,
                        stroke: data.path.edges.includes(edge.id) ? '#33c758' : '#a195ff',
                        strokeWidth: data.path.edges.includes(edge.id) ? 3 : 1,
                    },
                })));

                setNodes(nodes.map(node => ({
                    ...node,
                    style: {
                        ...node.style,
                        border: data.path.nodes.includes(node.id) ? '3px solid #33c758' : '2px solid #a195ff',
                        background: data.path.nodes.includes(node.id) ? '#f0fff4' : '#fff',
                    },
                })));
            }
        } catch (error) {
            console.error('Question error:', error);
            setAnswer('Sorry, I encountered an error answering your question.');
            setShowAnswer(true);
        } finally {
            setIsAsking(false);
        }
    };

    const clearAnswer = () => {
        setShowAnswer(false);
        setAnswer('');
        setQuery('');
        setHighlightedPath({ nodes: [], edges: [] });

        // Reset node and edge styles
        setEdges(edges.map(edge => ({
            ...edge,
            animated: false,
            style: {
                ...edge.style,
                stroke: '#a195ff',
                strokeWidth: 1,
            },
        })));

        setNodes(nodes.map(node => ({
            ...node,
            style: {
                ...node.style,
                border: '2px solid #a195ff',
                background: '#fff',
            },
        })));
    };

    return (
        <>
            <WebVitals />
            <main className='relative h-screen bg-[#fafbff] overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] flex flex-col md:flex-row'>

                {/* Mobile Header */}
                <header className='md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-white/80 backdrop-blur-md z-50'>
                    <Link href='/apps' className='text-sm font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)]'>
                        ← Apps
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(true)} className='px-3 py-1.5 bg-white border border-[var(--border-light)] rounded-full text-xs font-bold uppercase text-[var(--fg-4)]'>Menu</button>
                </header>

                {/* Sidebar */}
                <aside className='hidden md:flex flex-col w-80 h-full border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>Knowledge Graph</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar'>
                        {/* 1. Input Source */}
                        <div>
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted'>1. Source Text</h3>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${text.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-muted'}`}>
                                    {formatNumber(text.length)} / {formatNumber(MAX_CHARS)}
                                </span>
                            </div>
                            <textarea
                                value={text}
                                onChange={(e) => handleTextChange(e.target.value)}
                                placeholder="Paste your body of text here..."
                                disabled={isGenerating}
                                className='w-full h-40 p-4 bg-white border border-[var(--border-light)] rounded-2xl text-xs focus:ring-2 focus:ring-[var(--purple-1)] focus:border-[var(--purple-4)] outline-none transition-all resize-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                            />
                        </div>

                        {/* 2. Construction */}
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>2. Graph Construction</h3>
                            {isGenerating && progress.total > 0 && (
                                <div className='mb-4 space-y-2'>
                                    <div className='flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted'>
                                        <span>Processing</span>
                                        <span>{progress.current} / {progress.total}</span>
                                    </div>
                                    <div className='w-full h-2 bg-[var(--bg-2)] rounded-full overflow-hidden'>
                                        <div
                                            className='h-full bg-[var(--purple-4)] transition-all duration-300'
                                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={generateGraph}
                                disabled={!text.trim() || isGenerating}
                                className='w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-[var(--purple-4)] text-white shadow-lg shadow-indigo-100 hover:bg-[#5b2ee0] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isGenerating ? 'Generating...' : 'Generate Graph'}
                            </button>
                        </div>

                        {/* Graph Stats */}
                        {nodes.length > 0 && (
                            <div className='space-y-2'>
                                <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-3'>Graph Statistics</h3>
                                <div className='p-3 bg-[var(--bg-2)] rounded-lg flex justify-between items-center text-[10px] font-bold uppercase tracking-wider'>
                                    <span className='text-muted'>Nodes</span>
                                    <span className='text-[var(--fg-4)]'>{nodes.length}</span>
                                </div>
                                <div className='p-3 bg-[var(--bg-2)] rounded-lg flex justify-between items-center text-[10px] font-bold uppercase tracking-wider'>
                                    <span className='text-muted'>Relationships</span>
                                    <span className='text-[var(--fg-4)]'>{edges.length}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className='flex-grow flex flex-col h-full bg-[#fafbff] relative overflow-hidden'>
                    {nodes.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-full p-6'>
                            <div className='max-w-2xl w-full space-y-6 text-center'>
                                <div className='space-y-2'>
                                    <h1 className='text-3xl font-bold text-[var(--fg-4)]'>Knowledge Graph</h1>
                                    <p className='text-muted'>Visualize and analyze connections across your body of text.</p>
                                </div>

                                {/* Mobile Text Input */}
                                <div className='md:hidden'>
                                    <div className='bg-white p-4 rounded-xl border border-[var(--border-light)] shadow-sm'>
                                        <div className='space-y-3'>
                                            <div className='flex items-center justify-between'>
                                                <label className='text-[10px] font-bold text-muted uppercase tracking-wider'>Source Text</label>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${text.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-muted'}`}>
                                                    {formatNumber(text.length)} / {formatNumber(MAX_CHARS)}
                                                </span>
                                            </div>
                                            <textarea
                                                value={text}
                                                onChange={(e) => handleTextChange(e.target.value)}
                                                placeholder="Paste your text here..."
                                                disabled={isGenerating}
                                                className='w-full h-32 p-3 bg-[var(--bg-2)] border border-[var(--border-light)] rounded-lg text-xs outline-none transition-all resize-none disabled:opacity-50'
                                            />
                                            <button
                                                onClick={generateGraph}
                                                disabled={!text.trim() || isGenerating}
                                                className='w-full py-3 bg-[var(--purple-4)] text-white rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                {isGenerating ? 'Generating...' : 'Generate Graph'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className='py-12 bg-white/40 rounded-3xl border border-dashed border-[var(--border-light)]'>
                                    <div className='w-20 h-20 bg-[var(--purple-1)] rounded-full flex items-center justify-center text-3xl mb-4 animate-pulse mx-auto'>
                                        🕸️
                                    </div>
                                    <h3 className='text-sm font-bold uppercase tracking-widest text-[var(--fg-4)] mb-2'>No Active Graph</h3>
                                    <p className='text-xs text-muted max-w-xs text-center leading-relaxed mx-auto'>
                                        Paste a body of text and generate a graph to visualize its knowledge structure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col h-full relative'>
                            <div className='flex-grow relative'>
                                {reactFlowComponent}

                                {/* Answer Overlay */}
                                <AnimatePresence>
                                    {showAnswer && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                            className='absolute inset-x-4 top-4 mx-auto w-auto max-w-2xl z-10'
                                        >
                                            <div className='relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(161,149,255,0.1)] overflow-hidden'>
                                                {/* Gradient overlay for depth */}
                                                <div className='absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 pointer-events-none' />

                                                {/* Header */}
                                                <div className='relative bg-white/10 backdrop-blur-sm p-4 flex items-center justify-between border-b border-white/20'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='w-2 h-2 rounded-full bg-white animate-pulse shadow-lg shadow-white/50' />
                                                        <span className='text-black font-bold uppercase tracking-widest text-xs'>Answer</span>
                                                    </div>
                                                    <button
                                                        onClick={clearAnswer}
                                                        className='w-8 h-8 rounded-full bg-white hover:bg-white/90 flex items-center justify-center text-[var(--purple-4)] transition-all hover:scale-110 active:scale-95 shadow-lg'
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                                {/* Content */}
                                                <div className='relative p-6'>
                                                    <div className='text-base text-[var(--fg-4)] leading-relaxed bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20'>{answer}</div>

                                                    {highlightedPath.nodes.length > 0 && (
                                                        <div className='mt-4'>
                                                            <div className='text-[10px] font-bold uppercase tracking-wider text-[var(--fg-4)] bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg inline-block border border-white/20'>
                                                                Traversed {highlightedPath.nodes.length} nodes • {highlightedPath.edges.length} relationships
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Question Input */}
                            <div className='p-4 bg-white/80 backdrop-blur-xl border-t border-[var(--border-light)]'>
                                <div className='max-w-3xl mx-auto relative'>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                                        disabled={isAsking}
                                        placeholder="Ask a question about your knowledge graph..."
                                        className='w-full p-4 pr-14 bg-white border border-[var(--border-light)] rounded-2xl shadow-sm text-sm focus:outline-none focus:border-[var(--purple-4)] focus:ring-2 focus:ring-[var(--purple-1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                                    />
                                    <button
                                        onClick={askQuestion}
                                        disabled={!query.trim() || isAsking}
                                        className='absolute right-2 top-2 bottom-2 aspect-square bg-[var(--purple-4)] text-white rounded-xl flex items-center justify-center hover:bg-[#5b2ee0] disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                                    >
                                        {isAsking ? '⏳' : '🔍'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Backdrop */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <div className='fixed inset-0 z-[100] flex items-end justify-center' onClick={() => setIsMobileMenuOpen(false)}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className='absolute inset-0 bg-black/40 backdrop-blur-sm'
                            />
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className='relative w-full bg-white rounded-t-2xl p-6 shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto'
                                onClick={e => e.stopPropagation()}
                            >
                                <div className='flex items-center justify-between mb-8'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-2 h-2 rounded-full bg-[var(--purple-4)]' />
                                        <span className='text-xs font-bold uppercase tracking-widest text-[var(--fg-4)]'>Knowledge Graph</span>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className='w-8 h-8 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-muted'>✕</button>
                                </div>
                                <div className='space-y-6'>
                                    {nodes.length > 0 && (
                                        <div className='space-y-2'>
                                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-3'>Graph Statistics</h3>
                                            <div className='p-3 bg-[var(--bg-2)] rounded-lg flex justify-between items-center text-[10px] font-bold uppercase tracking-wider'>
                                                <span className='text-muted'>Nodes</span>
                                                <span className='text-[var(--fg-4)]'>{nodes.length}</span>
                                            </div>
                                            <div className='p-3 bg-[var(--bg-2)] rounded-lg flex justify-between items-center text-[10px] font-bold uppercase tracking-wider'>
                                                <span className='text-muted'>Relationships</span>
                                                <span className='text-[var(--fg-4)]'>{edges.length}</span>
                                            </div>
                                        </div>
                                    )}
                                    <button onClick={() => setIsMobileMenuOpen(false)} className='w-full py-4 bg-[var(--fg-4)] text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg'>
                                        Done
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </>
    );
}
