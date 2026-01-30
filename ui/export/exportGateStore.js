import { create } from 'zustand';

export const useExportGateStore = create((set, get) => ({
  open: false,
  result: null,
  proceedAction: null,
  openSheet(result, proceedAction) {
    set({
      open: true,
      result,
      proceedAction: typeof proceedAction === 'function' ? proceedAction : null,
    });
  },
  closeSheet() {
    set({ open: false, result: null, proceedAction: null });
  },
  proceed() {
    const action = get().proceedAction;
    set({ open: false, result: null, proceedAction: null });
    action?.();
  },
}));
