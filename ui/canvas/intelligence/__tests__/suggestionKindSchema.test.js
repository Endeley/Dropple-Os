import { SUGGESTION_KIND } from '../suggestionLayer.js';

describe('SUGGESTION_KIND schema', () => {
    it('matches the exact suggestion kinds', () => {
        const keys = Object.keys(SUGGESTION_KIND).sort();
        expect(keys).toEqual([
            'ALIGN_ELEMENTS',
            'DENSITY_NOTICE',
            'EMPTY_VIEWPORT',
            'SNAP_AVAILABLE',
            'VALIDATION_ERROR',
            'VALIDATION_INFO',
            'VALIDATION_WARNING',
        ]);
    });
});
