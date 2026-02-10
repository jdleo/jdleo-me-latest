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
        <div className='relative rounded-lg overflow-hidden my-6 bg-[#fafafa] border border-gray-200'>
            <div className='absolute top-3 right-3 px-2 py-1 bg-black/5 rounded text-[10px] font-mono text-gray-500 uppercase tracking-wider'>
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
                    fontFamily: 'var(--font-family-mono)',
                }}
                codeTagProps={{
                    style: {
                        background: 'transparent',
                        fontFamily: 'var(--font-family-mono)',
                    }
                }}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className='bg-[var(--purple-1)] text-[var(--purple-4)] px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-[var(--purple-2)]' {...props}>
            {children}
        </code>
    );
};

export default CodeBlock;
