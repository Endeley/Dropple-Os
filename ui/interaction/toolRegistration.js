import { getVisibleToolsForWorkspace, TOOL_BUS_TOPICS } from '@/ui/tools/toolDefinitions';
import { registerCreateFrameTool } from '@/ui/tools/createFrameTool';
import { registerCreateShapeTool } from '@/ui/tools/createShapeTool';
import { registerCreateLayerTool } from '@/ui/tools/createLayerTool';
import { registerDefaultCreateTool } from '@/ui/tools/defaultCreateTool';

const TOOL_REGISTRARS = Object.freeze({
  'tool.create.frame': registerCreateFrameTool,
  'tool.create.shape': registerCreateShapeTool,
  'tool.create.layer': registerCreateLayerTool,
  'tool.create.default': registerDefaultCreateTool,
});

export function registerWorkspaceTools({ workspaceId, modeId = null, overlayId = null, capabilitySet }) {
  const resolvedWorkspaceId = workspaceId || 'graphic';

  const tools = getVisibleToolsForWorkspace({
    workspaceId: resolvedWorkspaceId,
    modeId,
    overlayId,
    capabilitySet,
  });

  const unsubscribers = [];

  tools.forEach((tool) => {
    const topic = TOOL_BUS_TOPICS[tool.id];
    if (!topic) return;
    const registrar = TOOL_REGISTRARS[topic];
    if (!registrar) return;
    const unsub = registrar();
    if (unsub) unsubscribers.push(unsub);
  });

  return () => {
    unsubscribers.forEach((unsub) => unsub?.());
  };
}
