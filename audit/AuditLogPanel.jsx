'use client';

// audit/AuditLogPanel.jsx

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function AuditLogPanel({ docId }) {
    const logs = useQuery(api.getAuditLogs, { docId }) ?? [];

    return (
        <div
            style={{
                padding: 8,
                fontSize: 12,
                background: 'rgba(0,0,0,0.35)',
                borderRadius: 6,
                color: '#fff',
            }}
        >
            <div style={{ opacity: 0.7, marginBottom: 6 }}>Audit Log</div>

            {logs.map((l) => (
                <div
                    key={l._id}
                    style={{
                        padding: '4px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        opacity: 0.85,
                    }}
                >
                    <div>
                        <strong>{l.actorId}</strong> — {l.action}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>
                        {l.branchId && `branch: ${l.branchId} · `}
                        {new Date(l.createdAt).toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
}
