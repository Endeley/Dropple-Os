import { registerClockSystemHandlers } from '../clock/clockSystemHandlers.js';

let didRegister = false;

export function registerRuntimeSystemHandlers() {
    if (didRegister) return;
    didRegister = true;
    registerClockSystemHandlers();
}

registerRuntimeSystemHandlers();
