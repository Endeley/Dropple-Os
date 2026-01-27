'use client';

/**
 * UXRiskImpactPanel
 *
 * Passive risk & impact awareness.
 * Read-only. No enforcement.
 */

import { useMemo } from 'react';
import { getUXAuditLog } from '@/runtime/dispatcher/ux/uxAuditLog';

export function UXRiskImpactPanel() {
    const auditEntries = useMemo(() => {
        try {
            return getUXAuditLog() ?? [];
        } catch {
            return [];
        }
    }, []);

    const recentWarnings = auditEntries.filter(
        (entry) => entry.level === 'warn' || entry.level === 'confirm'
    );

    return (
        <section style={{ padding: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Risk & Impact
            </h3>

            {recentWarnings.length === 0 ? (
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                    No known risks detected
                </div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {recentWarnings.map((entry, i) => (
                        <li
                            key={i}
                            style={{
                                fontSize: 12,
                                padding: '6px 0',
                                borderBottom: '1px solid #eee',
                            }}>
                            <div style={{ fontWeight: 500 }}>
                                {entry.reason ?? 'Risk detected'}
                            </div>
                            <div style={{ opacity: 0.6 }}>
                                Tier {entry.tier ?? '?'} • {entry.intent}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
