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
        <button type='button' data-tool-id={tool.id} className={`tool-button ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={onSelect}>
            <svg viewBox='0 0 24 24' className='tool-icon'>
                {icon || <circle cx='12' cy='12' r='6' />}
            </svg>

            <span className='tool-tooltip'>{tool.label}</span>
        </button>
    );
}

export function UIUXToolRail() {
    const workspaceId = useWorkspaceViewState((s) => s.definitionId ?? s.modeId ?? s.id) || 'uiux';

    const activeTool = useToolStore((s) => s.activeTool);
    const runtimeTools = useToolStore((s) => s.visibleTools);

    const tools = useMemo(() => {
        if (runtimeTools?.length) {
            return runtimeTools.map((toolId) => TOOL_DEFINITION_BY_ID[toolId]).filter(Boolean);
        }
        return getVisibleToolsForWorkspace({ workspaceId, modeId: workspaceId });
    }, [runtimeTools, workspaceId]);

    const grouped = useMemo(() => {
        const groups = new Map();

        tools.forEach((tool) => {
            if (!tool?.id) return;
            const groupId = tool.group || 'other';
            if (!groups.has(groupId)) {
                groups.set(groupId, []);
            }
            groups.get(groupId).push(tool);
        });

        return Array.from(groups.entries()).filter(([, list]) => list.length > 0);
    }, [tools]);

    return (
        <aside className='uiux-toolrail'>
            <div className='toolrail-section-title'>Tools</div>

            {grouped.map(([groupId, groupTools]) => (
                <div className='tool-group' key={groupId}>
                    <div className='tool-group-label'>{groupId}</div>

                    <div className='tool-group-stack'>
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
                </div>
            ))}

            <div className='toolrail-footer'>
                <button type='button' className='tool-button utility-tool'>
                    <svg viewBox='0 0 24 24' className='tool-icon'>
                        <circle cx='12' cy='12' r='2' />
                        <path d='M12 4v3M12 17v3M4 12h3M17 12h3' />
                    </svg>
                    <span className='tool-tooltip'>Utilities</span>
                </button>
            </div>
        </aside>
    );
}
