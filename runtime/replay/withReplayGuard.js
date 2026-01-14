import { setIsReplaying } from '../state/runtimeState.js';

export function withReplayGuard(fn) {
    setIsReplaying(true);
    try {
        return fn();
    } finally {
        setIsReplaying(false);
    }
}
