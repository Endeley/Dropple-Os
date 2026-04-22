'use client';

import '@/ui/styles/uiux.css';
import { useMemo } from 'react';
import { useWorkspaceViewState } from '@/runtime/projection';
import { useToolStore } from '@/ui/state/useToolStore.js';
import { getVisibleToolsForWorkspace, TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { INTENTS } from '@/core/intents/intentTypes.js';

const TOOL_ICONS = {
    select: <path d='M5 3l14 7-7 2-2 7-5-16z' />,
    pan: <path d='M12 3l3 3h-2v4h4V8l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2L4 11l3-3v2h4V6H9l3-3z' />,
    zoom: (
        <>
            <circle cx='11' cy='11' r='6' />
            <path d='M16 16l5 5' />
        </>
    ),
    frame: <rect x='5' y='5' width='14' height='14' />,
    text: <path d='M4 6h16M12 6v12M7 18h10' />,
    shape: <circle cx='12' cy='12' r='6' />,
    image: (
        <>
            <rect x='4' y='5' width='16' height='14' />
            <circle cx='9' cy='10' r='2' />
        </>
    ),
};

function ToolButton({ tool, active, onSelect }) {
    const icon = TOOL_ICONS[tool.id];

    return (
        <button
            type='button'
            data-tool-id={tool.id}
            className={`tool-button ${active ? 'is-active' : ''}`}
            aria-pressed={active}
            onClick={onSelect}>
            <svg viewBox='0 0 24 24' className='tool-icon'>
                {icon || <circle cx='12' cy='12' r='6' />}
            </svg>

            <span className='tool-tooltip'>{tool.label}</span>
        </button>
    );
}

export function UIUXToolRail() {
    const workspaceId = useWorkspaceViewState((s) => s.id) || 'design';

    const activeTool = useToolStore((s) => s.activeTool);
    const runtimeTools = useToolStore((s) => s.visibleTools);

    // ----- TOOL SOURCE -----
    const tools = useMemo(() => {
        if (runtimeTools?.length) return runtimeTools;
        return getVisibleToolsForWorkspace({ workspaceId });
    }, [runtimeTools, workspaceId]);

    // ----- GROUPING -----
    const grouped = useMemo(() => {
        const groups = {
            selection: [],
            viewport: [],
            creation: [],
            other: [],
        };

        tools.forEach((toolId) => {
            const tool = TOOL_DEFINITION_BY_ID[toolId];
            if (!tool) return;

            if (tool.group === 'selection') groups.selection.push(tool);
            else if (tool.group === 'viewport') groups.viewport.push(tool);
            else if (tool.group === 'creation') groups.creation.push(tool);
            else groups.other.push(tool);
        });

        return Object.entries(groups).filter(([, list]) => list.length > 0);
    }, [tools]);

    return (
        <aside className='uiux-toolrail'>
            {grouped.map(([groupId, groupTools]) => (
                <div className='tool-group' key={groupId}>
                    <div className='tool-group-label'>{groupId}</div>

                    {groupTools.map((tool) => (
                        <ToolButton
                            key={tool.id}
                            tool={tool}
                            active={activeTool === tool.id}
                            onSelect={() =>
                                canvasBus.emit(INTENTS.TOOL_SET_ACTIVE, {
                                    toolId: tool.id,
                                    workspaceId,
                                })
                            }
                        />
                    ))}
                </div>
            ))}
        </aside>
    );
}
