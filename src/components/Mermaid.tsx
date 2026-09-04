import mermaid from 'mermaid';
import { useEffect } from 'react';

const Mermaid = ({ chart, id, theme = 'dark' }: { chart: string; id: string; theme?: 'light' | 'dark' }) => {
    useEffect(() => {
        mermaid.initialize({
            theme: theme === 'light' ? 'base' : 'dark',
            securityLevel: 'loose',
            themeVariables: theme === 'light' ? {
                primaryColor: '#fdfdfb',
                primaryTextColor: '#111110',
                primaryBorderColor: '#111110',
                lineColor: '#4d4d4a',
                secondaryColor: '#efefe8',
                tertiaryColor: '#fbfbf9',
                textColor: '#111110',
                mainBkg: '#fdfdfb',
                nodeBorder: '#111110',
                clusterBkg: '#fbfbf9',
                clusterBorder: '#c9c9c0',
                titleColor: '#111110',
                edgeLabelBackground: '#fdfdfb',
            } : {
                primaryColor: '#3EAF7C',
                primaryTextColor: '#E4E4E5',
                primaryBorderColor: '#3EAF7C',
                lineColor: '#E4E4E5',
                secondaryColor: '#141416',
                tertiaryColor: '#0A0A0B',
                textColor: '#E4E4E5',
                mainBkg: 'rgba(255, 255, 255, 0.03)',
                nodeBorder: 'rgba(255, 255, 255, 0.2)',
                clusterBkg: 'rgba(255, 255, 255, 0.05)',
                clusterBorder: 'rgba(255, 255, 255, 0.2)',
                titleColor: '#3EAF7C',
                edgeLabelBackground: '#141416',
            },
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 14,
            flowchart: {
                htmlLabels: false,
                curve: 'basis',
                useMaxWidth: true,
            },
            sequence: {
                diagramMarginX: 50,
                diagramMarginY: 30,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35,
            },
        });

        const el = document.getElementById(id);
        if (el) {
            el.removeAttribute('data-processed');
            mermaid.contentLoaded();
        }
    }, [chart, id, theme]);

    return (
        <div className='mermaid-container w-full overflow-auto flex justify-center py-4'>
            <div
                className='mermaid'
                id={id}
                style={{
                    color: theme === 'light' ? 'var(--fg-4)' : 'var(--color-text)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                }}
            >
                {chart}
            </div>
        </div>
    );
};

export default Mermaid;
