import { useState } from 'react';

export function useTemplateGenerator() {
  const [open, setOpen] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: [],
    level: 'beginner',
  });

  return {
    open,
    openGenerator: () => setOpen(true),
    closeGenerator: () => setOpen(false),
    metadata,
    setMetadata,
  };
}
