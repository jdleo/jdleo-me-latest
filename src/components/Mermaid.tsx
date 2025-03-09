import mermaid from 'mermaid';
import { useEffect } from 'react';

mermaid.initialize({
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
        primaryColor: '#5e6ad2',
        primaryTextColor: '#f7f8f8',
        primaryBorderColor: '#5e6ad2',
        lineColor: '#f7f8f8',
        secondaryColor: '#1c1c27',
        tertiaryColor: '#0a0a16',
        textColor: '#f7f8f8',
        mainBkg: 'transparent',
        nodeBorder: '#5e6ad2',
        clusterBkg: 'transparent',
        clusterBorder: '#5e6ad2',
        titleColor: '#f7f8f8',
        edgeLabelBackground: '#1c1c27',
    },
    fontFamily: 'Inter, sans-serif',
    fontSize: 16,
    flowchart: {
        htmlLabels: true,
        curve: 'basis',
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
        document.getElementById(id)?.removeAttribute('data-processed');
        mermaid.contentLoaded();
    }, [chart, id]);

    return (
        <div className='glass-card p-6 rounded-xl overflow-hidden' style={{ backgroundColor: 'rgba(10, 10, 22, 0.7)' }}>
            <div
                className='mermaid'
                id={id}
                style={{
                    color: 'var(--foreground)',
                    fontSize: '16px',
                    lineHeight: '1.5',
                }}
            >
                {chart}
            </div>
        </div>
    );
};

export default Mermaid;
