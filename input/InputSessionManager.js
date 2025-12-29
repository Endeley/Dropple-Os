import { MessageBus } from '@/core/messageBus';

/**
 * Manages exactly ONE active input session.
 * No mutations. No canvas logic. No UI logic.
 */
export class InputSessionManager {
    constructor(bus) {
        this.bus = bus;

        this.state = {
            activeSession: null,
            state: 'idle', // 'idle' | 'active'
        };
    }

    assertIdle() {
        if (this.state.state !== 'idle') {
            throw new Error('[InputSessionManager] Session already active');
        }
    }

    assertActive() {
        if (!this.state.activeSession) {
            throw new Error('[InputSessionManager] No active session');
        }
    }

    cleanup() {
        this.state.activeSession = null;
        this.state.state = 'idle';
    }

    startSession(session, event) {
        this.assertIdle();

        this.state.activeSession = session;
        this.state.state = 'active';

        session.start(event);

        this.bus.emit('session.start', {
            sessionId: session.id,
            sessionType: session.type,
        });
    }

    updateSession(event) {
        this.assertActive();

        const session = this.state.activeSession;
        session.update(event);

        this.bus.emit('session.update', {
            sessionId: session.id,
            sessionType: session.type,
            preview: session.getPreview?.() ?? null,
        });
    }

    commitSession() {
        this.assertActive();

        const session = this.state.activeSession;
        const payload = session.commit();

        this.bus.emit('session.commit', {
            sessionId: session.id,
            sessionType: session.type,
            payload,
        });

        this.cleanup();
        return payload;
    }

    cancelSession() {
        if (!this.state.activeSession) return;

        const session = this.state.activeSession;
        session.cancel();

        this.bus.emit('session.cancel', {
            sessionId: session.id,
            sessionType: session.type,
        });

        this.cleanup();
    }
}
