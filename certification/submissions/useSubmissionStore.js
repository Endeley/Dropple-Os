'use client';

import { createContext, useContext, useState } from 'react';
import { hashReplay } from '../replay/hashReplay';

const SubmissionContext = createContext(null);

export function SubmissionProvider({ children }) {
  const [submissions, setSubmissions] = useState([]);

  async function submit({ assessmentId, userId, workspaceId, events, rubric }) {
    const replayHash = await hashReplay(events);

    const submission = {
      id: globalThis.crypto?.randomUUID?.() ?? `submission_${Date.now()}`,
      assessmentId,
      userId,
      workspaceId,
      events,
      rubric,
      replayHash,
      submittedAt: Date.now(),
      status: 'pending',
      review: {
        criteria: {},
      },
    };

    setSubmissions((current) => [...current, submission]);
    return submission;
  }

  function updateStatus(id, status) {
    setSubmissions((current) =>
      current.map((sub) => (sub.id === id ? { ...sub, status } : sub))
    );
  }

  function updateReviewCriteria(id, criteria) {
    setSubmissions((current) =>
      current.map((sub) =>
        sub.id === id ? { ...sub, review: { ...sub.review, criteria } } : sub
      )
    );
  }

  return (
    <SubmissionContext.Provider
      value={{ submissions, submit, updateStatus, updateReviewCriteria }}
    >
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmissions() {
  return useContext(SubmissionContext);
}
