'use client';

import { useState, useEffect, useCallback } from 'react';
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
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    ShareIcon,
    CpuChipIcon,
} from '@heroicons/react/24/outline';

interface Relationship {
    subject: string;
    predicate: string;
    object: string;
}

const NODE_BASE = {
    background: '#fdfdfb',
    border: '1px solid #c9c9c0',
    borderRadius: '10px',
    padding: '9px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#111110',
};

const EDGE_BASE = {
    stroke: '#b9b9b1',
};

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
                                            style: { ...NODE_BASE },
                                        });
                                    }

                                    if (!nodeMap.has(object)) {
                                        nodeMap.set(object, {
                                            id: object,
                                            data: { label: object },
                                            position: { x: 0, y: 0 },
                                            type: 'default',
                                            style: { ...NODE_BASE },
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
                                            style: { stroke: '#b9b9b1' },
                                            markerEnd: { type: MarkerType.ArrowClosed, color: '#b9b9b1' },
                                            labelStyle: { fontSize: '10px', fill: '#82827c' },
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
        setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: '#b9b9b1', strokeWidth: 1 } })));
        setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, border: '1px solid #c9c9c0', background: '#fdfdfb' } })));

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
                        stroke: data.path.edges.includes(edge.id) ? '#111110' : '#d9d9d2',
                        strokeWidth: data.path.edges.includes(edge.id) ? 2 : 1,
                        opacity: data.path.edges.includes(edge.id) ? 1 : 0.35,
                    },
                })));
                setNodes(nds => nds.map(node => ({
                    ...node,
                    style: {
                        ...node.style,
                        border: data.path.nodes.includes(node.id) ? '2px solid #111110' : '1px solid #c9c9c0',
                        background: data.path.nodes.includes(node.id) ? '#efefe8' : '#fdfdfb',
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
            <main className='el-page el-kg'>
                <header className='el-nav'>
                    <Link href='/' className='el-logo' aria-label='John Leonardo home'>
                        John Leonardo
                    </Link>
                    <nav className='el-nav-links' aria-label='Primary navigation'>
                        <Link href='/apps' className='el-nav-link'>Apps</Link>
                        <Link href='/blog' className='el-nav-link'>Blog</Link>
                        <Link href='/apps/resume' className='el-nav-link'>Resume</Link>
                    </nav>
                    <div className='el-nav-actions'>
                        <Link href='/apps/chat' className='el-nav-link'>Chat</Link>
                        <Link href={`mailto:${strings.EMAIL}`} className='el-btn el-btn-dark el-btn-sm'>
                            Contact
                        </Link>
                    </div>
                </header>

                <section className='el-hero el-hero-page'>
                    <div className='el-hero-inner'>
                        <div className='el-hero-copy'>
                            <h1>Knowledge Graph</h1>
                            <p className='el-hero-sub'>
                                Convert raw text into an interactive, queriable knowledge graph.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='el-section el-sentiment'>
                    <div className='ecl-dilution-grid'>
                        <div>
                            <div className='el-chart-block' style={{ marginTop: 0 }}>
                                <div className='el-chart-title'>
                                    <span className='el-chart-title-label'>
                                        <DocumentTextIcon aria-hidden='true' />
                                        Source Text
                                    </span>
                                    <span className='el-chart-pill'>{text.length} / {MAX_CHARS}</span>
                                </div>
                                <div className='el-file-card'>
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder='Paste text here...'
                                        className='el-textarea'
                                        disabled={isGenerating}
                                        rows={9}
                                        maxLength={MAX_CHARS}
                                    />
                                    <div className='el-serialize-row'>
                                        <button
                                            onClick={generateGraph}
                                            disabled={!text.trim() || isGenerating}
                                            className='el-btn el-btn-dark el-btn-sm'
                                        >
                                            <ShareIcon aria-hidden='true' />
                                            {isGenerating
                                                ? `Building ${progress.total ? `(${progress.current}/${progress.total})` : ''}...`
                                                : 'Generate'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {nodes.length > 0 && (
                                <div className='el-chart-block'>
                                    <div className='el-chart-title'>
                                        <span className='el-chart-title-label'>Graph Stats</span>
                                    </div>
                                    <div className='el-file-card'>
                                        <div className='ecl-split-row'>
                                            <span className='ecl-split-name'>Nodes</span>
                                            <span className='ecl-split-value'>{nodes.length}</span>
                                        </div>
                                        <div className='ecl-split-row'>
                                            <span className='ecl-split-name'>Relationships</span>
                                            <span className='ecl-split-value'>{edges.length}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {nodes.length > 0 && (
                                <div className='el-chart-block'>
                                    <div className='el-chart-title'>
                                        <span className='el-chart-title-label'>
                                            <ChatBubbleLeftRightIcon aria-hidden='true' />
                                            Query Graph
                                        </span>
                                    </div>
                                    <div className='el-file-card'>
                                        <input
                                            value={query}
                                            onChange={e => setQuery(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && askQuestion()}
                                            disabled={isAsking}
                                            placeholder='Ask a question...'
                                            className='el-textarea el-el-input'
                                        />
                                        <button
                                            onClick={askQuestion}
                                            disabled={!query.trim() || isAsking}
                                            className='el-btn el-btn-light el-generate-btn'
                                        >
                                            {isAsking ? 'Thinking...' : 'Ask'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showAnswer && answer && (
                                <div className='el-chart-block'>
                                    <div className='el-chart-title'>
                                        <span className='el-chart-title-label'>Answer</span>
                                    </div>
                                    <div className='el-file-card el-rag-answer'>
                                        {answer}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='jd-graph-canvas ecl-kg-canvas'>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                fitView
                                attributionPosition="bottom-left"
                                proOptions={{ hideAttribution: true }}
                            >
                                <Background color="#d9d9d2" gap={18} />
                                <Controls />
                                <MiniMap
                                    nodeColor={(node) => highlightedPath.nodes.includes(node.id) ? '#111110' : '#c9c9c0'}
                                    maskColor="rgba(247, 247, 242, 0.72)"
                                />
                            </ReactFlow>

                            {!nodes.length && !isGenerating && (
                                <div className='ecl-kg-empty'>
                                    <CpuChipIcon aria-hidden='true' />
                                    <span>Generate a graph to visualize data</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <footer className='el-footer'>
                    <div className='el-footer-inner'>
                        <span className='el-footer-logo'>John Leonardo</span>
                        <div className='el-footer-links'>
                            <a href={strings.GITHUB_URL} target='_blank' rel='noreferrer'>GitHub</a>
                            <a href={strings.LINKEDIN_URL} target='_blank' rel='noreferrer'>LinkedIn</a>
                            <a href={`mailto:${strings.EMAIL}`}>{strings.EMAIL}</a>
                        </div>
                        <span className='el-footer-copy'>© 2026. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        </>
    );
}
