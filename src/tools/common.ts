import { PIXELS_PER_UNIT } from '../constants';
import type { ToolContext, ToolGesture } from './types';

export function clickSelect(ctx: ToolContext, beatId: string) {
  if (ctx.modifiers.shift) {
    ctx.selection.toggle(beatId);
  } else if (!ctx.selection.has(beatId)) {
    ctx.selection.set([beatId]);
  }
}

export function dragBeatGesture(ctx: ToolContext): ToolGesture {
  const beatId = ctx.hit.kind === 'beat' ? ctx.hit.beat.id : undefined;
  if (!beatId) return {};

  if (!ctx.selection.has(beatId)) {
    if (ctx.modifiers.shift) {
      ctx.selection.add(beatId);
    } else {
      ctx.selection.set([beatId]);
    }
  }

  const startX = ctx.pointer.canvasX;
  const initialTimes = new Map<string, number>();

  for (const id of ctx.selection.ids) {
    const beat = ctx.actions.findBeat(id);
    if (beat) initialTimes.set(id, beat.time);
  }

  return {
    onPointerMove: (c) => {
      const dt = (c.pointer.canvasX - startX) / PIXELS_PER_UNIT;

      const updates = [...initialTimes].flatMap(([id, time]) => {
        const laneId = ctx.actions.findLaneOfBeat(id);
        if (!laneId) return [];

        return [{
          laneId,
          beatId: id,
          time: snap(Math.max(0, time + dt)),
        }];
      });

      ctx.actions.moveBeats(updates);
    },
  };
}

const snap = (time: number) => Math.round(time * 4) / 4;