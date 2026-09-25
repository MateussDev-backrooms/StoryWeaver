import { RiScissorsFill } from "react-icons/ri";
import type { Tool, ToolContext } from "./types";
import { hitTestCanvas } from "./hitTest";
import { useStore } from "../store/store";

function deleteAt(ctx: ToolContext) {
  if (ctx.hit.kind === 'beat') {
    ctx.actions.deleteBeat(ctx.hit.laneId, ctx.hit.beat.id);
    ctx.selection.remove(ctx.hit.beat.id);
  } else if (ctx.hit.kind === 'arrow') {
    ctx.actions.deleteLink(ctx.hit.linkId);
  }
}

export const deleteTool: Tool = {
  id: 'delete',
  label: 'Scissors',
  icon: RiScissorsFill,
  cursor: 'crosshair',
  intent: () => 'delete',
  getCursorIcon: () => RiScissorsFill,

  onPointerDown: (ctx) => {
    // ── Mode A: clicked a beat or arrow → delete & swipe-chain ──
    if (ctx.hit.kind === 'beat' || ctx.hit.kind === 'arrow') {
      deleteAt(ctx);
      return {
        onPointerMove: (c) => deleteAt(c),
      };
    }

    // ── Mode B: empty space → draw a cut line ──
    const startX = ctx.pointer.canvasX;
    const startY = ctx.pointer.canvasY;

    return {
      onPointerMove: (c) => {
        ctx.setPreview({
          kind: 'cut',
          x1: startX, y1: startY,
          x2: c.pointer.canvasX, y2: c.pointer.canvasY,
        });
      },
      onPointerUp: (c) => {
        const endX = c.pointer.canvasX;
        const endY = c.pointer.canvasY;
        ctx.setPreview(null);

        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.hypot(dx, dy);
        if (length < 6) return;

        // Sample the line, collect everything we cross.
        const STEP = 4; // px between samples
        const samples = Math.max(2, Math.ceil(length / STEP));
        const rootX = c.pointer.rootX;
        const rootY = c.pointer.rootY;

        const beatHits = new Set<string>();
        const linkHits = new Set<string>();

        for (let i = 0; i <= samples; i++) {
          const t = i / samples;
          const px = startX + dx * t;
          const py = startY + dy * t;

          const hit = hitTestCanvas(
            px + rootX, py + rootY,
            px, py,
            useStore.getState().project,
          );
          if (hit.kind === 'beat') beatHits.add(hit.beat.id);
          else if (hit.kind === 'arrow') linkHits.add(hit.linkId);
        }

        // Delete links first, then beats — order avoids dangling lookups.
        for (const id of linkHits) ctx.actions.deleteLink(id);
        for (const id of beatHits) {
          const laneId = ctx.actions.findLaneOfBeat(id);
          if (laneId) ctx.actions.deleteBeat(laneId, id);
        }

        // Any of the deleted beats were in the selection? Drop them.
        for (const id of beatHits) ctx.selection.remove(id);
      },
    };
  },
};