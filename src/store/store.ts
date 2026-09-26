// store.ts
import { create } from "zustand";
import type { Beat, Lane, Project } from "../types/types";

const uid = () => Math.random().toString(36).slice(2, 10);

const seed: Project = {
  title: "Untitled",
  lanes: [
    {
      id: "l1",
      name: "Aria",
      color: "#22d3ee",
      group: "Protagonist",
      beats: [
        { id: "b1", title: "INTRODUCED", content: "", time: 0 },
        { id: "b2", title: "Gets sword", content: "", time: 1 },
        { id: "b3", title: "Enters dungeon", content: "", time: 2 },
        { id: "b4", title: "Fights dragon", content: "", time: 5 },
        { id: "b5", title: "DEAD", content: "", time: 6 },
      ],
    },
  ],
  links: [
    { id: "k1", from: "b1", to: "b2" },
    { id: "k2", from: "b2", to: "b3" },
    { id: "k3", from: "b3", to: "b4" },
    { id: "k4", from: "b4", to: "b5" },
  ],
};

interface Store {
  project: Project;
  moveBeat: (laneId: string, beatId: string, time: number) => void;
  addLane: (draft: { name: string; color: string; group: string }) => void;
  removeLane: (laneId: string) => void;
  updateLane: (
    laneId: string,
    patch: Partial<Pick<Lane, "name" | "color" | "group">>,
  ) => void;
  addBeat: (laneId: string, time: number) => string;
  appendBeat: (laneId: string, time: number, connectFrom?: string) => string;
  moveBeats: (
    updates: { laneId: string; beatId: string; time: number }[],
  ) => void;
  deleteBeat: (laneId: string, beatId: string) => void;
  addLink: (from: string, to: string) => void;
  deleteLink: (linkId: string) => void;
  updateBeatTitle: (beatId: string, title: string) => void;
  updateBeat: (beatId: string, patch: Partial<Pick<Beat, 'title' | 'content'>>) => void;
  reorderLane: (laneId: string, beforeLaneId: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  project: seed,

  moveBeat: (laneId, beatId, time) =>
    set((s) => ({
      project: {
        ...s.project,
        lanes: s.project.lanes.map((lane) =>
          lane.id !== laneId
            ? lane
            : {
                ...lane,
                beats: lane.beats.map((b) =>
                  b.id === beatId ? { ...b, time } : b,
                ),
              },
        ),
      },
    })),

  addLane: (draft: { name: string; color: string; group: string }) =>
    set((s) => ({
      project: {
        ...s.project,
        lanes: [...s.project.lanes, { id: uid(), ...draft, beats: [] }],
      },
    })),

  removeLane: (laneId) =>
  set((s) => {
    const lane = s.project.lanes.find((l) => l.id === laneId);
    if (!lane) return s;
    const beatIds = new Set(lane.beats.map((b) => b.id));
    return {
      project: {
        ...s.project,
        lanes: s.project.lanes.filter((l) => l.id !== laneId),
        links: s.project.links.filter(
          (k) => !beatIds.has(k.from) && !beatIds.has(k.to),
        ),
      },
    };
  }),

  updateLane: (laneId, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        lanes: s.project.lanes.map((l) =>
          l.id === laneId ? { ...l, ...patch } : l,
        ),
      },
    })),

  addBeat: (laneId, time) => {
    const id = uid();
    set((s) => ({
      project: {
        ...s.project,
        lanes: s.project.lanes.map((l) =>
          l.id !== laneId
            ? l
            : {
                ...l,
                beats: [
                  ...l.beats,
                  { id, title: "New beat", content: "", time },
                ],
              },
        ),
      },
    }));
    return id;
  },

  moveBeats: (updates) =>
    set((s) => {
      const byLane = new Map<string, Map<string, number>>();
      for (const u of updates) {
        if (!byLane.has(u.laneId)) byLane.set(u.laneId, new Map());
        byLane.get(u.laneId)!.set(u.beatId, u.time);
      }
      return {
        project: {
          ...s.project,
          lanes: s.project.lanes.map((l) => {
            const m = byLane.get(l.id);
            if (!m) return l;
            return {
              ...l,
              beats: l.beats.map((b) =>
                m.has(b.id) ? { ...b, time: m.get(b.id)! } : b,
              ),
            };
          }),
        },
      };
    }),

  deleteBeat: (laneId, beatId) =>
    set((s) => ({
      project: {
        ...s.project,
        lanes: s.project.lanes.map((l) =>
          l.id !== laneId
            ? l
            : { ...l, beats: l.beats.filter((b) => b.id !== beatId) },
        ),
        links: s.project.links.filter(
          (k) => k.from !== beatId && k.to !== beatId,
        ),
      },
    })),

  addLink: (from, to) =>
    set((s) => {
      if (from === to) return s;
      if (s.project.links.some((k) => k.from === from && k.to === to)) return s;
      return {
        project: {
          ...s.project,
          links: [...s.project.links, { id: uid(), from, to }],
        },
      };
    }),

  deleteLink: (linkId) =>
    set((s) => ({
      project: {
        ...s.project,
        links: s.project.links.filter((k) => k.id !== linkId),
      },
    })),
  appendBeat: (laneId, time, connectFrom) => {
    const id = uid();
    set((s) => {
      const links = connectFrom
        ? [...s.project.links, { id: uid(), from: connectFrom, to: id }]
        : s.project.links;
      return {
        project: {
          ...s.project,
          lanes: s.project.lanes.map((l) =>
            l.id !== laneId
              ? l
              : {
                  ...l,
                  beats: [
                    ...l.beats,
                    { id, title: "New beat", content: "", time },
                  ],
                },
          ),
          links,
        },
      };
    });
    return id;
  },

  updateBeatTitle: (beatId, title) =>
    set((s) => ({
      project: {
        ...s.project,
        lanes: s.project.lanes.map((l) => ({
          ...l,
          beats: l.beats.map((b) => (b.id === beatId ? { ...b, title } : b)),
        })),
      },
    })),

  updateBeat: (beatId, patch) =>
  set((s) => ({
    project: {
      ...s.project,
      lanes: s.project.lanes.map((l) => ({
        ...l,
        beats: l.beats.map((b) => (b.id === beatId ? { ...b, ...patch } : b)),
      })),
    },
  })),

  reorderLane: (laneId, beforeLaneId) =>
  set((s) => {
    const lanes = s.project.lanes;
    const from = lanes.findIndex((l) => l.id === laneId);
    if (from < 0) return s;

    const moving = lanes[from];
    const without = lanes.filter((l) => l.id !== laneId);

    if (beforeLaneId === null) {
      return { project: { ...s.project, lanes: [...without, moving] } };
    }

    const to = without.findIndex((l) => l.id === beforeLaneId);
    if (to < 0) return s;

    return {
      project: {
        ...s.project,
        lanes: [...without.slice(0, to), moving, ...without.slice(to)],
      },
    };
  }),
}));
