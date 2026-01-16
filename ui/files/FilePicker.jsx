'use client';

import { useCallback } from 'react';

export function FilePicker({ accept, onFile, inputRef }) {
  const handleChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        onFile?.(file);
      }
      event.target.value = '';
    },
    [onFile]
  );

  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      onChange={handleChange}
      style={{ display: 'none' }}
    />
  );
}
