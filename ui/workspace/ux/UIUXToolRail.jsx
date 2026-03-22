'use client';

import '@/ui/styles/uiux.css';
import { useMemo } from 'react';
import { useWorkspaceProjection } from '@/runtime/projection';
import { useToolStore } from '@/ui/state/useToolStore.js';
import { TOOL_DEFINITION_BY_ID } from '@/ui/tools/toolDefinitions.js';
import { canvasBus } from '@/ui/eventBus/canvasBus.js';

const TOOL_ICONS = {
  select: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3l14 7-7 2-2 7-5-16z" fill="currentColor" />
    </svg>
  ),
  pan: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l3 3h-2v4h4V8l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2L4 11l3-3v2h4V6H9l3-3z" fill="currentColor" />
    </svg>
  ),
  zoom: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" />
      <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  fit: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="7" y="7" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  frame: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M12 6v12M7 18h10" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  shape: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="9" cy="10" r="2" fill="currentColor" />
      <path d="M6 17l4-4 3 3 3-3 2 4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
};

function ToolButton({ label, id, active, onSelect }) {
  const icon = TOOL_ICONS[id] ?? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
  return (
    <button
      data-tool-id={id}
      onClick={onSelect}
      className={`tool-button ${active ? 'is-active' : ''}`}
    >
      <span className="tool-icon" aria-hidden="true">{icon}</span>
      <span className="tool-tooltip">{label}</span>
    </button>
  );
}

export function UIUXToolRail() {
  const workspaceId = useWorkspaceProjection((state) => state.id) || 'uiux';
  const activeTool = useToolStore((s) => s.activeTool);
  const tools = useToolStore((s) => s.visibleTools);
  const grouped = useMemo(() => {
    const map = new Map();
    tools.forEach((toolId) => {
      const tool = TOOL_DEFINITION_BY_ID[toolId];
      if (!tool) return;
      if (!map.has(tool.group)) {
        map.set(tool.group, []);
      }
      map.get(tool.group).push(tool);
    });
    return Array.from(map.entries());
  }, [tools]);

  return (
    <aside className="uiux-toolrail">
      {grouped.map(([groupId, groupTools]) => (
        <div className="tool-group" key={groupId}>
          {groupTools.map((tool) => (
            <ToolButton
              key={tool.id}
              id={tool.id}
              label={tool.label}
              active={activeTool === tool.id}
              onSelect={() =>
                canvasBus.emit('intent.tool.setActive', { toolId: tool.id, workspaceId })
              }
            />
          ))}
        </div>
      ))}
    </aside>
  );
}
