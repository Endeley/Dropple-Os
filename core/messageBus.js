/**
 * MessageBus — Phase 2.4 (Persistence-ready)
 *
 * Responsibilities:
 * - Central event & log pipeline
 * - Timestamped messages
 * - Log levels
 * - Replay support
 * - Subscriptions
 *
 * SAFE:
 * - Backward compatible
 * - No persistence hard-coded
 */

export class MessageBus {
    constructor({ runId = null } = {}) {
        this.runId = runId;
        this.messages = [];
        this.listeners = new Set();
        this.eventListeners = new Map();
    }

    /* ---------------------------------------------
     Core emit (lowest-level)
  --------------------------------------------- */

    emit(event, payload) {
        const messageId = createUuidFallback();
        const isStringEvent = typeof event === 'string';
        const normalized = isStringEvent
            ? {
                  id: messageId,
                  runId: this.runId,
                  timestamp: Date.now(),
                  level: 'info',
                  source: 'system',
                  type: event,
                  payload: payload ?? null,
              }
            : {
                  id: messageId,
                  runId: this.runId,
                  timestamp: Date.now(),
                  level: event.level || 'info',
                  source: event.source || 'system',
                  type: event.type || 'log',
                  payload: event.payload ?? null,
              };

        this.messages.push(normalized);

        for (const listener of this.listeners) {
            try {
                listener(normalized);
            } catch (err) {
                console.error('MessageBus listener error:', err);
            }
        }

        const typedListeners = this.eventListeners.get(normalized.type);
        if (typedListeners) {
            for (const listener of typedListeners) {
                try {
                    listener(normalized.payload);
                } catch (err) {
                    console.error('MessageBus listener error:', err);
                }
            }
        }

        return normalized;
    }

    /* ---------------------------------------------
     Backward-compatible API
  --------------------------------------------- */

    send(source, message, level = 'info') {
        return this.emit({
            source,
            level,
            payload: { message },
        });
    }

    info(source, message) {
        return this.send(source, message, 'info');
    }

    warn(source, message) {
        return this.send(source, message, 'warn');
    }

    error(source, message, extra = {}) {
        return this.emit({
            source,
            level: 'error',
            payload: {
                message,
                ...extra,
            },
        });
    }

    debug(source, message) {
        return this.send(source, message, 'debug');
    }

    /* ---------------------------------------------
     Replay & inspection
  --------------------------------------------- */

    getAll() {
        return [...this.messages];
    }

    getBySource(source) {
        return this.messages.filter((m) => m.source === source);
    }

    getByLevel(level) {
        return this.messages.filter((m) => m.level === level);
    }

    clear() {
        this.messages = [];
    }

    replay(listener) {
        this.messages.forEach(listener);
    }

    /* ---------------------------------------------
     Subscriptions
  --------------------------------------------- */

    subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    on(type, fn) {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, new Set());
        }
        this.eventListeners.get(type).add(fn);
        return () => this.off(type, fn);
    }

    off(type, fn) {
        const listeners = this.eventListeners.get(type);
        if (!listeners) {
            return;
        }
        listeners.delete(fn);
        if (listeners.size === 0) {
            this.eventListeners.delete(type);
        }
    }
}

function createUuidFallback() {
    const globalCrypto = globalThis.crypto;

    if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
        return globalCrypto.randomUUID();
    }

    const randomBytes =
        globalCrypto && typeof globalCrypto.getRandomValues === 'function'
            ? globalCrypto.getRandomValues(new Uint8Array(16))
            : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));

    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

    const hex = [...randomBytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
