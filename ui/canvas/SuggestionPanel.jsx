'use client';

import { useMemo } from 'react';
import { useSuggestions } from '@/ui/canvas/suggestions/useSuggestions.js';
import { SuggestionCard, sortSuggestions } from '@/ui/canvas/SuggestionCard.jsx';

const MAX_SUGGESTIONS = 6;

export function SuggestionPanel({ visible = false }) {
    const suggestions = useSuggestions();
    const sorted = useMemo(() => sortSuggestions(suggestions), [suggestions]);
    const grouped = useMemo(() => groupSuggestions(sorted), [sorted]);
    const visibleSuggestions = grouped.items.slice(0, MAX_SUGGESTIONS);
    const hiddenCount = Math.max(0, sorted.length - visibleSuggestions.length);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'absolute',
                right: 16,
                top: 64,
                width: 320,
                display: 'grid',
                gap: 10,
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(226,232,240,0.2)',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#e2e8f0',
                    fontSize: 12,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <span>Suggestions</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                    Validation Issues
                </span>
            </div>
            {grouped.sections.map((section) => {
                const sectionItems = visibleSuggestions.filter((item) =>
                    section.filter(item)
                );
                if (!sectionItems.length) return null;
                return (
                    <div key={section.title} style={{ display: 'grid', gap: 8 }}>
                        <div
                            style={{
                                fontSize: 11,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: 0.6,
                            }}
                        >
                            {section.title}
                        </div>
                        {sectionItems.map((suggestion) => (
                            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                        ))}
                    </div>
                );
            })}
            {hiddenCount > 0 && (
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    +{hiddenCount} more
                </div>
            )}
        </div>
    );
}

function groupSuggestions(list = []) {
    const sections = [
        {
            title: 'UX Issues',
            filter: (item) => item.kind?.startsWith('VALIDATION_'),
        },
        {
            title: 'Layout Suggestions',
            filter: (item) => item.kind === 'SNAP_AVAILABLE' || item.kind === 'ALIGN_ELEMENTS',
        },
        {
            title: 'Context Notices',
            filter: (item) => item.kind === 'DENSITY_NOTICE' || item.kind === 'EMPTY_VIEWPORT',
        },
    ];

    return { sections, items: list };
}
