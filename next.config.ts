import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // eslint can be so fucking exhausting
    },
};

export default nextConfig;
