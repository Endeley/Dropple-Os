'use client';

import { useMemo } from 'react';
import { useValidationIssues } from '@/ui/canvas/validation/useValidationIssues.js';

const SEVERITY_ORDER = {
    error: 0,
    warning: 1,
    info: 2,
};

const MAX_ISSUES = 6;

export function ValidationPanel({ visible = false }) {
    const issues = useValidationIssues();
    const sorted = useMemo(() => sortIssues(issues), [issues]);
    const visibleIssues = sorted.slice(0, MAX_ISSUES);
    const hiddenCount = Math.max(0, sorted.length - visibleIssues.length);

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
                    border: '1px solid rgba(248,113,113,0.3)',
                    background: 'rgba(127, 29, 29, 0.55)',
                    color: '#fee2e2',
                    fontSize: 12,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                }}
            >
                UX Validation
            </div>
            {visibleIssues.map((issue) => (
                <div
                    key={issue.id}
                    style={{
                        border: '1px solid rgba(248,113,113,0.2)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.55)',
                        display: 'grid',
                        gap: 6,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#fee2e2' }}>
                            {issue.ruleId}
                        </div>
                        <span
                            style={{
                                fontSize: 10,
                                padding: '2px 6px',
                                borderRadius: 999,
                                border: '1px solid rgba(248,113,113,0.4)',
                                color: '#fee2e2',
                                textTransform: 'uppercase',
                                letterSpacing: 0.6,
                            }}
                        >
                            {issue.severity}
                        </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#fecaca' }}>{issue.message}</div>
                    <div style={{ fontSize: 11, color: '#fca5a5' }}>{issue.explain}</div>
                </div>
            ))}
            {hiddenCount > 0 && (
                <div style={{ fontSize: 11, color: '#fca5a5' }}>
                    +{hiddenCount} more
                </div>
            )}
        </div>
    );
}

function sortIssues(list = []) {
    return [...list].sort((a, b) => {
        const aOrder = SEVERITY_ORDER[a.severity] ?? 3;
        const bOrder = SEVERITY_ORDER[b.severity] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
        if (a.id === b.id) return 0;
        return a.id < b.id ? -1 : 1;
    });
}
