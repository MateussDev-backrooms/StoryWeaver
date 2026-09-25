import { RiQuillPenFill } from 'react-icons/ri';
import type { Tool, ToolContext } from './types';
import { clickSelect } from './common';

export const quill: Tool = {
  id: 'quill',
  label: 'Quill',
  icon: RiQuillPenFill,
  cursor: 'crosshair',

  intent: () => 'draw',
  getCursorIcon: () => RiQuillPenFill,
  
  onHover: (ctx) => {
    // Ghost follows the cursor on empty lane space, unless a modifier
    // is held (those imply a different tool or a different intent).
    if (ctx.modifiers.shift || ctx.modifiers.alt || ctx.modifiers.ctrl || ctx.modifiers.meta) {
      ctx.setPreview(null);
      return;
    }
    if (ctx.hit.kind === 'empty' && ctx.selection.ids.size == 0) {
      ctx.setPreview({
        kind: 'ghost',
        laneId: ctx.hit.laneId,
        time: snap(ctx.hit.time),
      });
    } else {
      ctx.setPreview(null);
    }
  },

  onPointerDown: (ctx) => {
    // Only acts on empty lane space
    if (ctx.hit.kind === 'empty') {
      const { laneId, time } = ctx.hit;
      const newId = ctx.actions.addBeat(laneId, snap(time));
      ctx.selection.set([newId]);
      ctx.setPreview({ kind: 'ghost', laneId, time });

      const startX = ctx.pointer.canvasX;

      return {
        onPointerMove: (c) => {
          if (!c.pointer.laneId || c.pointer.time === null) return;
          // Detach from original lane if dragged vertically? For now: stick to original lane.
          const t = snap(Math.max(0, c.pointer.time));
          ctx.actions.moveBeats([{ laneId, beatId: newId, time: t }]);
          ctx.setPreview({ kind: 'ghost', laneId, time: t });
        },
        onPointerUp: () => ctx.setPreview(null),
      };
    }

    // Beat under cursor → behaves like the selector (delegate)
    if (ctx.hit.kind === 'beat') {
      return clickSelect(ctx, ctx.hit.beat.id);
    }
    return;
  },
};

const snap = (t: number) => Math.round(t * 4) / 4;