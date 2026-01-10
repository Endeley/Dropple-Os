export type Certificate = {
  id: string;
  userId: string;
  trackId: string;
  submissionId: string;
  issuedAt: number;
  verificationLevel: 'teacher' | 'platform';
  evidence: {
    replayHash: string;
    workspaceId: string;
  };
};
