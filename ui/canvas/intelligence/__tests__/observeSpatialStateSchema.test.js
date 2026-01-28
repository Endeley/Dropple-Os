import { OBSERVER_INSIGHTS } from '../observeSpatialState.js';

describe('OBSERVER_INSIGHTS schema', () => {
    it('matches the exact insight keys', () => {
        const keys = Object.keys(OBSERVER_INSIGHTS).sort();
        expect(keys).toEqual([
            'ALIGNMENT_IN_PROGRESS',
            'DENSE_CLUSTER',
            'SNAP_CANDIDATE_VISIBLE',
            'SPARSE_VIEWPORT',
        ]);
    });
});
