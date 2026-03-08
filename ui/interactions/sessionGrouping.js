'use client';

import { useEffect, useRef } from 'react';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';

export function SessionGroupingBridge() {
    const groupIdRef = useRef(null);

    useEffect(() => {
        function beginGroup() {
            if (!groupIdRef.current) {
                groupIdRef.current =
                    typeof crypto !== 'undefined' && crypto.randomUUID
                        ? crypto.randomUUID()
                        : `group-${Math.random().toString(36).slice(2, 10)}`;
            }
        }

        function endGroup() {
            groupIdRef.current = null;
        }

        canvasBus.on('session.start', beginGroup);
        canvasBus.on('intent.edit.begin', beginGroup);
        canvasBus.on('intent.edit.commit', endGroup);
        canvasBus.on('session.commit', endGroup);
        canvasBus.on('session.cancel', endGroup);

        return () => {
            canvasBus.off('session.start', beginGroup);
            canvasBus.off('intent.edit.begin', beginGroup);
            canvasBus.off('intent.edit.commit', endGroup);
            canvasBus.off('session.commit', endGroup);
            canvasBus.off('session.cancel', endGroup);
        };
    }, []);

    return null;
}
