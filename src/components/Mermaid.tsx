import mermaid from 'mermaid';
import { useEffect } from 'react';

mermaid.initialize({
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
        primaryColor: '#3EAF7C', // Match terminal accent
        primaryTextColor: '#E4E4E5', // Match --color-text
        primaryBorderColor: '#3EAF7C',
        lineColor: '#E4E4E5',
        secondaryColor: '#141416',
        tertiaryColor: '#0A0A0B',
        textColor: '#E4E4E5',
        mainBkg: 'rgba(255, 255, 255, 0.03)', // Subtle background for nodes
        nodeBorder: 'rgba(255, 255, 255, 0.2)',
        clusterBkg: 'rgba(255, 255, 255, 0.05)',
        clusterBorder: 'rgba(255, 255, 255, 0.2)',
        titleColor: '#3EAF7C',
        edgeLabelBackground: '#141416',
    },
    fontFamily: 'var(--font-terminal)',
    fontSize: 14,
    flowchart: {
        htmlLabels: true,
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

const Mermaid = ({ chart, id }: { chart: string; id: string }) => {
    useEffect(() => {
        const el = document.getElementById(id);
        if (el) {
            el.removeAttribute('data-processed');
            mermaid.contentLoaded();
        }
    }, [chart, id]);

    return (
        <div className='mermaid-container w-full overflow-auto flex justify-center py-4'>
            <div
                className='mermaid'
                id={id}
                style={{
                    color: 'var(--color-text)',
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
