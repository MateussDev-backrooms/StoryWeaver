import { TbNeedleThread } from 'react-icons/tb';
import type { Tool } from './types';

export const weaver: Tool = {
  id: 'weaver',
  label: 'Weaver',
  icon: TbNeedleThread,
  cursor: 'crosshair',
  intent: () => 'link',
  getCursorIcon: () => TbNeedleThread,

  onPointerDown: (ctx) => {
    if (ctx.hit.kind !== 'beat') return;
    const fromId = ctx.hit.beat.id;
    const fromTime = ctx.hit.beat.time;

    // Set immediately so the preview appears on the very first frame,
    // not just after the next pointermove.
    ctx.setPreview({
      kind: 'link',
      fromBeatId: fromId,
      toX: ctx.pointer.canvasX,
      toY: ctx.pointer.canvasY,
    });

    return {
      onPointerMove: (c) => {
        ctx.setPreview({
          kind: 'link',
          fromBeatId: fromId,
          toX: c.pointer.canvasX,
          toY: c.pointer.canvasY,
        });
      },
      onPointerUp: (c) => {
        ctx.setPreview(null);
        if (c.hit.kind !== 'beat') return;
        const toId = c.hit.beat.id;
        if (toId === fromId) return;
        const target = c.hit.beat;
        const [a, b] = fromTime <= target.time ? [fromId, toId] : [toId, fromId];
        ctx.actions.addLink(a, b);
      },
    };
  },
};