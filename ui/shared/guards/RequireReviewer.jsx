'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function RequireReviewer({ children }) {
  const router = useRouter();
  const permission = useQuery(api.assessments.getReviewPermission);

  useEffect(() => {
    if (permission && !permission.canReview) {
      router.replace('/');
    }
  }, [permission, router]);

  if (!permission) {
    return <div className="p-6">Checking permissions...</div>;
  }

  if (!permission.canReview) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500">Role: {permission.role}</div>
      {children}
    </div>
  );
}
