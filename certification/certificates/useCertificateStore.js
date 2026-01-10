'use client';

import { createContext, useContext, useState } from 'react';

const CertificateContext = createContext(null);

export function CertificateProvider({ children }) {
  const [certificates, setCertificates] = useState([]);

  function issueCertificate({
    userId,
    trackId,
    submission,
    verificationLevel = 'teacher',
  }) {
    if (!submission || submission.status !== 'passed') {
      return null;
    }

    const cert = {
      id: globalThis.crypto?.randomUUID?.() ?? `cert_${Date.now()}`,
      userId,
      trackId,
      submissionId: submission.id,
      issuedAt: Date.now(),
      verificationLevel,
      evidence: {
        replayHash: submission.replayHash,
        workspaceId: submission.workspaceId,
      },
    };

    setCertificates((current) => [...current, cert]);
    return cert;
  }

  function getCertificatesForUser(userId) {
    return certificates.filter((c) => c.userId === userId);
  }

  return (
    <CertificateContext.Provider
      value={{ certificates, issueCertificate, getCertificatesForUser }}
    >
      {children}
    </CertificateContext.Provider>
  );
}

export function useCertificates() {
  return useContext(CertificateContext);
}
