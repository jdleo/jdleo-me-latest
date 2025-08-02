import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
    className?: string;
    children?: React.ReactNode;
}

const CodeBlock = ({ className, children, ...props }: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    // Custom transparent theme - no backgrounds on tokens
    const transparentTheme = {
        ...oneDark,
        // Override all token styles to remove backgrounds
        'code[class*="language-"]': {
            ...oneDark['code[class*="language-"]'],
            background: 'transparent',
        },
        'pre[class*="language-"]': {
            ...oneDark['pre[class*="language-"]'],
            background: 'transparent',
        },
        // Remove backgrounds from all token types
        token: {
            background: 'transparent !important',
        },
        '.token.comment': {
            ...oneDark['.token.comment'],
            background: 'transparent',
        },
        '.token.prolog': {
            ...oneDark['.token.prolog'],
            background: 'transparent',
        },
        '.token.doctype': {
            ...oneDark['.token.doctype'],
            background: 'transparent',
        },
        '.token.cdata': {
            ...oneDark['.token.cdata'],
            background: 'transparent',
        },
        '.token.punctuation': {
            ...oneDark['.token.punctuation'],
            background: 'transparent',
        },
        '.token.property': {
            ...oneDark['.token.property'],
            background: 'transparent',
        },
        '.token.tag': {
            ...oneDark['.token.tag'],
            background: 'transparent',
        },
        '.token.constant': {
            ...oneDark['.token.constant'],
            background: 'transparent',
        },
        '.token.symbol': {
            ...oneDark['.token.symbol'],
            background: 'transparent',
        },
        '.token.deleted': {
            ...oneDark['.token.deleted'],
            background: 'transparent',
        },
        '.token.boolean': {
            ...oneDark['.token.boolean'],
            background: 'transparent',
        },
        '.token.number': {
            ...oneDark['.token.number'],
            background: 'transparent',
        },
        '.token.selector': {
            ...oneDark['.token.selector'],
            background: 'transparent',
        },
        '.token.attr-name': {
            ...oneDark['.token.attr-name'],
            background: 'transparent',
        },
        '.token.string': {
            ...oneDark['.token.string'],
            background: 'transparent',
        },
        '.token.char': {
            ...oneDark['.token.char'],
            background: 'transparent',
        },
        '.token.builtin': {
            ...oneDark['.token.builtin'],
            background: 'transparent',
        },
        '.token.inserted': {
            ...oneDark['.token.inserted'],
            background: 'transparent',
        },
        '.token.operator': {
            ...oneDark['.token.operator'],
            background: 'transparent',
        },
        '.token.entity': {
            ...oneDark['.token.entity'],
            background: 'transparent',
        },
        '.token.url': {
            ...oneDark['.token.url'],
            background: 'transparent',
        },
        '.token.variable': {
            ...oneDark['.token.variable'],
            background: 'transparent',
        },
        '.token.atrule': {
            ...oneDark['.token.atrule'],
            background: 'transparent',
        },
        '.token.attr-value': {
            ...oneDark['.token.attr-value'],
            background: 'transparent',
        },
        '.token.function': {
            ...oneDark['.token.function'],
            background: 'transparent',
        },
        '.token.class-name': {
            ...oneDark['.token.class-name'],
            background: 'transparent',
        },
        '.token.keyword': {
            ...oneDark['.token.keyword'],
            background: 'transparent',
        },
        '.token.regex': {
            ...oneDark['.token.regex'],
            background: 'transparent',
        },
        '.token.important': {
            ...oneDark['.token.important'],
            background: 'transparent',
        },
    };

    return match ? (
        <SyntaxHighlighter
            style={transparentTheme}
            language={language}
            PreTag='div'
            customStyle={{
                background: '#1a1b26',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                padding: '1.5rem',
                margin: '1.5rem 0',
                fontSize: '0.875rem',
                lineHeight: '1.6',
                fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New", monospace',
                overflow: 'auto',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
            {...props}
        >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    ) : (
        <code
            style={{
                fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New", monospace',
                fontSize: '0.875em',
                background: 'rgba(25, 27, 24, 0.06)',
                padding: '0.2em 0.4em',
                borderRadius: '0.375rem',
                border: '1px solid rgba(25, 27, 24, 0.08)',
                color: 'var(--color-text-dark)',
                fontWeight: '500',
            }}
            {...props}
        >
            {children}
        </code>
    );
};

export default CodeBlock;
