'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { WebVitals } from '@/components/SEO/WebVitals';
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
import { strings } from '../../constants/strings';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    ChatBubbleLeftRightIcon,
    ShareIcon,
    CpuChipIcon,
} from '@heroicons/react/24/outline';

interface Relationship {
    subject: string;
    predicate: string;
    object: string;
}

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

    const MAX_CHARS = 20000;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

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
                                        nodeMap.set(subject, {
                                            id: subject,
                                            data: { label: subject },
                                            position: { x: 0, y: 0 },
                                            type: 'default',
                                            style: {
                                                background: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '4px',
                                                padding: '8px 12px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#37352f',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            },
                                        });
                                    }

                                    if (!nodeMap.has(object)) {
                                        nodeMap.set(object, {
                                            id: object,
                                            data: { label: object },
                                            position: { x: 0, y: 0 },
                                            type: 'default',
                                            style: {
                                                background: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '4px',
                                                padding: '8px 12px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#37352f',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            },
                                        });
                                    }

                                    const edgeId = `${subject}-${predicate}-${object}`;
                                    if (!edgeMap.has(edgeId)) {
                                        edgeMap.set(edgeId, {
                                            id: edgeId,
                                            source: subject,
                                            target: object,
                                            label: predicate.replace(/_/g, ' '),
                                            type: 'smoothstep',
                                            animated: false,
                                            style: { stroke: '#9ca3af' },
                                            markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af' },
                                            labelStyle: { fontSize: '10px', fill: '#6b7280' },
                                        });
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

        // Reset styles first
        setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: '#9ca3af', strokeWidth: 1 } })));
        setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, border: '1px solid #e5e7eb', background: '#fff' } })));

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
                setEdges(eds => eds.map(edge => ({
                    ...edge,
                    animated: data.path.edges.includes(edge.id),
                    style: {
                        ...edge.style,
                        stroke: data.path.edges.includes(edge.id) ? '#6366f1' : '#e5e7eb',
                        strokeWidth: data.path.edges.includes(edge.id) ? 2 : 1,
                        opacity: data.path.edges.includes(edge.id) ? 1 : 0.3,
                    },
                })));
                setNodes(nds => nds.map(node => ({
                    ...node,
                    style: {
                        ...node.style,
                        border: data.path.nodes.includes(node.id) ? '2px solid #6366f1' : '1px solid #e5e7eb',
                        background: data.path.nodes.includes(node.id) ? '#e0e7ff' : '#fff',
                        opacity: data.path.nodes.includes(node.id) ? 1 : 0.5,
                    },
                })));
            }
        } catch (error) {
            console.error(error);
            setAnswer('Error generating answer.');
            setShowAnswer(true);
        } finally {
            setIsAsking(false);
        }
    };

    return (
        <>
            <WebVitals />
            <main className='notion-page'>
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '1200px' }}>
                        <Link href='/' className='notion-nav-link' style={{ fontWeight: 600 }}>
                            {strings.NAME}
                        </Link>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href='/apps' className='notion-nav-link'>
                                <DevicePhoneMobileIcon className='notion-nav-icon' />
                                Apps
                            </Link>
                            <Link href='/blog' className='notion-nav-link'>
                                <PencilSquareIcon className='notion-nav-icon' />
                                Blog
                            </Link>
                            <Link href='/apps/resume' className='notion-nav-link'>
                                <DocumentTextIcon className='notion-nav-icon' />
                                Resume
                            </Link>
                        </div>
                    </div>
                </header>

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1200px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>Knowledge Graph</h1>
                        <div className='notion-subtitle'>Convert raw text into an interactive, queriable knowledge graph</div>
                    </div>

                    <div className='notion-divider' />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '32px' }} className="responsive-grid">

                        {/* Left Control Panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <DocumentTextIcon className='notion-section-icon' />
                                    Source Text
                                </div>
                                <div style={{ marginTop: '12px' }}>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder='Paste text here...'
                                        className='notion-textarea'
                                        disabled={isGenerating}
                                        style={{ height: '200px', fontSize: '12px' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                        <span style={{ fontSize: '10px', color: 'rgba(55, 53, 47, 0.5)' }}>
                                            {text.length} / {MAX_CHARS}
                                        </span>
                                        <button
                                            onClick={generateGraph}
                                            disabled={!text.trim() || isGenerating}
                                            className='notion-action-btn notion-action-primary'
                                        >
                                            <ShareIcon className='notion-action-icon' />
                                            {isGenerating ? 'Building...' : 'Generate'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {nodes.length > 0 && (
                                <div className='notion-card' style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Nodes</span>
                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{nodes.length}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(55, 53, 47, 0.5)', textTransform: 'uppercase' }}>Relationships</span>
                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{edges.length}</span>
                                    </div>
                                </div>
                            )}

                            {nodes.length > 0 && (
                                <div className='notion-section'>
                                    <div className='notion-section-title'>
                                        <ChatBubbleLeftRightIcon className='notion-section-icon' />
                                        Query Graph
                                    </div>
                                    <div style={{ marginTop: '12px' }}>
                                        <input
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && askQuestion()}
                                            disabled={isAsking}
                                            placeholder='Ask a question...'
                                            className='notion-input'
                                            style={{ marginBottom: '8px', paddingRight: '30px' }}
                                        />
                                        <button
                                            onClick={askQuestion}
                                            disabled={!query.trim() || isAsking}
                                            className='notion-action-btn'
                                            style={{ width: '100%', justifyContent: 'center' }}
                                        >
                                            {isAsking ? 'Thinking...' : 'Ask'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showAnswer && answer && (
                                <div className='notion-card' style={{ padding: '16px', backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: '8px' }}>Answer</h3>
                                    <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#37352f' }}>{answer}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Graph Area */}
                        <div style={{ height: '600px', backgroundColor: '#f9f9fb', borderRadius: '12px', border: '1px solid rgba(55, 53, 47, 0.09)', position: 'relative', overflow: 'hidden' }}>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                fitView
                                attributionPosition="bottom-left"
                            >
                                <Background color="#e5e5e5" gap={16} />
                                <Controls />
                                <MiniMap
                                    nodeColor={(node) => highlightedPath.nodes.includes(node.id) ? '#6366f1' : '#d1d5db'}
                                    maskColor="rgba(240, 240, 240, 0.6)"
                                />
                            </ReactFlow>

                            {!nodes.length && !isGenerating && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5 }}>
                                    <CpuChipIcon style={{ width: '48px', height: '48px', color: 'rgba(55, 53, 47, 0.3)', marginBottom: '16px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(55, 53, 47, 0.5)' }}>Generate a graph to visualize data</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
