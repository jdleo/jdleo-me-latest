import { NextResponse } from 'next/server';

interface GraphNode {
    id: string;
    label: string;
}

interface GraphEdge {
    id: string;
    source: string;
    target: string;
    predicate: string;
}

export async function POST(req: Request) {
    try {
        const { question, nodes, edges } = await req.json();

        if (!question || !nodes || !edges) {
            return NextResponse.json({ error: 'Question, nodes, and edges are required' }, { status: 400 });
        }

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
        }

        // Step 1: Find all nodes with indegree 0 (root nodes)
        const inDegreeMap = new Map<string, number>();

        // Initialize all nodes with indegree 0
        nodes.forEach((node: GraphNode) => {
            inDegreeMap.set(node.id, 0);
        });

        // Count incoming edges for each node
        edges.forEach((edge: GraphEdge) => {
            const currentIndegree = inDegreeMap.get(edge.target) || 0;
            inDegreeMap.set(edge.target, currentIndegree + 1);
        });

        // Get nodes with indegree 0
        const rootNodes = nodes.filter((node: GraphNode) =>
            inDegreeMap.get(node.id) === 0
        );

        // Step 2: Ask LLM to select relevant root nodes for the question
        const rootNodesList = rootNodes.map((n: GraphNode) => n.id).join(', ');

        const selectionPrompt = `You are selecting starting points in a knowledge graph to answer a question.

Available root nodes (entities with no incoming edges):
${rootNodesList}

Question: "${question}"

Select which root nodes are most relevant to answer this question. Return ONLY a JSON array of the selected node IDs (lowercase), no other text.

Example: ["annual wage", "roblox corporation", "senior backend software engineer"]`;

        const selectionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://jdleo.me',
                'X-Title': 'jdleo.me',
            },
            body: JSON.stringify({
                model: 'qwen/qwen3-235b-a22b-2507',
                messages: [{ role: 'user', content: selectionPrompt }],
                temperature: 0.3,
            }),
        });

        if (!selectionResponse.ok) {
            throw new Error('Failed to select root nodes');
        }

        const selectionData = await selectionResponse.json();
        let selectedRoots: string[] = [];

        try {
            const content = selectionData.choices?.[0]?.message?.content || '[]';
            selectedRoots = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse selected roots:', e);
            // Fallback: use all root nodes
            selectedRoots = rootNodes.map((n: GraphNode) => n.id);
        }

        // Step 3: Traverse the graph from selected root nodes
        const visitedNodes = new Set<string>();
        const visitedEdges = new Set<string>();
        const relevantSubgraph: { nodes: GraphNode[], edges: GraphEdge[] } = { nodes: [], edges: [] };

        // BFS from each selected root
        const queue: string[] = [...selectedRoots];
        const maxDepth = 3;
        const depthMap = new Map<string, number>();

        selectedRoots.forEach(root => depthMap.set(root, 0));

        while (queue.length > 0) {
            const currentNode = queue.shift()!;
            const currentDepth = depthMap.get(currentNode) || 0;

            if (currentDepth > maxDepth) continue;
            if (visitedNodes.has(currentNode)) continue;

            visitedNodes.add(currentNode);

            // Add node to subgraph
            const node = nodes.find((n: GraphNode) => n.id === currentNode);
            if (node) {
                relevantSubgraph.nodes.push(node);
            }

            // Find all edges connected to this node
            const connectedEdges = edges.filter((e: GraphEdge) =>
                e.source === currentNode || e.target === currentNode
            );

            connectedEdges.forEach((edge: GraphEdge) => {
                if (!visitedEdges.has(edge.id)) {
                    visitedEdges.add(edge.id);
                    relevantSubgraph.edges.push(edge);

                    // Add connected nodes to queue
                    const nextNode = edge.source === currentNode ? edge.target : edge.source;
                    if (!depthMap.has(nextNode)) {
                        depthMap.set(nextNode, currentDepth + 1);
                        queue.push(nextNode);
                    }
                }
            });
        }

        // If we still have no subgraph, use the entire graph (fallback)
        if (relevantSubgraph.edges.length === 0) {
            relevantSubgraph.nodes = nodes;
            relevantSubgraph.edges = edges;
            visitedNodes.clear();
            visitedEdges.clear();
            nodes.forEach((n: GraphNode) => visitedNodes.add(n.id));
            edges.forEach((e: GraphEdge) => visitedEdges.add(e.id));
        }

        // Step 4: Format the subgraph as context for the LLM
        const graphContext = relevantSubgraph.edges
            .map(edge => `• ${edge.source} → [${edge.predicate}] → ${edge.target}`)
            .join('\n');

        // Step 5: Generate answer using the subgraph
        const answerPrompt = `You are answering a question based on a knowledge graph. Use the following relationships to answer the question accurately and precisely.

Knowledge Graph Relationships:
${graphContext}

Question: ${question}

Instructions:
- Answer based ONLY on the relationships shown above
- Be specific and include exact values (numbers, names, etc.) from the graph
- If the answer is not in the graph, say "I don't have that information in the knowledge graph"
- Keep your answer concise and direct

Answer:`;

        const answerResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://jdleo.me',
                'X-Title': 'jdleo.me',
            },
            body: JSON.stringify({
                model: 'qwen/qwen3-235b-a22b-2507',
                messages: [{ role: 'user', content: answerPrompt }],
                temperature: 0.1,
                max_tokens: 500,
            }),
        });

        if (!answerResponse.ok) {
            throw new Error('Failed to generate answer');
        }

        const answerData = await answerResponse.json();
        const answer = answerData.choices?.[0]?.message?.content || 'Unable to generate answer.';

        // Return answer and the path taken (for visualization)
        return NextResponse.json({
            answer,
            path: {
                nodes: Array.from(visitedNodes),
                edges: Array.from(visitedEdges),
            },
            debug: {
                rootNodes: rootNodes.map((n: GraphNode) => n.id),
                selectedRoots,
                subgraphSize: {
                    nodes: relevantSubgraph.nodes.length,
                    edges: relevantSubgraph.edges.length,
                },
            },
        });
    } catch (error) {
        console.error('Knowledge graph chat error:', error);
        return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 });
    }
}
