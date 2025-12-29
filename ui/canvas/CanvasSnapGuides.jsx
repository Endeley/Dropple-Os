'use client';

export default function CanvasSnapGuides({ guides }) {
    if (!guides || guides.length === 0) return null;

    return (
        <>
            {guides.map((guide) => {
                if (guide.type === 'vertical') {
                    return (
                        <div
                            key={guide.id}
                            style={{
                                position: 'absolute',
                                left: guide.x,
                                top: 0,
                                bottom: 0,
                                width: 1,
                                background: 'rgba(59,130,246,0.8)',
                                pointerEvents: 'none',
                            }}
                        />
                    );
                }

                if (guide.type === 'horizontal') {
                    return (
                        <div
                            key={guide.id}
                            style={{
                                position: 'absolute',
                                top: guide.y,
                                left: 0,
                                right: 0,
                                height: 1,
                                background: 'rgba(59,130,246,0.8)',
                                pointerEvents: 'none',
                            }}
                        />
                    );
                }

                return null;
            })}
        </>
    );
}
