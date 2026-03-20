'use client';

import { useEffect } from 'react';
import { useSelection } from '@/ui/workspace/shared/SelectionContext';
import { CapabilityActions } from '@/ui/capabilities/capabilityActions';
import { handleKeyboardEvent } from '@/ui/bridges/keyboardEngineFacade.js';

export function useAlignmentShortcuts({ enabled = true, emit, getState }) {
    const { selectedIds } = useSelection();

    useEffect(() => {
        if (!enabled) return;

        function onKeyDown(e) {
            handleKeyboardEvent(e, {
                fallbackHandler(input) {
                    const tag = input.event?.target?.tagName;
                    if (
                        tag === 'INPUT' ||
                        tag === 'TEXTAREA' ||
                        input.event?.target?.isContentEditable
                    ) {
                        return null;
                    }

                    const isMac = navigator.platform.includes('Mac');
                    const mod = isMac ? input.modifiers.meta : input.modifiers.ctrl;
                    if (!mod) return null;

                    const selected =
                        selectedIds && selectedIds.size > 1
                            ? Array.from(selectedIds)
                            : null;

                    if (!selected || selected.length < 2) return null;

                    switch (input.key) {
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
                            return null;
                    }

                    e.preventDefault();
                    return { handled: true };
                },
            });
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [enabled, selectedIds, emit, getState]);
}
