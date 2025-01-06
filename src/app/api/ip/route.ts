import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // get real ip from headers (works on vercel and most hosts)
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

        // fetch ip info from ipapi.co (free, no api key needed)
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();

        return NextResponse.json({
            ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            postal: data.postal,
            latitude: data.latitude,
            longitude: data.longitude,
            timezone: data.timezone,
            org: data.org,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch IP info' }, { status: 500 });
    }
}
