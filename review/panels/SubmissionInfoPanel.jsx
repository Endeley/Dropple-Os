'use client';

export default function SubmissionInfoPanel({ submission }) {
  if (!submission) return null;

  return (
    <div style={{ padding: 12 }}>
      <h3>Submission</h3>
      <div>User: {submission.userId}</div>
      <div>Assessment: {submission.assessmentId}</div>
      <div>Workspace: {submission.workspaceId}</div>
      <div>Submitted: {new Date(submission.submittedAt).toLocaleString()}</div>
      <div>Status: {submission.status}</div>
      <div>Replay Hash: {submission.replayHash}</div>
    </div>
  );
}
