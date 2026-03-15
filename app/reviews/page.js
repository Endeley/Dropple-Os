'use client';

import RequireReviewer from '@/ui/shared/guards/RequireReviewer';
import { ReviewerErrorBoundary } from '@/ui/shared/guards/ReviewerErrorBoundary';
import ReviewQueue from '@/ui/reviews/ReviewQueue';

export default function ReviewQueuePage() {
  return (
    <ReviewerErrorBoundary>
      <RequireReviewer>
        <ReviewQueue />
      </RequireReviewer>
    </ReviewerErrorBoundary>
  );
}
