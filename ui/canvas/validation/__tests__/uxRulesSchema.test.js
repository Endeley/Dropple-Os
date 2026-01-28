import { UX_RULES } from '../uxRules.js';

describe('UX_RULES schema', () => {
    it('matches the exact rule keys', () => {
        const keys = Object.keys(UX_RULES).sort();
        expect(keys).toEqual([
            'INCONSISTENT_SPACING',
            'MISALIGNED',
            'OFFSCREEN_CRITICAL',
            'OVERLAP',
            'TOO_CLOSE',
        ]);
    });
});
