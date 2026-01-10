'use client';

import { useCertificates } from '@/certification/certificates/useCertificateStore';

export default function CertificatesPage() {
  const user = { id: 'user-local' };
  const { getCertificatesForUser } = useCertificates();
  const certs = getCertificatesForUser(user.id);

  return (
    <div style={{ padding: 24 }}>
      <h2>Your Certificates</h2>

      {certs.map((c) => (
        <div
          key={c.id}
          style={{
            marginTop: 12,
            padding: 16,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fff',
          }}
        >
          <strong>{c.trackId}</strong>
          <div>Issued: {new Date(c.issuedAt).toLocaleDateString()}</div>
          <div>Verification: {c.verificationLevel}</div>

          <a href={`/certificates/${c.id}`}>View Certificate</a>
        </div>
      ))}
    </div>
  );
}
