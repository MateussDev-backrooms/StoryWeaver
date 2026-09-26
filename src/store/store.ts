// store.ts
import { create } from "zustand";
import type { Beat, Lane, Marker, Project, Section } from "../types/types";
import { temporal } from "zundo";
import { throttle } from "../lib/throttle";
import { emptyProject, hydrateProject } from "../lib/persistence";
import { bootProject, deleteProject } from "../lib/storage";
import { BEAT_DEFAULT_DURATION } from "../constants";
import { getSectionRange } from "../lib/sections";

const uid = () => Math.random().toString(36).slice(2, 10);

const bootedProject = bootProject();

interface Store {
  project: Project;

  addLane: (draft: { name: string; color: string; group: string }) => void;
  removeLane: (laneId: string) => void;
  updateLane: (
    laneId: string,
    patch: Partial<Pick<Lane, "name" | "color" | "group">>,
  ) => void;
  reorderLane: (laneId: string, beforeLaneId: string | null) => void;

  addBeat: (laneId: string, time: number) => string;
  appendBeat: (laneId: string, time: number, connectFrom?: string) => string;
  moveBeat: (laneId: string, beatId: string, time: number) => void;
  moveBeats: (
    updates: { laneId: string; beatId: string; time: number }[],
  ) => void;
  deleteBeat: (laneId: string, beatId: string) => void;
  updateBeatTitle: (beatId: string, title: string) => void;
  updateBeat: (
    beatId: string,
    patch: Partial<Pick<Beat, "title" | "content">>,
  ) => void;
  resizeBeat: (
    laneId: string,
    beatId: string,
    patch: { time?: number; duration?: number },
  ) => void;

  addLink: (from: string, to: string) => void;
  deleteLink: (linkId: string) => void;

  loadProject: (project: Project) => void;

  createProject: (meta: { name: string; color: string; icon: string }) => void;
  deleteProject: (id: string) => void;

  addMarker: (draft: Omit<Marker, "id">) => string;
  updateMarker: (id: string, patch: Partial<Marker>) => void;
  deleteMarker: (id: string) => void;

  addSection: (
    draft: Omit<Section, "id">,
  ) => { ok: true; id: string } | { ok: false; reason: string };
  updateSection: (id: string, patch: Partial<Section>) => void;
  deleteSection: (id: string) => void;
}

export const useStore = create<Store>()(
  temporal(
    (set, get) => ({
      project: bootedProject,

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
                      {
                        id,
                        title: "New beat",
                        content: "",
                        time,
                        duration: BEAT_DEFAULT_DURATION,
                      },
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
          if (s.project.links.some((k) => k.from === from && k.to === to))
            return s;
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
                        {
                          id,
                          title: "New beat",
                          content: "",
                          time,
                          duration: BEAT_DEFAULT_DURATION,
                        },
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
              beats: l.beats.map((b) =>
                b.id === beatId ? { ...b, title } : b,
              ),
            })),
          },
        })),

      updateBeat: (beatId, patch) =>
        set((s) => ({
          project: {
            ...s.project,
            lanes: s.project.lanes.map((l) => ({
              ...l,
              beats: l.beats.map((b) =>
                b.id === beatId ? { ...b, ...patch } : b,
              ),
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

      loadProject: (project: Project) => {
        const hydrated = hydrateProject(project);
        set({ project: hydrated });
        useStore.temporal.getState().clear();
      },

      createProject: (meta) => {
        const project = emptyProject({
          name: meta.name,
          color: meta.color,
          icon: meta.icon,
        });
        set({ project });
        useStore.temporal.getState().clear();
      },

      deleteProject: (id) => {
        const wasActive = useStore.getState().project.id === id;
        deleteProject(id);
        if (wasActive) {
          const next = bootProject();
          set({ project: next });
          useStore.temporal.getState().clear();
        }
      },

      addMarker: (draft) => {
        const id = uid();
        set((s) => ({
          project: {
            ...s.project,
            markers: [...s.project.markers, { id, ...draft }],
          },
        }));
        return id;
      },

      updateMarker: (id, patch) =>
        set((s) => ({
          project: {
            ...s.project,
            markers: s.project.markers.map((m) =>
              m.id === id ? { ...m, ...patch } : m,
            ),
          },
        })),

      deleteMarker: (id) =>
        set((s) => ({
          project: {
            ...s.project,
            markers: s.project.markers.filter((m) => m.id !== id),
            sections: s.project.sections.filter(
              (sec) => sec.startMarkerId !== id && sec.endMarkerId !== id,
            ),
          },
        })),

      addSection: (draft) => {
        const s = get();
        if (draft.startMarkerId === draft.endMarkerId) {
          return { ok: false, reason: "Start and end must differ" };
        }

        const newRange = getSectionRange(draft, s.project);
        if (!newRange) {
          return {
            ok: false,
            reason: "One of the boundaries could not be resolved",
          };
        }

        for (const existing of s.project.sections) {
          const er = getSectionRange(existing, s.project);
          if (!er) continue;
          if (newRange.start < er.end && newRange.end > er.start) {
            return { ok: false, reason: `Overlaps with "${existing.name}"` };
          }
        }

        const id = uid();
        set((st) => ({
          project: {
            ...st.project,
            sections: [...st.project.sections, { id, ...draft }],
          },
        }));
        return { ok: true, id };
      },

      updateSection: (id, patch) =>
        set((s) => ({
          project: {
            ...s.project,
            sections: s.project.sections.map((sec) =>
              sec.id === id ? { ...sec, ...patch } : sec,
            ),
          },
        })),

      deleteSection: (id) =>
        set((s) => ({
          project: {
            ...s.project,
            sections: s.project.sections.filter((sec) => sec.id !== id),
          },
        })),

      resizeBeat: (laneId, beatId, patch) =>
        set((s) => ({
          project: {
            ...s.project,
            lanes: s.project.lanes.map((l) =>
              l.id !== laneId
                ? l
                : {
                    ...l,
                    beats: l.beats.map((b) =>
                      b.id === beatId ? { ...b, ...patch } : b,
                    ),
                  },
            ),
          },
        })),
    }),
    {
      partialize: (state) => ({ project: state.project }),

      // Cap memory. 100 entries of a small object graph is nothing.
      limit: 100,

      // Coalesce rapid-fire updates into ~1 entry per 400ms.
      handleSet: (handleSet) => throttle(handleSet, 400),
    },
  ),
);
