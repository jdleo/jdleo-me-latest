import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const CodeBlock = ({ inline, className, children, ...props }: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    return !inline && match ? (
        <div className='relative rounded-xl overflow-hidden my-6 border border-[var(--gray-4)] shadow-sm bg-[#1e1e2e]'>
            <div className='absolute top-0 right-0 px-3 py-1 bg-white/5 rounded-bl-lg border-b border-l border-white/5 z-10'>
                <span className='text-[10px] font-mono text-white/30 uppercase tracking-widest'>{language}</span>
            </div>
            <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                customStyle={{
                    margin: 0,
                    background: 'transparent',
                    padding: '1.5rem',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    fontFamily: 'var(--font-family-mono)',
                }}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className='bg-[var(--purple-1)] text-[var(--purple-4)] px-1.5 py-0.5 rounded-md text-[0.9em] font-mono border border-[var(--purple-2)] align-middle' {...props}>
            {children}
        </code>
    );
};

export default CodeBlock;
