'use client';

import { useSubmissions } from './submissions/useSubmissionStore';

export default function SubmitAssessmentButton({
  assessment,
  user,
  workspaceId,
  events,
}) {
  const { submit } = useSubmissions();

  function onSubmit() {
    submit({
      assessmentId: assessment.id,
      userId: user.id,
      workspaceId,
      events,
      rubric: assessment.rubric,
    });

    alert('Submission received. Review pending.');
  }

  return <button onClick={onSubmit}>Submit for Assessment</button>;
}
