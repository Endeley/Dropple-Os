import { canvasBus } from '@/ui/eventBus/canvasBus.js';
import { runStructureCommand } from '@/runtime/commands/structure/runStructureCommand.js';

function pushGroupCheckpoint(stage, details = {}) {
    if (typeof document !== 'undefined' && document.body) {
        document.body.dataset.groupCheckpoint = stage;
    }
    const nextEntry = {
        stage,
        details,
        at: Date.now(),
    };
    const entries = Array.isArray(globalThis.__groupInvestigation) ? globalThis.__groupInvestigation : [];
    entries.push(nextEntry);
    globalThis.__groupInvestigation = entries.slice(-20);
}

export function runCommandIntent(commandId, payload = {}, options = {}) {
    if (typeof commandId !== 'string' || commandId.length === 0) return null;

    if (commandId === 'group') {
        console.log('RUN_COMMAND_INTENT group');
        pushGroupCheckpoint('RUN_COMMAND_INTENT group', {
            payload,
            hasDispatcher: Boolean(options?.dispatcher?.dispatch),
            workspaceId: options?.workspaceId ?? null,
            modeId: options?.modeId ?? null,
        });
    }

    const dispatcher = options?.dispatcher ?? null;
    if (dispatcher?.dispatch && typeof dispatcher.getState === 'function') {
        return runStructureCommand({
            commandId,
            dispatcher,
            payload,
            workspaceId: options?.workspaceId ?? null,
            modeId: options?.modeId ?? null,
        });
    }

    canvasBus.emit('intent.command.run', {
        commandId,
        payload,
    });

    return { handled: true };
}
