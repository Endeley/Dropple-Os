'use client';

import TimelineBar from '@/ui/layout/TimelineBar';
import { SelectionProvider, useSelection } from './SelectionContext';
import { ModeProvider } from './ModeContext';
import { useKeyboardShortcuts } from '@/ui/interaction/interaction/useKeyboardShortcuts.js';
import { getDesignStateAtCursor } from '@/core/persistence/index.js';
import { useMemo } from 'react';

function WorkspaceLayoutInner({ events, cursor, emit }) {
    const { selectedIds, setSelection } = useSelection();

    const getState = () =>
        getDesignStateAtCursor({
            events,
            uptoIndex: cursor.index,
        });

    useKeyboardShortcuts({
        enabled: true,
        selectedIds,
        setSelection,
        emit,
        getState,
    });

    const replayState = useMemo(() => getState(), [events, cursor.index]);

    return (
        <>
            {/* other UI omitted for brevity */}

            <TimelineBar events={events} cursor={cursor} />
        </>
    );
}

export function WorkspaceLayout(props) {
    return (
        <SelectionProvider>
            <ModeProvider value={props.adapter?.id || 'graphic'}>
                <WorkspaceLayoutInner {...props} />
            </ModeProvider>
        </SelectionProvider>
    );
}
