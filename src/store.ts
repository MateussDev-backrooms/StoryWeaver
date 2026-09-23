// store.ts
import { create } from 'zustand';
import type { Lane, Project } from './types/types';

const uid = () => Math.random().toString(36).slice(2, 10);

const seed: Project = {
  title: 'Untitled',
  lanes: [{
    id: 'l1', name: 'Aria', color: '#22d3ee',
    beats: [
      { id: 'b1', title: 'INTRODUCED',     content: '', time: 0 },
      { id: 'b2', title: 'Gets sword',     content: '', time: 1 },
      { id: 'b3', title: 'Enters dungeon', content: '', time: 2 },
      { id: 'b4', title: 'Fights dragon',  content: '', time: 5 },
      { id: 'b5', title: 'DEAD',           content: '', time: 6 },
    ],
  }],
  links: [
    { id: 'k1', from: 'b1', to: 'b2' },
    { id: 'k2', from: 'b2', to: 'b3' },
    { id: 'k3', from: 'b3', to: 'b4' },
    { id: 'k4', from: 'b4', to: 'b5' },
  ],
};

interface Store {
  project: Project;
  moveBeat: (laneId: string, beatId: string, time: number) => void;
  addLane: () => void;
  removeLane: (laneId: string) => void;
  updateLane: (laneId: string, patch: Partial<Pick<Lane, 'name' | 'color'>>) => void;
  addBeat: (laneId: string, time: number) => void;

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
                  b.id === beatId ? { ...b, time } : b
                ),
              }
        ),
      },
    })),

  addLane: () =>
    set((s) => ({
      project: {
        ...s.project,
        lanes: [
          ...s.project.lanes,
          { id: uid(), name: 'New character', color: '#a3a3a3', beats: [] },
        ],
      },
    })),

  removeLane: (laneId) =>
    set((s) => ({
      project: {
        ...s.project,
        lanes: s.project.lanes.filter((l) => l.id !== laneId),
      },
    })),

  updateLane: (laneId, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        lanes: s.project.lanes.map((l) =>
          l.id === laneId ? { ...l, ...patch } : l
        ),
      },
    })),

    // implementation
    addBeat: (laneId, time) =>
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
                    { id: uid(), title: 'New beat', content: '', time },
                ],
                }
        ),
        },
    })),
}));