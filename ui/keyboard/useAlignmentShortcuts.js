'use client';

import { useEffect } from 'react';
import { useSelection } from '@/components/workspace/SelectionContext';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';

export function useAlignmentShortcuts({ enabled = true, emit, getState }) {
    const { selectedIds } = useSelection();

    useEffect(() => {
        if (!enabled) return;

        function onKeyDown(e) {
            const tag = e.target?.tagName;
            if (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                e.target?.isContentEditable
            ) {
                return;
            }

            const isMac = navigator.platform.includes('Mac');
            const mod = isMac ? e.metaKey : e.ctrlKey;
            if (!mod) return;

            const state = getState?.();
            const nodes = state?.nodes || {};

            const selected =
                selectedIds && selectedIds.size > 1
                    ? Array.from(selectedIds).map((id) => nodes[id]).filter(Boolean)
                    : null;

            if (!selected) return;

            switch (e.key) {
                case 'ArrowLeft':
                    CapabilityActions.alignLeft(selected, emit);
                    break;
                case 'ArrowRight':
                    CapabilityActions.alignRight(selected, emit);
                    break;
                case 'ArrowUp':
                    CapabilityActions.alignTop(selected, emit);
                    break;
                case 'ArrowDown':
                    CapabilityActions.alignBottom(selected, emit);
                    break;
                default:
                    return;
            }

            e.preventDefault();
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [enabled, selectedIds, emit, getState]);
}
