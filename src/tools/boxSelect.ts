import { RiShape2Line } from "react-icons/ri";
import type { Tool } from "./types";

export const boxSelect: Tool = {
  id: "box-select",
  label: "Box Select",
  icon: RiShape2Line,
  cursor: "crosshair",
  intent: () => "select",
  getCursorIcon: () => RiShape2Line,

  onPointerDown: (ctx) => {
    const startX = ctx.pointer.canvasX;
    const startY = ctx.pointer.canvasY;
    const rootX = ctx.pointer.rootX;
    const rootY = ctx.pointer.rootY;
    const baseline = ctx.modifiers.shift
      ? new Set(ctx.selection.ids)
      : new Set<string>();

    return {
      onPointerMove: (c) => {
        const x = Math.min(startX, c.pointer.canvasX);
        const y = Math.min(startY, c.pointer.canvasY);
        const w = Math.abs(c.pointer.canvasX - startX);
        const h = Math.abs(c.pointer.canvasY - startY);

        ctx.setPreview({ kind: "box", x, y, w, h });
        const inside = pickBeatsInRect(x, y, w, h, rootX, rootY);
        ctx.selection.set([...baseline, ...inside]);
      },
      onPointerUp: () => ctx.setPreview(null),
    };
  },
};

function pickBeatsInRect(
  x: number,
  y: number,
  w: number,
  h: number,
  rootX: number,
  rootY: number,
): string[] {
  const elements = document.querySelectorAll<HTMLElement>("[data-beat-id]");
  const selected: string[] = [];
  for (const el of elements) {
    const r = el.getBoundingClientRect();
    // Convert viewport rect into canvas coordinates
    const bx1 = r.left - rootX;
    const by1 = r.top - rootY;
    const bx2 = bx1 + r.width;
    const by2 = by1 + r.height;
    // AABB overlap
    if (bx1 < x + w && bx2 > x && by1 < y + h && by2 > y) {
      selected.push(el.dataset.beatId!);
    }
  }
  return selected;
}
