import { EventTypes } from '@/core/events/eventTypes.js';

function ensureTokenReviewState(state) {
    if (state?.document?.tokenReviews) {
        return state;
    }

    return {
        ...state,
        document: {
            ...state.document,
            tokenReviews: {
                entries: {},
                order: [],
                activeReviewId: null,
            },
        },
    };
}

function upsertReview(tokenReviews, review) {
    const id = typeof review?.id === 'string' && review.id.length > 0 ? review.id : null;
    if (!id) return tokenReviews;

    const existing = tokenReviews.entries?.[id] ?? null;
    const nextEntry = {
        ...(existing ?? {}),
        ...review,
        id,
    };

    return {
        entries: {
            ...(tokenReviews.entries ?? {}),
            [id]: nextEntry,
        },
        order: Array.isArray(tokenReviews.order) && tokenReviews.order.includes(id)
            ? [...tokenReviews.order]
            : [...(tokenReviews.order ?? []), id],
        activeReviewId: id,
    };
}

function updateReviewDecision(tokenReviews, reviewId, status, payload) {
    const existing = tokenReviews.entries?.[reviewId] ?? null;
    if (!existing) return tokenReviews;

    return {
        entries: {
            ...(tokenReviews.entries ?? {}),
            [reviewId]: {
                ...existing,
                status,
                reviewerId: payload?.reviewerId ?? existing.reviewerId ?? null,
                decisionNote: payload?.decisionNote ?? null,
                decisionAt: payload?.timestamp ?? null,
            },
        },
        order: [...(tokenReviews.order ?? [])],
        activeReviewId: reviewId,
    };
}

export function tokenReviewReducers(state, event) {
    const ensured = ensureTokenReviewState(state);
    const payload = event?.payload ?? {};
    let nextTokenReviews = ensured.document.tokenReviews;

    switch (event?.type) {
        case EventTypes.TOKEN_REVIEW_SUBMIT: {
            nextTokenReviews = upsertReview(ensured.document.tokenReviews, {
                id: payload?.reviewId ?? (payload?.versionId ? `review-${payload.versionId}` : null),
                proposalType: payload?.proposalType ?? 'resolved-merge',
                versionId: payload?.versionId ?? null,
                label: payload?.label ?? null,
                parentVersionIds: Array.isArray(payload?.parentVersionIds) ? [...payload.parentVersionIds] : [],
                unresolvedCount: Number(payload?.unresolvedCount ?? 0),
                resolutions: Array.isArray(payload?.resolutions) ? structuredClone(payload.resolutions) : [],
                predictedMergedResult: Array.isArray(payload?.predictedMergedResult)
                    ? structuredClone(payload.predictedMergedResult)
                    : [],
                impactSummary: payload?.impactSummary ? structuredClone(payload.impactSummary) : { breaking: 0, additive: 0, cosmetic: 0 },
                status: 'pending',
                reviewerId: null,
                decisionNote: null,
                createdAt: payload?.timestamp ?? null,
                decisionAt: null,
            });
            break;
        }

        case EventTypes.TOKEN_REVIEW_APPROVE: {
            nextTokenReviews = updateReviewDecision(
                ensured.document.tokenReviews,
                payload?.reviewId ?? null,
                'approved',
                payload,
            );
            break;
        }

        case EventTypes.TOKEN_REVIEW_REJECT: {
            nextTokenReviews = updateReviewDecision(
                ensured.document.tokenReviews,
                payload?.reviewId ?? null,
                'rejected',
                payload,
            );
            break;
        }

        case EventTypes.TOKEN_REVIEW_REQUEST_CHANGES: {
            nextTokenReviews = updateReviewDecision(
                ensured.document.tokenReviews,
                payload?.reviewId ?? null,
                'changes_requested',
                payload,
            );
            break;
        }

        default:
            return state;
    }

    if (nextTokenReviews === ensured.document.tokenReviews) {
        return state;
    }

    return {
        ...state,
        document: {
            ...state.document,
            tokenReviews: nextTokenReviews,
        },
    };
}
