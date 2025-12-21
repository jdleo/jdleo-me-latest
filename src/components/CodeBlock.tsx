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
        <div className='relative rounded-lg overflow-hidden bg-[#0D0D0E] border border-[var(--color-border)] my-4'>
            {language && (
                <div className='flex items-center justify-between px-4 py-1.5 bg-black/40 border-b border-[var(--color-border)]'>
                    <span className='text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider'>{language}</span>
                </div>
            )}
            <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag='div'
                customStyle={{
                    margin: 0,
                    background: 'transparent',
                    padding: '1.25rem',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                }}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className='bg-white/5 text-[var(--color-accent-blue)] px-1.5 py-0.5 rounded text-sm font-mono' {...props}>
            {children}
        </code>
    );
};

export default CodeBlock;
