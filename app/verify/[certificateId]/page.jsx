'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VerifyCertificatePage({ params }) {
  const { certificateId } = params;

  const result = useQuery(api.certificates.verifyCertificate, {
    certificateId,
  });

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-500">Verifying certificate...</p>
      </div>
    );
  }

  if (!result.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <h1 className="text-xl font-semibold">Certificate Not Found</h1>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              This certificate ID is not valid or does not exist in Dropple OS.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Certificate Verified</h1>
            <Badge className="bg-green-100 text-green-800">Valid</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-slate-500">Issued To</p>
            <p className="font-medium">{result.issuedTo}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Issued At</p>
            <p className="font-medium">
              {new Date(result.issuedAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Assessment ID</p>
            <p className="font-mono text-sm break-all">
              {result.assessmentId}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-slate-500">
              Issued and verified by Dropple OS
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
