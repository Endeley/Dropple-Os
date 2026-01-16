'use client';
import { ConvexProvider } from '../providers/ConvexProvider';
import { OwnershipProvider } from '@/marketplace/useOwnershipStore';
import { SubmissionProvider } from '@/certification/submissions/useSubmissionStore';
import { CertificateProvider } from '@/certification/certificates/useCertificateStore';
import { AnnotationProvider } from '@/certification/annotations/useAnnotationStore';

export default function Providers({ children }) {
  return (
    <ConvexProvider>
      <OwnershipProvider>
        <SubmissionProvider>
          <CertificateProvider>
            <AnnotationProvider>{children}</AnnotationProvider>
          </CertificateProvider>
        </SubmissionProvider>
      </OwnershipProvider>
    </ConvexProvider>
  );
}
