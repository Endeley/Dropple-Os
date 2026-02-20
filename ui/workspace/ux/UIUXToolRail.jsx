'use client';

import { Availability } from '@/ui/availability/availability';
import { useAvailability } from '@/ui/availability/useAvailability';
import { TOOL_CAPABILITIES } from '@/ui/capabilities/toolCapabilities';

function ToolButton({ id, children }) {
  const caps = TOOL_CAPABILITIES[id] || { readCaps: [] };
  const availability = useAvailability(caps);
  if (availability === Availability.HIDDEN) return null;

  const disabled = availability === Availability.READ_ONLY;

  return <button disabled={disabled}>{children}</button>;
}

export function UIUXToolRail() {
  return (
    <aside className="uiux-toolrail">
      <div className="tool-group">
        <ToolButton id="tool.create.frame">Frame</ToolButton>
      </div>

      <div className="tool-group">
        <ToolButton id="tool.select">Select</ToolButton>
        <ToolButton id="tool.pan">Pan</ToolButton>
        <ToolButton id="tool.zoom">Zoom</ToolButton>
        <ToolButton id="tool.fit">Fit</ToolButton>
      </div>

      <div className="tool-group">
        <ToolButton id="tool.create.text">Text</ToolButton>
        <ToolButton id="tool.create.shape">Rect</ToolButton>
        <ToolButton id="tool.create.image">Image</ToolButton>
      </div>
    </aside>
  );
}
