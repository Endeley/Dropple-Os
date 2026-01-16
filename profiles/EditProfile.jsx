'use client';

import { useCallback } from 'react';
import { upsertCreator } from './creatorStore';
import { getCurrentCreatorId } from './currentCreator';

export function EditProfile() {
  const onEdit = useCallback(() => {
    const name = window.prompt('Your name');
    if (!name) return;

    const bio = window.prompt('Bio (optional)') || '';

    upsertCreator({
      id: getCurrentCreatorId(),
      name,
      bio,
      createdAt: Date.now(),
    });
  }, []);

  return (
    <button type="button" onClick={onEdit}>
      Edit profile
    </button>
  );
}
