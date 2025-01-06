'use client';

import Link from 'next/link';
import { strings } from '../../constants/strings';
import { useState, useEffect } from 'react'; // add useEffect
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // dark theme
import 'prismjs/components/prism-json'; // json support

// THIS works in browser
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

export default function Parser() {
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (parsedData) {
            Prism.highlightAll();
        }
    }, [parsedData]);

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            setLoading(true);
            setError(null);

            // get text from PDF
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + ' ';
            }

            // send text to API
            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: fullText }),
            });

            const data = await response.json();
            setParsedData(JSON.stringify(data, null, 2));
        } catch (err) {
            setError('Failed to parse PDF. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 1,
    });

    return (
        <div className='flex min-h-screen bg-[#1d1d1d]'>
            <header className='absolute top-0 right-0 p-4'>
                <nav className='flex gap-4 text-white/70 font-nunito'>
                    <Link href='/apps'>Apps</Link>
                    <a href={`mailto:${strings.EMAIL}`}>Email</a>
                    <a href={strings.LINKEDIN_URL}>LinkedIn</a>
                    <a href={strings.GITHUB_URL}>GitHub</a>
                </nav>
            </header>

            <main className='flex-1 flex flex-col items-center pt-20 px-4 pb-8'>
                <h1 className='text-white/90 font-nunito text-2xl mb-2'>Resume Parser</h1>
                <p className='text-white/60 font-nunito mb-8 text-center max-w-md'>
                    Upload a PDF resume to extract and parse its contents.
                </p>

                <div
                    {...getRootProps()}
                    className={`
                        w-full max-w-[600px] p-8 rounded-xl
                        backdrop-blur-md shadow-xl cursor-pointer
                        border-2 border-dashed transition-all
                        ${
                            isDragActive
                                ? 'border-purple-400/50 bg-white/10'
                                : 'border-white/10 hover:border-white/20 bg-white/5'
                        }
                    `}
                >
                    <input {...getInputProps()} />
                    <div className='text-center'>
                        <p className='text-white/60 font-nunito'>
                            {isDragActive ? 'Drop your resume here...' : 'Drag & drop your resume, or click to select'}
                        </p>
                        <p className='text-white/40 text-sm mt-2'>Only PDF files are accepted</p>
                    </div>
                </div>

                {error && <div className='mt-6 text-red-400 font-nunito'>{error}</div>}

                {loading && <div className='mt-6 text-white/60 font-nunito'>Processing...</div>}

                {parsedData && (
                    <div className='mt-6 w-full max-w-[600px]'>
                        <pre
                            className='w-full p-4 rounded-xl bg-black/20 backdrop-blur-sm
                               border border-white/10 text-white/80 font-mono text-sm
                               overflow-x-auto whitespace-pre-wrap'
                        >
                            <code className='language-json'>{parsedData}</code>
                        </pre>
                    </div>
                )}
            </main>
        </div>
    );
}
