import { canvasBus } from '../eventBus/canvasBus.js';
import { registerGraphIntentBridge } from './graphIntentBridge.js';
import { runStructureCommand } from '@/runtime/commands/structure/runStructureCommand.js';

let registered = false;
let activeDispatcher = null;
let activeRegistrations = 0;

export function registerCommandIntentBridge(dispatcher) {
    activeDispatcher = dispatcher ?? null;
    activeRegistrations += 1;

    const onRunCommand = (payload) => {
        const commandId = payload?.commandId ?? null;
        if (!commandId) return null;
        return runStructureCommand({
            commandId,
            dispatcher: activeDispatcher,
            payload: payload?.payload ?? {},
        });
    };

    let disposeGraphBridge = null;
    if (!registered) {
        canvasBus.on('intent.command.run', onRunCommand);
        registered = true;
    }
    disposeGraphBridge = registerGraphIntentBridge(dispatcher);

    return () => {
      activeRegistrations = Math.max(0, activeRegistrations - 1);
      disposeGraphBridge?.();
      if (activeRegistrations === 0) {
        canvasBus.off('intent.command.run', onRunCommand);
        activeDispatcher = null;
        registered = false;
      }
    };
}
