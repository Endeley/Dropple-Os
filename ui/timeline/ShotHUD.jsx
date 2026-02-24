'use client';

import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';

export function ShotHUD() {
    const { shotId, shotTimeMs, evalStatus, frameTime } = useRuntimeStore((s) => ({
        shotId: s.shotId,
        shotTimeMs: s.shotTimeMs,
        evalStatus: s.evalStatus,
        frameTime: s.frameTime,
    }));

    return (
        <div
            className="shot-hud"
            style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                fontSize: 12,
                color: '#334155',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '6px 10px',
            }}
        >
            <div>Frame: {frameTime ?? '—'}</div>
            <div>Shot: {shotId ?? '—'}</div>
            <div>Shot Time: {shotTimeMs ?? '—'}</div>
            <div>Status: {evalStatus ?? '—'}</div>
        </div>
    );
}
