'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/ui/controls/button';
import { safeMutation } from '@/utils/safeMutation';

export default function IssueCertificateButton({ assessmentId, status }) {
  const permission = useQuery(api.assessments.getReviewPermission);
  const issueCertificate = useMutation(api.certificates.issueCertificate);
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(false);

  if (!permission) return null;
  if (status !== 'approved') return null;
  if (permission.role !== 'admin') return null;

  async function handleIssue() {
    const ok = window.confirm(
      'Issue certificate for this assessment? This action is irreversible.'
    );
    if (!ok) return;

    setLoading(true);
    try {
      await safeMutation(() => issueCertificate({ assessmentId }));
      setIssued(true);
    } catch (error) {
      alert(error?.message ?? 'Unable to issue certificate');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-4 border-t">
      <Button onClick={handleIssue} disabled={loading || issued}>
        {issued ? 'Certificate Issued' : 'Issue Certificate'}
      </Button>
    </div>
  );
}
