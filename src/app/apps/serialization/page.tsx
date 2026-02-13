'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { strings } from '../../constants/strings';
import { WebVitals } from '@/components/SEO/WebVitals';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    DevicePhoneMobileIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ClipboardIcon,
    TrophyIcon,
} from '@heroicons/react/24/outline';

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

    const serialize = async () => {
        setError('');
        setResults([]);

        try {
            const data = JSON.parse(input);
            const newResults: SerializationResult[] = [];

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

            const [
                toonMod,
                tonlMod,
                tronMod,
                yamlMod,
                tomlMod,
            ] = await Promise.all([
                import('@toon-format/toon'),
                import('tonl'),
                import('@tron-format/tron'),
                import('js-yaml'),
                import('@iarna/toml'),
            ]);

            try {
                const toonStr = toonMod.encode(data);
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

            try {
                const tonlStr = tonlMod.encodeSmart(data);
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

            try {
                const tronStr = tronMod.TRON.stringify(data);
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

            try {
                const yamlStr = yamlMod.default.dump(data);
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

            try {
                const tomlStr = tomlMod.stringify(data as any);
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

            newResults.sort((a, b) => a.tokens - b.tokens);
            setResults(newResults);
        } catch (e: any) {
            setError(e.message || 'Invalid JSON');
        }
    };

    useEffect(() => {
        serialize();
    }, []);

    return (
        <>
            <WebVitals />
            <main className='notion-page'>
                <header className={`notion-header ${isLoaded ? 'loaded' : ''}`}>
                    <div className='notion-nav' style={{ justifyContent: 'space-between', maxWidth: '1100px' }}>
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

                <div className={`notion-content ${isLoaded ? 'loaded' : ''}`} style={{ maxWidth: '1100px' }}>
                    <div className='notion-title-block'>
                        <h1 className='notion-title'>LLM Serialization Comparison</h1>
                        <div className='notion-subtitle'>Compare token efficiency across different serialization formats for LLM contexts</div>
                    </div>

                    <div className='notion-divider' />

                    <div className='notion-section'>
                        <div className='notion-section-title'>
                            <ChartBarIcon className='notion-section-icon' />
                            Input JSON
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className='notion-textarea'
                                placeholder='Paste JSON here...'
                                style={{ height: '200px', fontFamily: 'monospace', fontSize: '12px', width: '100%' }}
                            />
                            <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button onClick={serialize} className='notion-action-btn notion-action-primary'>
                                    <ArrowPathIcon className='notion-action-icon' />
                                    Serialize
                                </button>
                                {error && (
                                    <span style={{ color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                                        {error}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {results.length > 0 && (
                        <>
                            <div className='notion-divider' />

                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <TrophyIcon className='notion-section-icon' />
                                    Results (Sorted by Token Count)
                                </div>

                                <div className='notion-table-container' style={{ marginTop: '16px' }}>
                                    <table className='notion-table'>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '12px 16px' }}>Rank</th>
                                                <th style={{ padding: '12px 16px' }}>Format</th>
                                                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Tokens</th>
                                                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Bytes</th>
                                                <th style={{ textAlign: 'right', padding: '12px 16px' }}>vs Baseline</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((result, idx) => (
                                                <tr
                                                    key={result.format}
                                                    onClick={() => toggleExpand(result.format)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td style={{ padding: '12px 16px' }}>
                                                        {idx === 0 ? (
                                                            <span style={{ fontSize: '16px' }}>🏆</span>
                                                        ) : (
                                                            <span style={{ color: 'rgba(55, 53, 47, 0.5)' }}>#{idx + 1}</span>
                                                        )}
                                                    </td>
                                                    <td style={{ fontWeight: 500, padding: '12px 16px' }}>{result.format}</td>
                                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', padding: '12px 16px' }}>{result.tokens.toLocaleString()}</td>
                                                    <td style={{ textAlign: 'right', fontFamily: 'monospace', color: 'rgba(55, 53, 47, 0.5)', padding: '12px 16px' }}>{result.bytes.toLocaleString()}</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 600, color: result.savings > 0 ? '#059669' : result.savings < 0 ? '#dc2626' : 'rgba(55, 53, 47, 0.5)', padding: '12px 16px' }}>
                                                        {result.savings > 0 ? '-' : result.savings < 0 ? '+' : ''}{Math.abs(result.savings).toFixed(1)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className='notion-divider' />

                            <div className='notion-section'>
                                <div className='notion-section-title'>
                                    <DocumentTextIcon className='notion-section-icon' />
                                    Output Preview
                                </div>
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {results.map((result) => (
                                        <div key={result.format} className='notion-card' style={{ padding: 0, overflow: 'hidden' }}>
                                            <div
                                                onClick={() => toggleExpand(result.format)}
                                                style={{
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    backgroundColor: 'rgba(55, 53, 47, 0.03)',
                                                    borderBottom: expandedFormats.includes(result.format) ? '1px solid rgba(55, 53, 47, 0.09)' : 'none'
                                                }}
                                            >
                                                <span style={{ fontWeight: 600, fontSize: '14px' }}>{result.format}</span>
                                                {expandedFormats.includes(result.format) ? (
                                                    <ChevronDownIcon style={{ width: '16px', height: '16px', color: 'rgba(55, 53, 47, 0.5)' }} />
                                                ) : (
                                                    <ChevronRightIcon style={{ width: '16px', height: '16px', color: 'rgba(55, 53, 47, 0.5)' }} />
                                                )}
                                            </div>
                                            {expandedFormats.includes(result.format) && (
                                                <div style={{ maxHeight: '400px', overflow: 'auto', backgroundColor: '#1e1e1e' }}>
                                                    <SyntaxHighlighter
                                                        language={result.language}
                                                        style={vscDarkPlus}
                                                        customStyle={{
                                                            margin: 0,
                                                            padding: '16px',
                                                            borderRadius: 0,
                                                            fontSize: '12px',
                                                            backgroundColor: '#1e1e1e', // Force background
                                                        }}
                                                        wrapLongLines={true}
                                                    >
                                                        {result.output}
                                                    </SyntaxHighlighter>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <footer className='notion-footer'>
                        © 2026 {strings.NAME}
                    </footer>
                </div>
            </main>
        </>
    );
}
