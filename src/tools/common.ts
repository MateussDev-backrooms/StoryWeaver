import { BEAT_MIN_DURATION, PIXELS_PER_UNIT } from '../constants';
import { useStore } from '../store/store';
import { useToolStore } from '../store/useToolStore';
import type { ToolContext, ToolGesture } from './types';

export function clickSelect(ctx: ToolContext, beatId: string) {
  if (ctx.modifiers.shift) {
    ctx.selection.toggle(beatId);
  } else if (!ctx.selection.has(beatId)) {
    ctx.selection.set([beatId]);
  }
}

export function dragBeatGesture(ctx: ToolContext): ToolGesture {
  const beatId = ctx.hit.kind === "beat" ? ctx.hit.beat.id : undefined;
  if (!beatId) return {};

  if (!ctx.selection.has(beatId)) {
    if (ctx.modifiers.shift) ctx.selection.add(beatId);
    else ctx.selection.set([beatId]);
  }

  const startX = ctx.pointer.canvasX;
  const ripple = useToolStore.getState().rippleEdit;
  const project = useStore.getState().project;

  // Which beats are moving?
  const initialTimes = new Map<string, number>();
  const movingLane = ctx.actions.findLaneOfBeat(beatId);

  if (ripple && movingLane) {
    const lane = project.lanes.find((l) => l.id === movingLane);
    if (lane) {
      // Anchor = earliest time among the currently selected beats in this lane
      const selectedTimes = lane.beats
        .filter((b) => ctx.selection.has(b.id))
        .map((b) => b.time);
      const anchor = selectedTimes.length
        ? Math.min(...selectedTimes)
        : ctx.actions.findBeat(beatId)?.time ?? 0;

      // Ripple: selected beats AND everything at-or-after the anchor in this lane
      for (const b of lane.beats) {
        if (ctx.selection.has(b.id) || b.time >= anchor) {
          initialTimes.set(b.id, b.time);
        }
      }
    }
  } else {
    for (const id of ctx.selection.ids) {
      const beat = ctx.actions.findBeat(id);
      if (beat) initialTimes.set(id, beat.time);
    }
  }

  return {
    onPointerMove: (c) => {
      let dt = (c.pointer.canvasX - startX) / PIXELS_PER_UNIT;

      // Clamp so no affected beat goes below 0
      const minTime = Math.min(...initialTimes.values());
      dt = Math.max(dt, -minTime);

      const updates = [...initialTimes].flatMap(([id, time]) => {
        const laneId = ctx.actions.findLaneOfBeat(id);
        if (!laneId) return [];
        return [{ laneId, beatId: id, time: snap(Math.max(0, time + dt)) }];
      });

      ctx.actions.moveBeats(updates);
    },
  };
}

const snap = (time: number) => Math.round(time * 4) / 4;

export function resizeBeatGesture(ctx: ToolContext): ToolGesture {
  if (ctx.hit.kind !== "beat-resize") return {};
  const { beat, edge, laneId } = ctx.hit;

  const startX = ctx.pointer.canvasX;
  const startTime = beat.time;
  const startDuration = beat.duration;
  const rightEdge = startTime + startDuration;

  return {
    onPointerMove: (c) => {
      const dt = (c.pointer.canvasX - startX) / PIXELS_PER_UNIT;

      if (edge === "right") {
        const next = Math.max(BEAT_MIN_DURATION, startDuration + dt);
        ctx.actions.resizeBeat?.(laneId, beat.id, { duration: snap(next) });
      } else {
        // left edge: keep the right edge fixed
        const maxStart = rightEdge - BEAT_MIN_DURATION;
        const newTime = snap(Math.min(Math.max(0, startTime + dt), maxStart));
        ctx.actions.resizeBeat?.(laneId, beat.id, {
          time: newTime,
          duration: rightEdge - newTime,
        });
      }
    },
  };
}