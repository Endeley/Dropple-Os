'use client';

import { Button } from '@/components/ui/button';

export default function ConfirmDecision({ label, onConfirm, disabled, variant }) {
  function handleClick() {
    const ok = window.confirm(
      'This action is final and cannot be undone. Continue?'
    );
    if (ok) onConfirm?.();
  }

  return (
    <Button onClick={handleClick} disabled={disabled} variant={variant}>
      {label}
    </Button>
  );
}
