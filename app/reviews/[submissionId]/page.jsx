'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import RequireReviewer from '@/components/guards/RequireReviewer';
import { ReviewerErrorBoundary } from '@/components/guards/ReviewerErrorBoundary';
import ConfirmDecision from '@/components/reviews/ConfirmDecision';
import IssueCertificateButton from '@/components/reviews/IssueCertificateButton';
import { safeMutation } from '@/utils/safeMutation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const statusStyles = {
  submitted: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ReviewDetailPage({ params }) {
  const permission = useQuery(api.assessments.getReviewPermission);
  const assessment = useQuery(
    api.assessments.getById,
    permission?.canReview ? { assessmentId: params.submissionId } : undefined
  );
  const startReview = useMutation(api.assessments.startReview);
  const submitReviewDecision = useMutation(api.assessments.submitReviewDecision);
  const [notes, setNotes] = useState('');

  const isReady = assessment !== undefined;
  const isMissing = isReady && !assessment;
  const isSubmitter = assessment
    ? permission?.userId === assessment.submittedBy
    : false;
  const canStartReview =
    assessment?.status === 'submitted' && !isSubmitter;
  const canDecide =
    assessment?.status === 'under_review' && !isSubmitter;

  useEffect(() => {
    if (!assessment || !canStartReview) return;

    startReview({ assessmentId: assessment._id }).catch((error) => {
      console.error(error);
    });
  }, [assessment, canStartReview, startReview]);

  async function handleStartReview() {
    if (!canStartReview) return;
    try {
      await safeMutation(() => startReview({ assessmentId: assessment._id }));
    } catch (error) {
      alert(error?.message ?? 'Unable to start review');
    }
  }

  async function handleDecision(decision) {
    if (!canDecide) return;
    if (decision === 'rejected' && !notes.trim()) {
      alert('Rejection requires a reason.');
      return;
    }

    try {
      await safeMutation(() =>
        submitReviewDecision({
          assessmentId: assessment._id,
          decision,
          notes: notes.trim() || undefined,
        })
      );
    } catch (error) {
      alert(error?.message ?? 'Unable to submit review decision');
    }
  }

  return (
    <ReviewerErrorBoundary>
      <RequireReviewer>
        <div className="p-6 space-y-6">
          {!isReady ? (
            <div className="text-sm text-slate-500">Loading assessment...</div>
          ) : isMissing ? (
            <div className="text-sm text-slate-500">Assessment not found.</div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold">{assessment.title}</h1>
                  <p className="text-sm text-slate-500">
                    Submitted by {assessment.submittedBy} on{' '}
                    {new Date(assessment.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <Badge className={statusStyles[assessment.status]}>
                  {assessment.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  {assessment.responses.map((item, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <h3 className="font-medium">{item.question}</h3>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-500">{item.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <h3 className="font-medium">Reviewer Decision</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Internal reviewer notes (not visible to submitter)"
                        rows={5}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        disabled={assessment.review != null}
                      />

                      <div className="flex gap-2">
                        <ConfirmDecision
                          label="Reject"
                          variant="destructive"
                          onConfirm={() => handleDecision('rejected')}
                          disabled={!canDecide}
                        />
                        <ConfirmDecision
                          label="Approve"
                          variant="primary"
                          onConfirm={() => handleDecision('approved')}
                          disabled={!canDecide}
                        />
                      </div>

                    {assessment.status === 'submitted' ? (
                      <Button
                        className="w-full"
                        onClick={handleStartReview}
                        disabled={!canStartReview}
                      >
                        Start Review
                      </Button>
                    ) : null}
                    <IssueCertificateButton
                      assessmentId={assessment._id}
                      status={assessment.status}
                    />
                  </CardContent>
                </Card>
              </div>
              </div>
            </>
          )}
        </div>
      </RequireReviewer>
    </ReviewerErrorBoundary>
  );
}
