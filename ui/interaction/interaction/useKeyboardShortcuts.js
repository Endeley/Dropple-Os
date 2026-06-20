'use client';

import { useEffect } from 'react';
import { serializeSelection } from '@/ui/workspace/shared/serializeSelection';
import { pasteFromClipboard } from '@/ui/workspace/shared/pasteFromClipboard';
import { useClipboard } from '@/ui/workspace/shared/ClipboardContext';
import { nodeCreateIntent } from '@/ui/creation/nodeCreateIntent';
import { handleKeyboardEvent } from '@/ui/bridges/keyboardEngineFacade.js';
import { getNode } from '@/runtime/document/documentAdapter.js';
import { dispatchNodeDeleteSelection } from '@/ui/canvas/deleteSelection.js';

// ✅ NEW — canonical history intents
import { historyIntentUndo, historyIntentRedo } from '@/ui/history/historyIntent.js';

export function useKeyboardShortcuts({ enabled = true, selectedIds, setSelection, emit, getState }) {
    const clipboard = useClipboard();

    useEffect(() => {
        if (!enabled) return;

        function deleteSelection() {
            dispatchNodeDeleteSelection({
                ids: selectedIds,
                dispatchEvent: emit,
            });
        }

        function duplicateSelection() {
            const state = getState();

            selectedIds.forEach((id) => {
                const node = getNode(state, id);
                if (!node) return;

                const newId = `${id}-copy`;

                nodeCreateIntent({
                    id: newId,
                    type: node.type,
                    parentId: node.parentId || null,
                    props: { ...node.props },
                    bounds: {
                        x: node.layout.x + 20,
                        y: node.layout.y + 20,
                        width: node.layout.width,
                        height: node.layout.height,
                    },
                });
            });
        }

        function onKeyDown(e) {
            handleKeyboardEvent(e, {
                fallbackHandler(input) {
                    const isMac = navigator.platform.includes('Mac');
                    const mod = isMac ? input.modifiers.meta : input.modifiers.ctrl;

                    // ─────────────────────────────
                    // COPY
                    // ─────────────────────────────
                    if (mod && input.key.toLowerCase() === 'c') {
                        e.preventDefault();
                        const snapshot = serializeSelection({
                            state: getState(),
                            selectedIds,
                        });
                        clipboard.copy(snapshot);
                        return { handled: true };
                    }

                    // ─────────────────────────────
                    // UNDO (FIXED — INTENT ONLY)
                    // ─────────────────────────────
                    if (mod && input.key === 'z' && !input.modifiers.shift) {
                        e.preventDefault();
                        historyIntentUndo();
                        return { handled: true };
                    }

                    // ─────────────────────────────
                    // REDO (FIXED — INTENT ONLY)
                    // ─────────────────────────────
                    if (mod && input.key === 'z' && input.modifiers.shift) {
                        e.preventDefault();
                        historyIntentRedo();
                        return { handled: true };
                    }

                    // ─────────────────────────────
                    // DUPLICATE
                    // ─────────────────────────────
                    if (mod && input.key.toLowerCase() === 'd') {
                        e.preventDefault();
                        duplicateSelection();
                        return { handled: true };
                    }

                    // ─────────────────────────────
                    // PASTE
                    // ─────────────────────────────
                    if (mod && input.key.toLowerCase() === 'v') {
                        e.preventDefault();
                        const newIds = pasteFromClipboard({
                            clipboard: clipboard.clipboard,
                            emit,
                        });
                        setSelection(new Set(newIds));
                        return { handled: true };
                    }

                    // ─────────────────────────────
                    // DELETE
                    // ─────────────────────────────
                    if (input.key === 'Delete' || input.key === 'Backspace') {
                        e.preventDefault();
                        deleteSelection();
                        return { handled: true };
                    }

                    return null;
                },
            });
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [enabled, selectedIds, setSelection, emit, getState, clipboard]);
}
