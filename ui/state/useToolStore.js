import { create } from 'zustand';

export const useToolStore = create((set) => ({
    activeTool: 'select',
    setActiveTool: (toolId) => set({ activeTool: toolId }),
}));
