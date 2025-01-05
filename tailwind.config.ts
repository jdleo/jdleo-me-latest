import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            fontFamily: {
                nunito: ['Nunito', 'sans-serif'],
            },
            animation: {
                morph: 'morph 8s ease-in-out infinite',
                rotate: 'rotate 8s linear infinite',
            },
            keyframes: {
                morph: {
                    '0%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
                    '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
                    '100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
                },
                rotate: {
                    '100%': { transform: 'rotate(360deg)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
