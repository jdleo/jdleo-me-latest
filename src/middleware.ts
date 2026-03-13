
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RICKROLL = 'https://youtu.be/0q6yphdZhUA?si=ij56TT_N7iX1D4sv';

const POISON_URL = 'https://RNSAFFN.com/poison2/';
const POISON_RATE = 0.5;
const TIMEOUT_MS = 2000;

const poisonPatterns = [
    /GPTBot/i,
    /ClaudeBot/i,
    /Google-Extended/i,
    /Applebot-Extended/i,
    /Meta-ExternalAgent/i,
    /CCBot/i,
    /Bytespider/i,
    /cohere-ai/i,
];

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

export async function middleware(request: NextRequest) {
    // Rickroll vulnerability scanners
    if (isScannerRequest(request.nextUrl.pathname)) {
        return NextResponse.redirect(RICKROLL);
    }

    const userAgent = request.headers.get('user-agent') || '';

    // Poison training crawlers with random data (but not metadata routes)
    const noPoisonPaths = ['/robots.txt', '/sitemap.xml', '/sitemap-0.xml'];
    const isTrainingBot = poisonPatterns.some((p) => p.test(userAgent));
    if (isTrainingBot && Math.random() <= POISON_RATE && !noPoisonPaths.includes(request.nextUrl.pathname)) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const res = await fetch(POISON_URL, { signal: controller.signal });
            const data = await res.text();
            clearTimeout(timeout);

            console.log(`POISONED: path="${request.nextUrl.pathname}" UA="${userAgent}"`);

            return new NextResponse(data, {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            });
        } catch {
            clearTimeout(timeout);
        }
    }

    return NextResponse.next();
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
