'use client';

import { useCertificates } from '@/certification/certificates/useCertificateStore';
import { colors, radius, spacing } from '@/ui/tokens';

export default function ReviewToolbar({ submission, onDecision }) {
  const { issueCertificate } = useCertificates();
  const canIssue = submission?.status === 'passed';

  function issue() {
    if (!canIssue) return;

    issueCertificate({
      userId: submission.userId,
      trackId: submission.assessmentId,
      submission,
      verificationLevel: 'teacher',
    });

    alert('Certificate issued');
  }
  return (
    <div
      className="toolbar"
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        padding: `0 ${spacing.lg}px`,
        borderBottom: `1px solid ${colors.border}`,
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 13, color: colors.textMuted }}>Review</div>
      <button
        onClick={() => onDecision?.('passed')}
        style={{
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        Mark Passed
      </button>
      <button
        onClick={() => onDecision?.('failed')}
        style={{
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        Mark Failed
      </button>
      <button
        onClick={() => onDecision?.('revision')}
        style={{
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        Needs Revision
      </button>
      <button
        disabled={!canIssue}
        onClick={issue}
        style={{
          height: 32,
          padding: `0 ${spacing.sm}px`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          background: '#fff',
          fontSize: 12,
        }}
      >
        Issue Certificate
      </button>
    </div>
  );
}
