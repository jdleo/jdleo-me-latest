import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import crypto from 'crypto';

// Custom alphabet: lowercase, uppercase, and digits only (no special chars)
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 5);

// URL validation function with forced HTTPS and regex validation
function isValidUrl(url: string): boolean {
    try {
        // First, check for obvious malicious patterns
        const maliciousPatterns = [
            /<script/i,
            /javascript:/i,
            /data:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /onclick=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /\.\./, // directory traversal
            /%2e%2e/i, // encoded directory traversal
        ];

        if (maliciousPatterns.some(pattern => pattern.test(url))) {
            return false;
        }

        // Basic URL regex pattern (more comprehensive than URL constructor)
        const urlRegex =
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;

        if (!urlRegex.test(url)) {
            return false;
        }

        // Add protocol if missing for URL constructor
        let urlWithProtocol = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            urlWithProtocol = 'https://' + url;
        }

        let parsedUrl = new URL(urlWithProtocol);

        // Force HTTPS - if protocol is http, we'll convert it later
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return false;
        }

        // Prevent localhost and private IP addresses
        const hostname = parsedUrl.hostname.toLowerCase();

        // Check for IP addresses
        const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
        if (ipRegex.test(hostname)) {
            const parts = hostname.split('.').map(Number);
            // Check for localhost and private IP ranges
            if (
                parts[0] === 127 || // localhost
                parts[0] === 10 || // 10.0.0.0/8
                (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
                (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
                (parts[0] === 169 && parts[1] === 254) || // link-local
                parts[0] >= 224 // multicast and reserved
            ) {
                return false;
            }
        }

        // Check for excessive length (prevent DoS)
        if (url.length > 2048) {
            return false;
        }

        // Check hostname length
        if (hostname.length > 253 || hostname.length === 0) {
            return false;
        }

        // Check for valid domain structure
        const domainParts = hostname.split('.');
        if (domainParts.length < 2) {
            // Allow localhost for development, but block it in production if necessary
            // Actually, the IP check already handles 127.0.0.1
            if (hostname !== 'localhost') {
                return false; // Must have at least domain.tld
            }
        }

        // Prevent circular links (blocking own domain and subdomains)
        const blockedDomains = ['jdleo.me', 'link.fyi', 'localhost'];
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (siteUrl) {
            try {
                const siteHostname = new URL(siteUrl).hostname.toLowerCase();
                if (!blockedDomains.includes(siteHostname)) {
                    blockedDomains.push(siteHostname);
                }
            } catch (e) {
                // Ignore invalid NEXT_PUBLIC_SITE_URL
            }
        }

        if (blockedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
            return false;
        }

        // Check each domain part
        for (const part of domainParts) {
            if (part.length === 0 || part.length > 63) {
                if (hostname === 'localhost') continue; // Skip length check for localhost
                return false;
            }
            // Domain parts can only contain letters, numbers, and hyphens
            if (!/^[a-zA-Z0-9-]+$/.test(part)) {
                return false;
            }
            // Cannot start or end with hyphen
            if (part.startsWith('-') || part.endsWith('-')) {
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
}

// Function to normalize URL (force HTTPS if not provided)
function normalizeUrl(url: string): string {
    try {
        // If URL doesn't start with protocol, add https://
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        return url;
    } catch {
        return url;
    }
}

// Hash password with SHA-256
function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate secure password
function generateSecurePassword(): string {
    return nanoid(16);
}

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        // Validate input
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const trimmedUrl = url.trim();

        // Validate URL format and security
        if (!isValidUrl(trimmedUrl)) {
            return NextResponse.json(
                {
                    error: 'Invalid URL. Please provide a valid HTTP/HTTPS URL.',
                },
                { status: 400 }
            );
        }

        // Normalize URL (force HTTPS)
        const cleanUrl = normalizeUrl(trimmedUrl);

        // Generate unique ID and password
        let linkId: string;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            linkId = nanoid();
            attempts++;

            // Check if ID already exists
            const { rows } = await sql`
                SELECT id FROM links WHERE id = ${linkId}
            `;

            if (rows.length === 0) {
                break; // ID is unique
            }

            if (attempts >= maxAttempts) {
                return NextResponse.json(
                    {
                        error: 'Failed to generate unique link ID. Please try again.',
                    },
                    { status: 500 }
                );
            }
        } while (true);

        // Generate and hash password
        const rawPassword = generateSecurePassword();
        const hashedPassword = hashPassword(rawPassword);

        // Insert new link
        await sql`
            INSERT INTO links (id, url, password)
            VALUES (${linkId}, ${cleanUrl}, ${hashedPassword})
        `;

        const shortenedUrl = `jdleo.me/x/${linkId}`;

        return NextResponse.json({
            success: true,
            id: linkId,
            url: cleanUrl,
            password: rawPassword, // Return raw password to user
            shortenedUrl,
        });
    } catch (error) {
        console.error('Link shortening error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            {
                error: 'Failed to create shortened link. Please try again.',
            },
            { status: 500 }
        );
    }
}

// Analytics endpoint
export async function PUT(req: Request) {
    try {
        const { password } = await req.json();

        if (!password || typeof password !== 'string') {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        // Hash the provided password for comparison
        const hashedPassword = hashPassword(password);

        // Find link by password hash
        const { rows: links } = await sql`
            SELECT id, url FROM links WHERE password = ${hashedPassword}
        `;

        if (links.length === 0) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        const link = links[0];

        // Get visit data for the last 30 days
        const { rows: visitData } = await sql`
            SELECT visit_date, visit_count
            FROM link_visits
            WHERE link_id = ${link.id}
            AND visit_date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY visit_date ASC
        `;

        // Calculate total visits
        const totalVisits = visitData.reduce((sum, day) => sum + day.visit_count, 0);

        // Get daily average
        const dailyAverage = Math.round(totalVisits / 30);

        // Get peak day
        const peakDay = visitData.length > 0 ? Math.max(...visitData.map(day => day.visit_count)) : 0;

        return NextResponse.json({
            success: true,
            linkId: link.id,
            url: link.url,
            totalVisits,
            dailyAverage,
            peakDay,
            visitData: visitData.map(day => ({
                date: day.visit_date,
                clicks: day.visit_count,
            })),
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        console.error('Analytics error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            {
                error: 'Failed to fetch analytics. Please try again.',
            },
            { status: 500 }
        );
    }
}
