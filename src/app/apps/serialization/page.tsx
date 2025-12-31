'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WebVitals } from '@/components/SEO/WebVitals';
import { motion } from 'framer-motion';
import { encode as encodeToon } from '@toon-format/toon';
import yaml from 'js-yaml';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as toml from '@iarna/toml';
import { encodeSmart as encodeTonl } from 'tonl';
import { TRON } from '@tron-format/tron';

interface SerializationResult {
    format: string;
    output: string;
    tokens: number;
    bytes: number;
    savings: number;
    language: string;
}

const DEFAULT_JSON = `{
    "basics": {
        "name": "John Leonardo",
        "email": "j@jdleo.me",
        "location": "San Jose, California",
        "website": "jdleo.me",
        "summary": "Senior Software Engineer with 5+ years specializing in scalable distributed systems (80k+ RPS) and AWS infrastructure. Proven track record in ML/AI model deployment, microservice architecture, and system optimization driving measurable business revenue."
    },
    "work": [
        {
            "company": "Roblox",
            "position": "Senior Software Engineer",
            "startDate": "2025-06",
            "endDate": "Present",
            "summary": "Led cross-functional team of 4 to architect and deliver multi-agent AI system that automated performance evaluation workflows. Architected a multi-tenant AI backend using GraphQL and request batching, reducing P99 latency by 60%. Directed a team of 4 to deploy specialized AI agents, optimizing Python data pipelines to handle 80k+ RPS."
        },
        {
            "company": "Amazon",
            "position": "Software Engineer II",
            "startDate": "2021-09",
            "endDate": "2025-06",
            "summary": "Delivered and deployed a RoBERTa-based NER Query Understanding solution using an ensemble model architecture, confirming $290MM additional revenue. Key contributor to the launch of Rufus, Amazon's LLM-based shopping assistant. Upgraded Amazon Search service infrastructure (80k TPS) and migrated systems from legacy Apollo to AWS."
        },
        {
            "company": "IBM",
            "position": "Software Engineer",
            "startDate": "2020-08",
            "endDate": "2021-08",
            "summary": "Engineered a Salesforce-to-OpenShift integration for batch processing, increasing throughput by 300%. Architected a RESTful abstraction layer over legacy print infrastructure and containerized the service with Docker and OpenShift."
        }
    ],
    "education": [
        {
            "institution": "California State University, Sacramento",
            "area": "Computer Science with Minor in Mathematics",
            "studyType": "B.S.",
            "startDate": "2017-08",
            "endDate": "2020-05",
            "gpa": null
        }
    ],
    "skills": {
        "technical": [
            "Python",
            "JavaScript",
            "TypeScript",
            "Java",
            "React",
            "Spring Boot",
            "FastAPI",
            "Node.js",
            "Express",
            "Rust",
            "Go",
            "Elixir",
            "AWS (S3, Lambda, ECS, CloudWatch, DynamoDB)",
            "Kubernetes",
            "Docker",
            "Terraform",
            "GitLab CI/CD",
            "PostgreSQL",
            "MongoDB",
            "Redis",
            "Firestore",
            "Model deployment (ONNX, Triton)",
            "fine-tuning transformers (RoBERTa, BERT)",
            "A/B testing",
            "Anthropic Claude",
            "OpenAI GPT",
            "TensorFlow",
            "Jupyter"
        ],
        "soft": [
            "Technical leadership",
            "Mentoring",
            "Cross-functional team leadership",
            "Technical interviewing"
        ],
        "languages": []
    },
    "certifications": []
}`;

export default function Serialization() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [input, setInput] = useState(DEFAULT_JSON);
    const [results, setResults] = useState<SerializationResult[]>([]);
    const [error, setError] = useState('');
    const [expandedFormats, setExpandedFormats] = useState<string[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const estimateTokens = (text: string): number => {
        return Math.ceil(text.length / 4);
    };

    const toggleExpand = (format: string) => {
        setExpandedFormats(prev =>
            prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
        );
    };

    const serialize = () => {
        setError('');
        setResults([]);

        try {
            const data = JSON.parse(input);
            const newResults: SerializationResult[] = [];

            // BASELINE: JSON (minified)
            const jsonMinified = JSON.stringify(data);
            const baselineTokens = estimateTokens(jsonMinified);
            newResults.push({
                format: 'JSON (Minified) [BASELINE]',
                output: jsonMinified,
                tokens: baselineTokens,
                bytes: new Blob([jsonMinified]).size,
                savings: 0,
                language: 'json',
            });

            // JSON (pretty-printed)
            const jsonPretty = JSON.stringify(data, null, 2);
            const jsonPrettyTokens = estimateTokens(jsonPretty);
            newResults.push({
                format: 'JSON (Pretty)',
                output: jsonPretty,
                tokens: jsonPrettyTokens,
                bytes: new Blob([jsonPretty]).size,
                savings: ((baselineTokens - jsonPrettyTokens) / baselineTokens) * 100,
                language: 'json',
            });

            // 3. TOON
            try {
                const toonStr = encodeToon(data);
                const toonTokens = estimateTokens(toonStr);
                newResults.push({
                    format: 'TOON',
                    output: toonStr,
                    tokens: toonTokens,
                    bytes: new Blob([toonStr]).size,
                    savings: ((baselineTokens - toonTokens) / baselineTokens) * 100,
                    language: 'text',
                });
            } catch (e) {
                console.error('TOON encoding failed:', e);
            }

            // 4. TONL
            try {
                const tonlStr = encodeTonl(data);
                const tonlTokens = estimateTokens(tonlStr);
                newResults.push({
                    format: 'TONL',
                    output: tonlStr,
                    tokens: tonlTokens,
                    bytes: new Blob([tonlStr]).size,
                    savings: ((baselineTokens - tonlTokens) / baselineTokens) * 100,
                    language: 'text',
                });
            } catch (e) {
                console.error('TONL encoding failed:', e);
            }

            // 5. TRON
            try {
                const tronStr = TRON.stringify(data);
                const tronTokens = estimateTokens(tronStr);
                newResults.push({
                    format: 'TRON',
                    output: tronStr,
                    tokens: tronTokens,
                    bytes: new Blob([tronStr]).size,
                    savings: ((baselineTokens - tronTokens) / baselineTokens) * 100,
                    language: 'text',
                });
            } catch (e) {
                console.error('TRON encoding failed:', e);
            }

            // 4. YAML
            try {
                const yamlStr = yaml.dump(data);
                const yamlTokens = estimateTokens(yamlStr);
                newResults.push({
                    format: 'YAML',
                    output: yamlStr,
                    tokens: yamlTokens,
                    bytes: new Blob([yamlStr]).size,
                    savings: ((baselineTokens - yamlTokens) / baselineTokens) * 100,
                    language: 'yaml',
                });
            } catch (e) {
                console.error('YAML encoding failed:', e);
            }

            // 5. TOML
            try {
                const tomlStr = toml.stringify(data as any);
                const tomlTokens = estimateTokens(tomlStr);
                newResults.push({
                    format: 'TOML',
                    output: tomlStr,
                    tokens: tomlTokens,
                    bytes: new Blob([tomlStr]).size,
                    savings: ((baselineTokens - tomlTokens) / baselineTokens) * 100,
                    language: 'toml',
                });
            } catch (e) {
                console.error('TOML encoding failed:', e);
            }

            // 6. XML
            try {
                const xmlStr = jsonToXml(data);
                const xmlTokens = estimateTokens(xmlStr);
                newResults.push({
                    format: 'XML',
                    output: xmlStr,
                    tokens: xmlTokens,
                    bytes: new Blob([xmlStr]).size,
                    savings: ((baselineTokens - xmlTokens) / baselineTokens) * 100,
                    language: 'xml',
                });
            } catch (e) {
                console.error('XML encoding failed:', e);
            }



            // 10. CSV (flattened)
            try {
                const csvStr = jsonToCsv(data);
                const csvTokens = estimateTokens(csvStr);
                newResults.push({
                    format: 'CSV',
                    output: csvStr,
                    tokens: csvTokens,
                    bytes: new Blob([csvStr]).size,
                    savings: ((baselineTokens - csvTokens) / baselineTokens) * 100,
                    language: 'text',
                });
            } catch (e) {
                console.error('CSV encoding failed:', e);
            }

            // 11. TSV (tab-separated)
            try {
                const tsvStr = jsonToCsv(data, '\t');
                const tsvTokens = estimateTokens(tsvStr);
                newResults.push({
                    format: 'TSV',
                    output: tsvStr,
                    tokens: tsvTokens,
                    bytes: new Blob([tsvStr]).size,
                    savings: ((baselineTokens - tsvTokens) / baselineTokens) * 100,
                    language: 'text',
                });
            } catch (e) {
                console.error('TSV encoding failed:', e);
            }

            // 12. URL Query Params (flattened)
            try {
                const urlParams = jsonToUrlParams(data);
                const urlTokens = estimateTokens(urlParams);
                newResults.push({
                    format: 'URL Query Params',
                    output: urlParams,
                    tokens: urlTokens,
                    bytes: new Blob([urlParams]).size,
                    savings: ((baselineTokens - urlTokens) / baselineTokens) * 100,
                    language: 'text',
                });
            } catch (e) {
                console.error('URL params encoding failed:', e);
            }

            // 14. Compact Key-Value
            try {
                const kvStr = jsonToKeyValue(data);
                const kvTokens = estimateTokens(kvStr);
                newResults.push({
                    format: 'Key-Value Pairs',
                    output: kvStr,
                    tokens: kvTokens,
                    bytes: new Blob([kvStr]).size,
                    savings: ((baselineTokens - kvTokens) / baselineTokens) * 100,
                    language: 'text',
                });
            } catch (e) {
                console.error('Key-Value encoding failed:', e);
            }

            // 15. S-Expression
            try {
                const sexprStr = jsonToSexpr(data);
                const sexprTokens = estimateTokens(sexprStr);
                newResults.push({
                    format: 'S-Expression',
                    output: sexprStr,
                    tokens: sexprTokens,
                    bytes: new Blob([sexprStr]).size,
                    savings: ((baselineTokens - sexprTokens) / baselineTokens) * 100,
                    language: 'lisp',
                });
            } catch (e) {
                console.error('S-Expression encoding failed:', e);
            }

            // Sort by tokens (ascending)
            newResults.sort((a, b) => a.tokens - b.tokens);

            setResults(newResults);
        } catch (e: any) {
            setError(e.message || 'Invalid JSON');
        }
    };

    const jsonToXml = (obj: any, rootName = 'root'): string => {
        const toXml = (data: any, name: string): string => {
            if (Array.isArray(data)) {
                return data.map(item => toXml(item, name.slice(0, -1))).join('');
            } else if (typeof data === 'object' && data !== null) {
                const children = Object.entries(data)
                    .map(([key, value]) => toXml(value, key))
                    .join('');
                return `<${name}>${children}</${name}>`;
            } else {
                return `<${name}>${data}</${name}>`;
            }
        };
        return `<?xml version="1.0"?>${toXml(obj, rootName)}`;
    };

    const jsonToCsv = (obj: any, delimiter = ','): string => {
        const flatten = (data: any, prefix = ''): any => {
            const result: any = {};
            for (const key in data) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
                    Object.assign(result, flatten(data[key], newKey));
                } else if (Array.isArray(data[key])) {
                    result[newKey] = JSON.stringify(data[key]);
                } else {
                    result[newKey] = data[key];
                }
            }
            return result;
        };

        const flattened = flatten(obj);
        const headers = Object.keys(flattened);
        const values = Object.values(flattened);
        return `${headers.join(delimiter)}\n${values.map(v => JSON.stringify(v)).join(delimiter)}`;
    };

    const jsonToUrlParams = (obj: any, prefix = ''): string => {
        const params: string[] = [];
        const flatten = (data: any, pre: string) => {
            for (const key in data) {
                const newKey = pre ? `${pre}[${key}]` : key;
                if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
                    flatten(data[key], newKey);
                } else if (Array.isArray(data[key])) {
                    data[key].forEach((item: any, idx: number) => {
                        if (typeof item === 'object') {
                            flatten(item, `${newKey}[${idx}]`);
                        } else {
                            params.push(`${newKey}[${idx}]=${encodeURIComponent(item)}`);
                        }
                    });
                } else {
                    params.push(`${newKey}=${encodeURIComponent(data[key])}`);
                }
            }
        };
        flatten(obj, prefix);
        return params.join('&');
    };

    const jsonToKeyValue = (obj: any, prefix = ''): string => {
        const lines: string[] = [];
        const flatten = (data: any, pre: string) => {
            for (const key in data) {
                const newKey = pre ? `${pre}.${key}` : key;
                if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
                    flatten(data[key], newKey);
                } else if (Array.isArray(data[key])) {
                    lines.push(`${newKey}=${JSON.stringify(data[key])}`);
                } else {
                    lines.push(`${newKey}=${data[key]}`);
                }
            }
        };
        flatten(obj, prefix);
        return lines.join('\n');
    };

    const jsonToSexpr = (obj: any): string => {
        const convert = (data: any): string => {
            if (Array.isArray(data)) {
                return `(${data.map(convert).join(' ')})`;
            } else if (typeof data === 'object' && data !== null) {
                const pairs = Object.entries(data).map(([k, v]) => `(${k} ${convert(v)})`);
                return `(${pairs.join(' ')})`;
            } else if (typeof data === 'string') {
                return `"${data}"`;
            } else {
                return String(data);
            }
        };
        return convert(obj);
    };

    useEffect(() => {
        serialize();
    }, []);

    return (
        <>
            <WebVitals />
            <main className='relative min-h-screen bg-[#fafbff] overflow-hidden selection:bg-[var(--purple-2)] selection:text-[var(--purple-4)] flex flex-col md:flex-row'>

                {/* Mobile Header */}
                <header className='md:hidden flex items-center justify-between p-4 border-b border-[var(--border-light)] bg-white/80 backdrop-blur-md z-50'>
                    <Link href='/apps' className='text-sm font-bold uppercase tracking-widest text-muted hover:text-[var(--purple-4)]'>
                        ← Apps
                    </Link>
                </header>

                {/* Sidebar */}
                <aside className='hidden md:flex flex-col w-80 h-screen border-r border-[var(--border-light)] bg-white/50 backdrop-blur-xl z-20 sticky top-0'>
                    <div className='p-6 border-b border-[var(--border-light)]'>
                        <div className='flex items-center gap-3 mb-6'>
                            <div className='w-3 h-3 rounded-full bg-[var(--purple-4)]' />
                            <span className='font-bold uppercase tracking-widest text-sm text-[var(--fg-4)]'>LLM Serialization</span>
                        </div>
                        <nav className='flex flex-col gap-2'>
                            <Link href='/apps' className='text-xs font-bold uppercase tracking-wider text-muted hover:text-[var(--purple-4)] transition-colors flex items-center gap-2'>
                                <span>←</span> Back to Apps
                            </Link>
                        </nav>
                    </div>

                    <div className='flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar'>
                        <div>
                            <h3 className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4'>Input JSON</h3>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className='w-full h-64 p-4 bg-white border border-[var(--border-light)] rounded-2xl text-xs font-mono focus:ring-2 focus:ring-[var(--purple-1)] focus:border-[var(--purple-4)] outline-none transition-all resize-none shadow-sm'
                                placeholder='Paste JSON here...'
                            />
                        </div>

                        <button
                            onClick={serialize}
                            className='w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-[var(--purple-4)] text-white shadow-lg shadow-indigo-100 hover:bg-[#5b2ee0] active:scale-[0.98] transition-all'
                        >
                            Serialize
                        </button>

                        {error && (
                            <div className='p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600'>
                                {error}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <div className='flex-grow overflow-auto p-6'>
                    <div className='max-w-6xl mx-auto'>
                        <div className='mb-8'>
                            <h1 className='text-3xl font-bold text-[var(--fg-4)] mb-2'>LLM Serialization Comparison</h1>
                            <p className='text-muted'>Compare token efficiency across different serialization formats</p>
                        </div>

                        {/* Mobile Input */}
                        <div className='md:hidden mb-6'>
                            <div className='bg-white p-4 rounded-xl border border-[var(--border-light)] shadow-sm space-y-3'>
                                <label className='text-[10px] font-bold text-muted uppercase tracking-wider'>Input JSON</label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className='w-full h-32 p-3 bg-[var(--bg-2)] border border-[var(--border-light)] rounded-lg text-xs font-mono outline-none transition-all resize-none'
                                    placeholder='Paste JSON here...'
                                />
                                <button
                                    onClick={serialize}
                                    className='w-full py-3 bg-[var(--purple-4)] text-white rounded-lg font-bold uppercase tracking-widest text-xs shadow-lg'
                                >
                                    Serialize
                                </button>
                            </div>
                        </div>

                        {/* Results Table */}
                        {results.length > 0 && (
                            <div className='bg-white rounded-2xl border border-[var(--border-light)] shadow-sm overflow-hidden mb-6'>
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead className='bg-[var(--bg-2)] border-b border-[var(--border-light)]'>
                                            <tr>
                                                <th className='text-left p-4 text-xs font-bold uppercase tracking-wider text-muted'>Rank</th>
                                                <th className='text-left p-4 text-xs font-bold uppercase tracking-wider text-muted'>Format</th>
                                                <th className='text-right p-4 text-xs font-bold uppercase tracking-wider text-muted'>Tokens</th>
                                                <th className='text-right p-4 text-xs font-bold uppercase tracking-wider text-muted'>Bytes</th>
                                                <th className='text-right p-4 text-xs font-bold uppercase tracking-wider text-muted'>vs Baseline</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((result, idx) => (
                                                <tr
                                                    key={result.format}
                                                    className='border-b border-[var(--border-light)] last:border-0 hover:bg-[var(--bg-1)] transition-colors cursor-pointer'
                                                    onClick={() => toggleExpand(result.format)}
                                                >
                                                    <td className='p-4'>
                                                        {idx === 0 ? (
                                                            <span className='inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--purple-4)] text-white text-xs font-bold'>
                                                                🏆
                                                            </span>
                                                        ) : (
                                                            <span className='text-sm text-muted font-bold'>#{idx + 1}</span>
                                                        )}
                                                    </td>
                                                    <td className='p-4'>
                                                        <span className='text-sm font-bold text-[var(--fg-4)]'>{result.format}</span>
                                                    </td>
                                                    <td className='p-4 text-right'>
                                                        <span className='text-sm font-mono text-[var(--fg-4)]'>{result.tokens.toLocaleString()}</span>
                                                    </td>
                                                    <td className='p-4 text-right'>
                                                        <span className='text-sm font-mono text-muted'>{result.bytes.toLocaleString()}</span>
                                                    </td>
                                                    <td className='p-4 text-right'>
                                                        <span className={`text-sm font-bold ${result.savings > 0 ? 'text-green-600' : result.savings < 0 ? 'text-red-600' : 'text-muted'}`}>
                                                            {result.savings > 0 ? '-' : result.savings < 0 ? '+' : ''}{Math.abs(result.savings).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Output Preview */}
                        {results.length > 0 && (
                            <div className='space-y-4'>
                                <h2 className='text-lg font-bold text-[var(--fg-4)]'>Output Preview (Click to expand)</h2>
                                {results.map((result) => (
                                    <div key={result.format} className='bg-white rounded-xl border border-[var(--border-light)] overflow-hidden'>
                                        <div
                                            className='bg-[var(--bg-2)] px-4 py-3 border-b border-[var(--border-light)] cursor-pointer hover:bg-[var(--bg-1)] transition-colors flex items-center justify-between'
                                            onClick={() => toggleExpand(result.format)}
                                        >
                                            <span className='text-xs font-bold uppercase tracking-wider text-[var(--fg-4)]'>{result.format}</span>
                                            <span className='text-xs text-muted'>{expandedFormats.includes(result.format) ? '▼' : '▶'}</span>
                                        </div>
                                        {expandedFormats.includes(result.format) && (
                                            <div className='p-4 max-h-96 overflow-auto custom-scrollbar'>
                                                <SyntaxHighlighter
                                                    language={result.language}
                                                    style={vscDarkPlus}
                                                    customStyle={{
                                                        margin: 0,
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                    }}
                                                    wrapLongLines
                                                >
                                                    {result.output}
                                                </SyntaxHighlighter>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
