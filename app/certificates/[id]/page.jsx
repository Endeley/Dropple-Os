'use client';

import { useCertificates } from '@/certification/certificates/useCertificateStore';

export default function CertificateDetail({ params }) {
  const { certificates } = useCertificates();
  const cert = certificates.find((c) => c.id === params.id);

  if (!cert) return <div>Certificate not found</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Certificate</h2>

      <div>User: {cert.userId}</div>
      <div>Track: {cert.trackId}</div>
      <div>Issued: {new Date(cert.issuedAt).toLocaleString()}</div>
      <div>Verification: {cert.verificationLevel}</div>

      <h3>Evidence</h3>
      <div>Replay hash: {cert.evidence.replayHash}</div>
      <div>Workspace: {cert.evidence.workspaceId}</div>

      <p style={{ marginTop: 12, fontSize: 12 }}>
        This certificate is backed by replayed evidence.
      </p>
    </div>
  );
}
