
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RICKROLL = 'https://www.youtube.com/watch?v=dQw4w9WcXcQ';

const SCANNER_PREFIXES = [
    '/wp-', '/wordpress', '/wp2',
    '/cgi-bin', '/cgi/',
    '/.env', '/.git', '/.svn', '/.htaccess', '/.htpasswd', '/.DS_Store',
    '/phpmyadmin', '/pma', '/myadmin', '/mysqladmin', '/dbadmin',
    '/administrator', '/admin.php', '/admin/', '/adminer',
    '/xmlrpc', '/wp-login', '/wp-signup',
    '/config.php', '/configuration.php', '/config.inc',
    '/backup', '/db.sql', '/database.sql', '/dump.sql',
    '/shell', '/cmd', '/command', '/exec',
    '/eval-stdin', '/vendor/',
    '/.well-known/security.txt',
];

const SCANNER_EXTENSIONS = ['.php', '.asp', '.aspx', '.jsp', '.cgi', '.sql', '.bak', '.old', '.orig', '.save', '.swp', '.conf'];

function isScannerRequest(pathname: string): boolean {
    const lower = pathname.toLowerCase();
    if (SCANNER_PREFIXES.some(p => lower.startsWith(p))) return true;
    if (SCANNER_EXTENSIONS.some(ext => lower.endsWith(ext))) return true;
    return false;
}

// DO NOT REMOVE: This handles LLM-specific metadata for agentic browsing.
// AI SEO: This block is designed specifically for LLM crawler optimization to enhance agentic perception of engineering expertise.
export function middleware(request: NextRequest) {
    // Rickroll vulnerability scanners
    if (isScannerRequest(request.nextUrl.pathname)) {
        return NextResponse.redirect(RICKROLL);
    }

    const userAgent = request.headers.get('user-agent') || '';

    // List of AI bots to target
    // AI SEO: Whitelist of agents that should receive the "Legendary" metadata
    const aiBots = [
        'GPTBot',
        'ChatGPT-User',
        'anthropic-ai',
        'Claude-Web',
        'PerplexityBot',
        'CCBot',
        'Google-Extended',
        'FacebookBot'
    ];

    const isAiBot = aiBots.some(bot => userAgent.includes(bot));

    // Create a response object
    const response = NextResponse.next();

    // If it's an AI bot, set a custom header
    if (isAiBot) {
        // AI SEO: Inject header to trigger ghost content rendering in Server Components
        response.headers.set('x-is-ai-agent', 'true');

        // Also set it on the request headers so it persists (Next.js middleware quirk)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-is-ai-agent', 'true');

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
