import { RiDeleteBack2Fill } from "react-icons/ri";
import type { Tool } from "./types";

export const deleteTool: Tool = {
  id: 'delete',
  label: 'Delete',
  icon: RiDeleteBack2Fill,
  cursor: 'not-allowed',

  onPointerDown: (ctx) => {
    if (ctx.hit.kind === 'beat') {
      ctx.actions.deleteBeat(ctx.hit.laneId, ctx.hit.beat.id);
      ctx.selection.remove(ctx.hit.beat.id);
    } else if (ctx.hit.kind === 'arrow') {
      ctx.actions.deleteLink(ctx.hit.linkId);
    }
  },
};