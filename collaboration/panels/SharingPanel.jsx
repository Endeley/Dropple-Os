'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function SharingPanel({ docId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const invite = useMutation(api.collaboration.inviteToDocument);
  const revoke = useMutation(api.collaboration.revokeDocumentInvite);
  const invites = useQuery(api.collaboration.listInvitesForDocument, { docId });

  async function sendInvite() {
    const trimmed = email.trim();
    if (!trimmed) return;
    await invite({ docId, email: trimmed, role });
    setEmail('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <strong>Invite by email</strong>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            style={{ flex: 1 }}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button onClick={sendInvite}>Invite</button>
        </div>
      </div>

      {invites?.length ? (
        <div>
          <strong>Pending invites</strong>
          <div style={{ marginTop: 6 }}>
            {invites.map((inviteItem) => (
              <div
                key={inviteItem._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span>
                  {inviteItem.email} · {inviteItem.role}
                </span>
                <button
                  onClick={() => revoke({ inviteId: inviteItem._id })}
                  style={{ fontSize: 12 }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
