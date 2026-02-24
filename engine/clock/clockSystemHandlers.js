import { registerSystemEventHandler } from '@/core/events/systemEventRegistry.js';
import { EventTypes } from '@/core/events/eventTypes.js';
import { play, pause, seek } from './clockController.js';

export function registerClockSystemHandlers() {
    registerSystemEventHandler(EventTypes.CLOCK_PLAY, () => play());

    registerSystemEventHandler(EventTypes.CLOCK_PAUSE, () => pause());

    registerSystemEventHandler(EventTypes.CLOCK_SEEK, (event) => {
        const time = event?.payload?.time ?? 0;
        seek(time);
    });
}
