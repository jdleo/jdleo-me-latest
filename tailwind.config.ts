import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                muted: 'var(--muted)',
                accent: 'var(--accent)',
                'accent-foreground': 'var(--accent-foreground)',
                border: 'var(--border)',
                card: 'var(--card)',
                'card-foreground': 'var(--card-foreground)',
                primary: 'var(--primary)',
                'primary-foreground': 'var(--primary-foreground)',
                secondary: 'var(--secondary)',
                'secondary-foreground': 'var(--secondary-foreground)',
                destructive: 'var(--destructive)',
                'destructive-foreground': 'var(--destructive-foreground)',
                ring: 'var(--ring)',
                'orbital-glow-1': 'var(--orbital-glow-1)',
                'orbital-glow-2': 'var(--orbital-glow-2)',
                'orbital-glow-3': 'var(--orbital-glow-3)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
            animation: {
                'spin-slow': 'spin-slow 15s linear infinite',
                'spin-reverse': 'spin-reverse 12s linear infinite',
                'pulse-slow': 'pulse 4s ease-in-out infinite',
                float: 'float 6s ease-in-out infinite',
                glow: 'glow 5s ease-in-out infinite',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-linear': 'linear-gradient(var(--tw-gradient-stops))',
                'orbital-grid':
                    'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            },
            boxShadow: {
                'orbital-glow': '0 0 30px var(--orbital-glow-1), 0 0 60px var(--orbital-glow-2)',
                'orbital-glow-sm': '0 0 15px var(--orbital-glow-1), 0 0 30px var(--orbital-glow-2)',
                'orbital-glow-lg':
                    '0 0 50px var(--orbital-glow-1), 0 0 100px var(--orbital-glow-2), 0 0 150px var(--orbital-glow-3)',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        plugin(function ({ addBase, theme }) {
            addBase({
                ':root': {
                    '--background': '#000212',
                    '--foreground': '#f7f8f8',
                    '--muted': '#8a8f98',
                    '--accent': '#5e6ad2',
                    '--accent-foreground': '#ffffff',
                    '--border': '#26282e',
                    '--card': '#0a0a16',
                    '--card-foreground': '#f7f8f8',
                    '--primary': '#5e6ad2',
                    '--primary-foreground': '#ffffff',
                    '--secondary': '#1c1c27',
                    '--secondary-foreground': '#f7f8f8',
                    '--destructive': '#ef4444',
                    '--destructive-foreground': '#ffffff',
                    '--ring': '#5e6ad2',
                    '--orbital-glow-1': 'rgba(94, 106, 210, 0.5)',
                    '--orbital-glow-2': 'rgba(125, 211, 252, 0.5)',
                    '--orbital-glow-3': 'rgba(167, 139, 250, 0.5)',
                },
            });
        }),
    ],
};

export default config;
