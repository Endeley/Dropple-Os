'use client';

import { ConvexProvider } from '../providers/ConvexProvider';
import { OwnershipProvider } from '@/marketplace/useOwnershipStore';
import { SubmissionProvider } from '@/certification/submissions/useSubmissionStore';
import { CertificateProvider } from '@/certification/certificates/useCertificateStore';

export default function Providers({ children }) {
  return (
    <ConvexProvider>
      <OwnershipProvider>
        <SubmissionProvider>
          <CertificateProvider>{children}</CertificateProvider>
        </SubmissionProvider>
      </OwnershipProvider>
    </ConvexProvider>
  );
}
