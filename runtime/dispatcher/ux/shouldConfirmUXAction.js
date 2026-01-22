import { UXIntent } from './uxIntentMap.js';

export const UXEnforcementTier = Object.freeze({
    OBSERVE: 0,
    WARN: 1,
    CONFIRM: 2,
    BLOCK: 3,
});

export const defaultUXEnforcementTier = UXEnforcementTier.CONFIRM;

export function shouldConfirmUXAction({ profile, intent, uxEnforcementTier }) {
    return (
        profile === 'ux-validation' &&
        intent === UXIntent.HARD_UNSAFE &&
        uxEnforcementTier === UXEnforcementTier.CONFIRM
    );
}
