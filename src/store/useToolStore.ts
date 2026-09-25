import { create } from "zustand";
import type { ToolId, Preview } from "../tools/types";

interface ToolState {
  activeTool: ToolId;
  selection: Set<string>;
  preview: Preview | null;
  frozenCanvasWidth: number | null;

  setActiveTool: (id: ToolId) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  setSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setPreview: (p: Preview | null) => void;
  setFrozenCanvasWidth: (w: number | null) => void;
}

export const useToolStore = create<ToolState>((set, get) => ({
  activeTool: "scribing",
  selection: new Set(),
  preview: null,

  setActiveTool: (id) => set({ activeTool: id, preview: null }),
  addToSelection: (id) =>
    set((s) => ({ selection: new Set(s.selection).add(id) })),
  removeFromSelection: (id) =>
    set((s) => {
      const n = new Set(s.selection);
      n.delete(id);
      return { selection: n };
    }),
  toggleSelection: (id: string) =>
    set((state) => {
      const selection = new Set(state.selection);

      if (selection.has(id)) selection.delete(id);
      else selection.add(id);

      return { selection };
    }),

  setSelection: (ids: Iterable<string>) => set({ selection: new Set(ids) }),
  clearSelection: () => set({ selection: new Set() }),
  setPreview: (p) => set({ preview: p }),
  frozenCanvasWidth: null,
  setFrozenCanvasWidth: (w) => set({ frozenCanvasWidth: w }),
}));
