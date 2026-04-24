'use client';

function ReviewList({ title, reviews, selectedReviewId, onSelect, testId }) {
    return (
        <div className='inspector-block inspector-group'>
            <div className='inspector-title'>{title}</div>
            {reviews.length === 0 ? (
                <div className='inspector-muted'>None</div>
            ) : (
                <div className='inspector-group' data-testid={testId}>
                    {reviews.map((review) => (
                        <button
                            key={review.id}
                            type='button'
                            className={`token-review-panel__review-chip inspector-button${review.id === selectedReviewId ? ' is-selected' : ''}`}
                            onClick={() => onSelect(review.id)}
                            data-testid={`token-review-chip-${review.id}`}
                        >
                            {review.id}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function TokenReviewPanel({
    workflow,
    selectedReviewId,
    onSelectReview,
    reviewerId,
    onReviewerIdChange,
    decisionNote,
    onDecisionNoteChange,
    onApprove,
    onReject,
    onRequestChanges,
}) {
    const review = workflow?.selectedReview ?? null;

    if ((workflow?.reviews?.length ?? 0) === 0) {
        return (
            <div className='inspector-block inspector-group' data-testid='token-review-panel-empty'>
                <div className='inspector-title'>Token Review</div>
                <div className='inspector-muted'>No token review proposals have been submitted yet.</div>
            </div>
        );
    }

    return (
        <div className='token-review-panel inspector-group' data-testid='token-review-panel'>
            <div className='inspector-block inspector-group'>
                <div className='inspector-title'>Token Review</div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Pending</span>
                    <span data-testid='token-review-pending-count'>{workflow.reviewStats.pending}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Approved</span>
                    <span data-testid='token-review-approved-count'>{workflow.reviewStats.approved}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Rejected</span>
                    <span data-testid='token-review-rejected-count'>{workflow.reviewStats.rejected}</span>
                </div>
                <div className='inspector-row'>
                    <span className='inspector-muted'>Changes requested</span>
                    <span data-testid='token-review-changes-count'>{workflow.reviewStats.changesRequested}</span>
                </div>
            </div>

            <ReviewList
                title='Pending Reviews'
                reviews={workflow.pendingReviews}
                selectedReviewId={selectedReviewId}
                onSelect={onSelectReview}
                testId='token-review-pending-list'
            />

            <ReviewList
                title='Approved Reviews'
                reviews={workflow.approvedReviews}
                selectedReviewId={selectedReviewId}
                onSelect={onSelectReview}
                testId='token-review-approved-list'
            />

            <ReviewList
                title='Changes Requested'
                reviews={workflow.changesRequestedReviews}
                selectedReviewId={selectedReviewId}
                onSelect={onSelectReview}
                testId='token-review-changes-list'
            />

            <ReviewList
                title='Rejected Reviews'
                reviews={workflow.rejectedReviews}
                selectedReviewId={selectedReviewId}
                onSelect={onSelectReview}
                testId='token-review-rejected-list'
            />

            {review ? (
                <div className='inspector-block inspector-group'>
                    <div className='inspector-title'>Selected Review</div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Review</span>
                        <span data-testid='token-review-selected-id'>{review.id}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Status</span>
                        <span data-testid='token-review-selected-status'>{review.status}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Version</span>
                        <span>{review.versionId ?? 'none'}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Parents</span>
                        <span>{review.parentVersionIds.join(', ') || 'none'}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Predicted result</span>
                        <span>{review.predictedMergedResult.length}</span>
                    </div>
                    <div className='inspector-row'>
                        <span className='inspector-muted'>Impact</span>
                        <span>{`B:${review.impactSummary.breaking} A:${review.impactSummary.additive} C:${review.impactSummary.cosmetic}`}</span>
                    </div>
                    <input
                        className='token-version-graph__input'
                        placeholder='Reviewer id'
                        value={reviewerId}
                        onChange={(event) => onReviewerIdChange(event.target.value)}
                        data-testid='token-review-reviewer-id'
                    />
                    <input
                        className='token-version-graph__input'
                        placeholder='Decision note'
                        value={decisionNote}
                        onChange={(event) => onDecisionNoteChange(event.target.value)}
                        data-testid='token-review-decision-note'
                    />
                    <div className='token-review-panel__actions inspector-row'>
                        <button
                            type='button'
                            className='inspector-button'
                            onClick={onApprove}
                            data-testid='token-review-approve-button'
                        >
                            Approve
                        </button>
                        <button
                            type='button'
                            className='inspector-button'
                            onClick={onRequestChanges}
                            data-testid='token-review-request-changes-button'
                        >
                            Request changes
                        </button>
                        <button
                            type='button'
                            className='inspector-button'
                            onClick={onReject}
                            data-testid='token-review-reject-button'
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
