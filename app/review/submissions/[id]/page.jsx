'use client';

import { useMemo } from 'react';
import { useSubmissions } from '@/certification/submissions/useSubmissionStore';
import { WorkspaceShell } from '@/ui/workspace/shared/WorkspaceShell';

export default function SubmissionReviewPage({ params }) {
  const { submissions, updateStatus, updateReviewCriteria } = useSubmissions();
  const submission = submissions.find((s) => s.id === params.id);

  const rubric = useMemo(() => submission?.rubric ?? { criteria: [] }, [submission]);

  if (!submission) return <div>Submission not found</div>;

  return (
    <WorkspaceShell
      modeId="review"
      initialEvents={submission.events ?? []}
      initialCursorIndex={submission.events?.length ? submission.events.length - 1 : -1}
      disableSeed
      reviewSubmission={submission}
      reviewRubric={rubric}
      reviewerId="reviewer-local"
      onReviewDecision={(status) => updateStatus(submission.id, status)}
      onReviewCriteriaChange={(criteria) =>
        updateReviewCriteria(submission.id, criteria)
      }
    />
  );
}
