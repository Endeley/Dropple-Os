import { UXIntent } from './uxIntentMap.js';
import { UXSeverity } from './observeUXIntent.js';

const SOFT_UNSAFE_COPY =
    'This action modifies workspace state while in UX Validation Mode.';
const HARD_UNSAFE_COPY =
    'This action performs a structural change while in UX Validation Mode.';

export function createUXWarningEmitter({ onEvent, onAudit } = {}) {
    const seen = new Set();

    return function emitUXWarning({ profile, actionType, intent, severity }) {
        if (profile !== 'ux-validation') return;
        if (severity === UXSeverity.NONE) return;
        if (!actionType) return;

        const key = `${intent}:${actionType}`;
        if (seen.has(key)) return;
        seen.add(key);

        const message = intent === UXIntent.SOFT_UNSAFE ? SOFT_UNSAFE_COPY : HARD_UNSAFE_COPY;
        const classification =
            intent === UXIntent.SOFT_UNSAFE ? 'Soft-Unsafe' : 'Hard-Unsafe';

        console.warn(
            `[UX MODE] ${message} Classification: ${classification} (action: ${actionType})`,
        );

        onEvent?.({
            profile,
            actionType,
            intent,
            severity,
            message,
        });

        onAudit?.({
            timestamp: Date.now(),
            actionType,
            intent,
        });
    };
}
