'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader } from '@/ui/controls/card';
import { Badge } from '@/ui/controls/badge';

const statusStyles = {
  submitted: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ReviewQueue() {
  const assessments = useQuery(api.assessments.listForReview);

  if (!assessments) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="p-6 text-center space-y-2">
        <h2 className="text-lg font-medium">No assessments to review</h2>
        <p className="text-sm text-slate-500">
          You are all caught up. New submissions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {assessments.map((assessment) => (
        <Card key={assessment._id} className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">{assessment.title}</h3>
              <p className="text-sm text-slate-500">
                Submitted by {assessment.submittedBy}
              </p>
            </div>

            <Badge className={statusStyles[assessment.status]}>
              {assessment.status.replace('_', ' ')}
            </Badge>
          </CardHeader>

          <CardContent className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Submitted {new Date(assessment.submittedAt).toLocaleDateString()}
            </span>

            <Link
              href={`/reviews/${assessment._id}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Review -&gt;
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
