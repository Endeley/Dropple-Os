'use client';

import { useMemo } from 'react';
import { useWorkspaceProjection } from '@/runtime/projection';
import { getWorkspaceCapabilities } from '@/ui/capabilities/workspaceCapabilities';
import { getVisibleToolsForWorkspace } from '@/ui/tools/toolDefinitions';

function ToolButton({ label, id }) {
  return <button data-tool-id={id}>{label}</button>;
}

export function UIUXToolRail() {
  const workspaceId = useWorkspaceProjection((state) => state.id) || 'uiux';
  const capabilitySet = useMemo(
    () => getWorkspaceCapabilities(workspaceId),
    [workspaceId]
  );
  const tools = useMemo(
    () =>
      getVisibleToolsForWorkspace({
        workspaceId,
        capabilitySet,
      }),
    [workspaceId, capabilitySet]
  );

  const grouped = useMemo(() => {
    const map = new Map();
    tools.forEach((tool) => {
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
            <ToolButton key={tool.id} id={tool.id} label={tool.label} />
          ))}
        </div>
      ))}
    </aside>
  );
}
