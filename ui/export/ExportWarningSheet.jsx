'use client';

import { useEffect } from 'react';
import { Sheet } from './Sheet';
import { SheetHeader } from './SheetHeader';
import { SheetSummary } from './SheetSummary';
import { SheetIssues } from './SheetIssues';
import { SheetFooter } from './SheetFooter';

export function ExportWarningSheet({ result, open, onCancel, onProceed }) {
  if (!result) return null;

  useEffect(() => {
    if (!open) return undefined;

    function handleKeydown(event) {
      if (event.key !== 'Escape') return;

      const active = document.activeElement;
      const tag = active?.tagName?.toLowerCase();
      const isEditable =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        active?.isContentEditable;

      if (isEditable) return;

      onCancel?.();
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [open, onCancel]);

  return (
    <Sheet open={open} side="right" width={400}>
      <SheetHeader status={result.status} onCancel={onCancel} />
      <SheetSummary summary={result.summary} />
      <SheetIssues
        blockingIssues={result.blockingIssues}
        warnings={result.warnings}
        status={result.status}
      />
      <SheetFooter status={result.status} onCancel={onCancel} onProceed={onProceed} />
    </Sheet>
  );
}
