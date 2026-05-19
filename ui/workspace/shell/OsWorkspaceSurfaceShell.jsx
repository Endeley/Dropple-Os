'use client';

import { useEffect, useState } from 'react';
import { readOsWorkspaceShellSurfaceModel } from '@/ui/bridges/osSurfaceReadBridge.js';

function readModel() {
    try {
        return readOsWorkspaceShellSurfaceModel();
    } catch {
        return null;
    }
}

export function OsWorkspaceSurfaceShell() {
    const [model, setModel] = useState(() => readModel());

    useEffect(() => {
        setModel(readModel());
        const timer = setInterval(() => {
            setModel(readModel());
        }, 400);
        return () => clearInterval(timer);
    }, []);

    if (!model) return null;

    return (
        <div
            aria-label='OS Surface Shell'
            style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                zIndex: 1000,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                padding: 10,
                minWidth: 260,
                fontSize: 12,
                lineHeight: 1.35,
                pointerEvents: 'none',
            }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>OS Surface</div>
            <div>Workspace: {model.workspaceId ?? 'n/a'}</div>
            <div>Mode: {model.modeId ?? 'n/a'}</div>
            <div>Session: {model.sessionId ?? 'n/a'}</div>
            <div>Participants: {model.participantIds.length}</div>
            <div>Trust: {model.releaseTrustHash ? 'present' : 'n/a'}</div>
        </div>
    );
}
