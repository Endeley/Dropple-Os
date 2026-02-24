import { registerClockSystemHandlers } from '@/engine/clock/clockSystemHandlers.js';

let didRegister = false;

export function registerEngineSystemHandlers() {
    if (didRegister) return;
    didRegister = true;
    registerClockSystemHandlers();
}

registerEngineSystemHandlers();
