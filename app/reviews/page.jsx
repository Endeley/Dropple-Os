'use client';

import RequireReviewer from '@/components/guards/RequireReviewer';
import { ReviewerErrorBoundary } from '@/components/guards/ReviewerErrorBoundary';
import ReviewQueue from '@/components/reviews/ReviewQueue';

export default function ReviewQueuePage() {
  return (
    <ReviewerErrorBoundary>
      <RequireReviewer>
        <ReviewQueue />
      </RequireReviewer>
    </ReviewerErrorBoundary>
  );
}
