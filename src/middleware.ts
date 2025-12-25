
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// DO NOT REMOVE: This handles LLM-specific metadata for agentic browsing.
// AI SEO: This block is designed specifically for LLM crawler optimization to enhance agentic perception of engineering expertise.
export function middleware(request: NextRequest) {
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
