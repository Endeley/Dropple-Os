function compareReviewIds(a, b) {
    return String(a ?? '').localeCompare(String(b ?? ''));
}

function normalizeReview(review) {
    if (!review) return null;

    return {
        id: review.id,
        proposalType: review.proposalType ?? 'resolved-merge',
        status: review.status ?? 'pending',
        versionId: review.versionId ?? null,
        label: review.label ?? null,
        parentVersionIds: Array.isArray(review.parentVersionIds) ? [...review.parentVersionIds] : [],
        unresolvedCount: Number(review.unresolvedCount ?? 0),
        resolutions: Array.isArray(review.resolutions) ? structuredClone(review.resolutions) : [],
        predictedMergedResult: Array.isArray(review.predictedMergedResult)
            ? structuredClone(review.predictedMergedResult)
            : [],
        impactSummary: review.impactSummary
            ? structuredClone(review.impactSummary)
            : { breaking: 0, additive: 0, cosmetic: 0 },
        reviewerId: review.reviewerId ?? null,
        decisionNote: review.decisionNote ?? null,
        createdAt: review.createdAt ?? null,
        decisionAt: review.decisionAt ?? null,
    };
}

export function projectTokenReviewWorkflow(tokenReviews, options = {}) {
    const reviewEntries = tokenReviews?.entries ?? {};
    const orderedIds = Array.isArray(tokenReviews?.order) ? [...tokenReviews.order] : Object.keys(reviewEntries);
    const knownIds = orderedIds.filter((id) => reviewEntries[id]);
    const overflowIds = Object.keys(reviewEntries)
        .filter((id) => !knownIds.includes(id))
        .sort(compareReviewIds);
    const stableIds = [...knownIds, ...overflowIds];
    const reviews = stableIds
        .map((id) => normalizeReview(reviewEntries[id]))
        .filter(Boolean);

    const buckets = {
        pendingReviews: [],
        approvedReviews: [],
        rejectedReviews: [],
        changesRequestedReviews: [],
    };

    for (const review of reviews) {
        switch (review.status) {
            case 'approved':
                buckets.approvedReviews.push(review);
                break;
            case 'rejected':
                buckets.rejectedReviews.push(review);
                break;
            case 'changes_requested':
                buckets.changesRequestedReviews.push(review);
                break;
            default:
                buckets.pendingReviews.push(review);
                break;
        }
    }

    const preferredId = options?.selectedReviewId ?? tokenReviews?.activeReviewId ?? null;
    const selectedReview =
        reviews.find((review) => review.id === preferredId) ??
        buckets.pendingReviews.at(-1) ??
        reviews.at(-1) ??
        null;

    return {
        activeReviewId: tokenReviews?.activeReviewId ?? null,
        selectedReview,
        reviews,
        ...buckets,
        reviewStats: {
            total: reviews.length,
            pending: buckets.pendingReviews.length,
            approved: buckets.approvedReviews.length,
            rejected: buckets.rejectedReviews.length,
            changesRequested: buckets.changesRequestedReviews.length,
        },
    };
}
