'use client';

import { ExportWarningSheet } from './ExportWarningSheet';
import { useExportGateStore } from './exportGateStore';

export function ExportGateOverlay() {
  const open = useExportGateStore((state) => state.open);
  const result = useExportGateStore((state) => state.result);
  const closeSheet = useExportGateStore((state) => state.closeSheet);
  const proceed = useExportGateStore((state) => state.proceed);

  if (!result) return null;

  return (
    <ExportWarningSheet
      result={result}
      open={open}
      onCancel={closeSheet}
      onProceed={proceed}
    />
  );
}
