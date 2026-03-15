'use client';

import { useState } from 'react';
import { Button } from '@/ui/controls/ui/button.jsx';

export default function ConfirmDecision({ label, onConfirm, disabled, variant }) {
  const [armed, setArmed] = useState(false);

  function handleArm() {
    if (disabled) return;
    setArmed(true);
  }

  function handleCancel() {
    setArmed(false);
  }

  function handleConfirm() {
    setArmed(false);
    onConfirm?.();
  }

  return (
    <div className="flex flex-col gap-2">
      {armed ? (
        <>
          <div className="text-xs text-slate-500">
            This action is final.
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCancel} disabled={disabled}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={disabled} variant={variant}>
              Confirm {label}
            </Button>
          </div>
        </>
      ) : (
        <Button onClick={handleArm} disabled={disabled} variant={variant}>
          {label}
        </Button>
      )}
    </div>
  );
}
