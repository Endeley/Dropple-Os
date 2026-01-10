'use client';

import { useSubmissions } from './useSubmissionStore';

export default function SubmissionList({ userId }) {
  const { submissions } = useSubmissions();
  const mine = submissions.filter((submission) => submission.userId === userId);

  return (
    <div>
      <h3>Your Submissions</h3>
      {mine.map((submission) => (
        <div key={submission.id}>
          Assessment: {submission.assessmentId} — {submission.status}
        </div>
      ))}
    </div>
  );
}
