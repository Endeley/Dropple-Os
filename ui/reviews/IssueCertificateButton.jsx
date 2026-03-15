'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/ui/controls/ui/button.jsx';
import { safeMutation } from '@/utils/safeMutation';

export default function IssueCertificateButton({ assessmentId, status }) {
  const permission = useQuery(api.assessments.getReviewPermission);
  const issueCertificate = useMutation(api.certificates.issueCertificate);
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(false);
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState(null);

  if (!permission) return null;
  if (status !== 'approved') return null;
  if (permission.role !== 'admin') return null;

  async function handleIssue() {
    if (loading || issued) return;
    if (!armed) {
      setArmed(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await safeMutation(() => issueCertificate({ assessmentId }));
      setIssued(true);
    } catch (error) {
      setError(error?.message ?? 'Unable to issue certificate');
    } finally {
      setLoading(false);
      setArmed(false);
    }
  }

  return (
    <div className="pt-4 border-t">
      <div className="flex flex-col gap-2">
        <Button onClick={handleIssue} disabled={loading || issued}>
          {issued
            ? 'Certificate Issued'
            : armed
              ? 'Confirm Issue'
              : 'Issue Certificate'}
        </Button>
        {armed && !issued ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>This action is final.</span>
            <Button onClick={() => setArmed(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        ) : null}
        {error ? <div className="text-xs text-rose-600">{error}</div> : null}
      </div>
    </div>
  );
}
