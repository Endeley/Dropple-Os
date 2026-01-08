import { MessageBus } from '@/core/messageBus';

/**
 * Manages exactly ONE active input session.
 * No mutations. No canvas logic. No UI logic.
 *
 * HARD RULES:
 * - startSession must be strict
 * - updateSession must be safe
 * - commitSession must be safe when idle
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

    cleanup() {
        this.state.activeSession = null;
        this.state.state = 'idle';
    }

    startSession(session, event) {
        this.assertIdle();

        this.state.activeSession = session;
        this.state.state = 'active';

        session.start?.(event);

        this.bus.emit('session.start', {
            sessionId: session.id,
            sessionType: session.type,
        });
    }

    /**
     * Pointer move updates.
     * Safe no-op when idle.
     */
    updateSession(event) {
        const session = this.state.activeSession;
        if (!session) return null;

        try {
            session.update?.(event);

            this.bus.emit('session.update', {
                sessionId: session.id,
                sessionType: session.type,
                preview: session.getPreview?.() ?? null,
            });

            return session;
        } catch (err) {
            console.error('[InputSessionManager] updateSession failed:', err);
            this.cancelSession();
            return null;
        }
    }

    /**
     * Pointer up commit.
     * IMPORTANT: pointer.up can fire with NO active session.
     * This MUST be a safe no-op.
     */
    commitSession() {
        const session = this.state.activeSession;
        if (!session) return null;

        let payload = null;

        try {
            payload = session.commit?.();
        } catch (err) {
            console.error('[InputSessionManager] commitSession failed:', err);
        }

        this.bus.emit('session.commit', {
            sessionId: session.id,
            sessionType: session.type,
            payload,
        });

        this.cleanup();
        return payload;
    }

    cancelSession() {
        const session = this.state.activeSession;
        if (!session) return;

        try {
            session.cancel?.();
        } catch (err) {
            console.warn('[InputSessionManager] cancelSession error:', err);
        }

        this.bus.emit('session.cancel', {
            sessionId: session.id,
            sessionType: session.type,
        });

        this.cleanup();
    }
}
