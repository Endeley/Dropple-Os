import test from 'node:test';
import assert from 'node:assert/strict';

import { projectTokenReviewWorkflow } from '@/runtime/tokens/projectTokenReviewWorkflow.js';
import { selectActiveTokenReviewWorkflow } from '@/runtime/tokens/selectActiveTokenReviewWorkflow.js';

function createReviewState() {
    return {
        entries: {
            'review-v4': {
                id: 'review-v4',
                proposalType: 'resolved-merge',
                status: 'pending',
                versionId: 'v4',
                label: 'Resolved merge',
                parentVersionIds: ['v3', 'v2'],
                predictedMergedResult: [{ entityKey: 'color.primary', next: '#222222' }],
                impactSummary: { breaking: 0, additive: 1, cosmetic: 0 },
                createdAt: 4,
            },
            'review-v5': {
                id: 'review-v5',
                proposalType: 'resolved-merge',
                status: 'approved',
                versionId: 'v5',
                label: 'Approved merge',
                parentVersionIds: ['v4', 'v1'],
                predictedMergedResult: [],
                impactSummary: { breaking: 0, additive: 0, cosmetic: 1 },
                createdAt: 5,
                decisionAt: 6,
                reviewerId: 'lead',
            },
        },
        order: ['review-v4', 'review-v5'],
        activeReviewId: 'review-v4',
    };
}

test('token review workflow projects stable categorized review buckets', () => {
    const projected = projectTokenReviewWorkflow(createReviewState());

    assert.equal(projected.activeReviewId, 'review-v4');
    assert.equal(projected.pendingReviews.length, 1);
    assert.equal(projected.approvedReviews.length, 1);
    assert.equal(projected.selectedReview?.id, 'review-v4');
    assert.deepEqual(projected.reviewStats, {
        total: 2,
        pending: 1,
        approved: 1,
        rejected: 0,
        changesRequested: 0,
    });
});

test('token review selector honors explicit selected review ids without mutating truth', () => {
    const state = {
        document: {
            tokenReviews: createReviewState(),
        },
    };
    const before = JSON.stringify(state.document.tokenReviews);

    const projected = selectActiveTokenReviewWorkflow(state, {
        selectedReviewId: 'review-v5',
    });

    assert.equal(projected.selectedReview?.id, 'review-v5');
    assert.equal(JSON.stringify(state.document.tokenReviews), before);
});
