import { RiShape2Line } from 'react-icons/ri';
import type { Tool } from './types';

export const boxSelect: Tool = {
  id: 'box-select',
  label: 'Box Select',
  icon: RiShape2Line,
  cursor: 'crosshair',

  onPointerDown: (ctx) => {
    const startX = ctx.pointer.canvasX;
    const startY = ctx.pointer.canvasY;
    const additive = ctx.modifiers.shift;
    const baseline = ctx.modifiers.shift
      ? new Set(ctx.selection.ids)
      : new Set<string>();

    return {
      onPointerMove: (c) => {
        const x = Math.min(startX, c.pointer.canvasX);
        const y = Math.min(startY, c.pointer.canvasY);
        const w = Math.abs(c.pointer.canvasX - startX);
        const h = Math.abs(c.pointer.canvasY - startY);

        ctx.setPreview({ kind: 'box', x, y, w, h });

        // Ask the DOM what beats are inside. Cheap enough at 60fps for <200 beats.
        const inside = pickBeatsInRect(x, y, w, h);
        ctx.selection.set([...baseline, ...inside]);
      },
      onPointerUp: () => ctx.setPreview(null),
    };
  },
};

function pickBeatsInRect(x: number, y: number, w: number, h: number): string[] {
  const elements = document.querySelectorAll<HTMLElement>('[data-beat-id]');
  const selected: string[] = [];

  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Ensure x/y and DOM coordinates use the same coordinate system.
    if (
      centerX >= x &&
      centerX <= x + w &&
      centerY >= y &&
      centerY <= y + h
    ) {
      selected.push(element.dataset.beatId!);
    }
  }

  return selected;
}