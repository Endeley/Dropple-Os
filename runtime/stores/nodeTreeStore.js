import { create } from 'zustand';

export const useNodeTreeStore = create(() => ({
  nodes: {},
  rootIds: [],
}));
