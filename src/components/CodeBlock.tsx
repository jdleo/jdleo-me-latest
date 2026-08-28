import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const CodeBlock = ({ inline, className, children, ...props }: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    return !inline && match ? (
        <div className='markdown-code-block relative rounded-xl overflow-hidden my-6 bg-[#f4f4ee] border border-[#e2e2da]'>
            <div className='markdown-code-label absolute top-3 right-3 px-2 py-1 bg-black/5 rounded text-[10px] font-mono text-[#82827c] uppercase tracking-wider'>
                {language}
            </div>
            <SyntaxHighlighter
                style={oneLight}
                language={language}
                PreTag="div"
                showLineNumbers={false}
                wrapLines={false}
                customStyle={{
                    margin: 0,
                    background: 'transparent',
                    padding: '1.5rem',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                }}
                codeTagProps={{
                    style: {
                        background: 'transparent',
                        fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                    }
                }}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code
            className='markdown-inline-code bg-[rgba(17,17,16,0.05)] text-[#111110] px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-[rgba(17,17,16,0.1)]'
            {...props}
        >
            {children}
        </code>
    );
};

export default CodeBlock;
