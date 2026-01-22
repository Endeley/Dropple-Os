import { UXIntent, defaultUXIntent, uxIntentMap } from './uxIntentMap.js';

export const UXSeverity = Object.freeze({
    NONE: 'none',
    NOTICE: 'notice',
    WARNING: 'warning',
});

export function observeUXIntent({ profile, actionType }) {
    const intent = uxIntentMap[actionType] || defaultUXIntent;
    const severity =
        intent === UXIntent.SAFE
            ? UXSeverity.NONE
            : intent === UXIntent.SOFT_UNSAFE
              ? UXSeverity.NOTICE
              : UXSeverity.WARNING;

    return {
        profile,
        actionType,
        intent,
        severity,
    };
}
