import { MoveSession } from './input/sessions/MoveSession.js';
import { ResizeSession } from './input/sessions/ResizeSession.js';
import { RotateSession } from './input/sessions/RotateSession.js';
import { PanSession } from './input/sessions/PanSession.js';
import { ZoomSession } from './input/sessions/ZoomSession.js';
import { MarqueeSession } from './input/sessions/MarqueeSession.js';

const registry = new Map([
    ['move', MoveSession],
    ['resize', ResizeSession],
    ['rotate', RotateSession],
    ['pan', PanSession],
    ['zoom', ZoomSession],
    ['marquee', MarqueeSession],
]);

export function registerInteractionSession(type, Session) {
    registry.set(type, Session);
}

export function createInteractionManager(_context = {}) {
    function createSession(type, payload) {
        const Session = registry.get(type);
        if (!Session) {
            throw new Error(`Unknown interaction type: ${type}`);
        }

        return new Session(payload);
    }

    return {
        createSession,
    };
}
