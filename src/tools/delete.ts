import { RiDeleteBack2Fill, RiScissorsFill } from "react-icons/ri";
import type { Tool, ToolContext } from "./types";

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
  label: 'Delete',
  icon: RiScissorsFill,
  cursor: 'default',
  intent: () => 'delete',
  getCursorIcon: () => RiScissorsFill,

  onPointerDown: (ctx) => {
    deleteAt(ctx);
    return {
      onPointerMove: (c) => deleteAt(c),
    };
  },
};