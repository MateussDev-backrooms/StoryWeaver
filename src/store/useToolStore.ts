import { create } from "zustand";
import type { ToolId, Preview } from "../tools/types";
import { useStore } from "./store";

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

  editingBeatId: string | null;
  setEditingBeatId: (id: string | null) => void;

  linkingFromId: string | null;
  setLinkingFromId: (id: string | null) => void;
  linkTargetId: string | null;
  setLinkTargetId: (id: string | null) => void;

  hiddenLaneIds: Set<string>;
  hideLane: (id: string) => void;
  showLane: (id: string) => void;
  toggleLaneVisibility: (id: string) => void;
  showAllLanes: () => void;
}

export const useToolStore = create<ToolState>((set, get) => ({
  activeTool: "scribing",
  selection: new Set(),
  preview: null,

  setActiveTool: (id) =>
    set({
      activeTool: id,
      preview: null,
      linkingFromId: null,
      linkTargetId: null,
    }),
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

  editingBeatId: null,
  setEditingBeatId: (id) => set({ editingBeatId: id }),

  linkingFromId: null,
  setLinkingFromId: (id) => set({ linkingFromId: id }),
  linkTargetId: null,
  setLinkTargetId: (id) => set({ linkTargetId: id }),

  hiddenLaneIds: new Set(),
  hideLane: (id) =>
  set((s) => {
    const hiddenLaneIds = new Set(s.hiddenLaneIds).add(id);
    // Also drop any beat from the hidden lane out of the selection.
    const lane = useStore.getState().project.lanes.find((l) => l.id === id);
    if (lane) {
      const beatIds = new Set(lane.beats.map((b) => b.id));
      const selection = new Set(s.selection);
      for (const bid of beatIds) selection.delete(bid);
      return { hiddenLaneIds, selection };
    }
    return { hiddenLaneIds };
  }),
  showLane: (id) =>
    set((s) => {
      const n = new Set(s.hiddenLaneIds);
      n.delete(id);
      return { hiddenLaneIds: n };
    }),
  toggleLaneVisibility: (id) =>
    set((s) => {
      const n = new Set(s.hiddenLaneIds);
      n.has(id) ? n.delete(id) : n.add(id);
      return { hiddenLaneIds: n };
    }),
  showAllLanes: () => set({ hiddenLaneIds: new Set() }),
}));
