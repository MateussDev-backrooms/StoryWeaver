import { deleteTool } from './delete';
import type { Tool, ToolContext, ToolGesture } from './types';
import { RiCursorFill, RiDeleteBack2Fill, RiDeleteBin2Fill, RiQuillPenFill, RiScissors2Fill, RiScissorsFill, RiShape2Line } from 'react-icons/ri';
import { TbNeedleThread } from 'react-icons/tb';
import { weaver } from './weaver';
import { boxSelect } from './boxSelect';
import { quill } from './quill';
import { dragBeatGesture } from './common';

const snap = (t: number) => Math.round(t * 4) / 4;

export const scribe: Tool = {
  id: 'scribing',
  label: 'Scribe',
  icon: RiCursorFill,
  cursor: 'default',

  intent: (m) => {
    if (m.ctrl) return 'delete';
    if (m.alt) return 'link';
    if (m.shift) return 'select';
    return 'draw';
  },
  getCursorIcon: (m) => {
    if (m.ctrl) return RiScissorsFill;
    if (m.alt) return TbNeedleThread;
    if (m.shift) return RiShape2Line;
    return RiQuillPenFill;
  },

  onHover: (ctx) => {
    if (ctx.modifiers.shift || ctx.modifiers.alt || ctx.modifiers.ctrl || ctx.modifiers.meta) {
      ctx.setPreview(null);
      return;
    }
    if (ctx.hit.kind === 'empty' && ctx.selection.ids.size == 0) {
      ctx.setPreview({ kind: 'ghost', laneId: ctx.hit.laneId, time: snap(ctx.hit.time) });
    } else {
      ctx.setPreview(null);
    }
  },

  onPointerDown: (ctx): ToolGesture | void => {
    const { hit, modifiers } = ctx;
    if (hit.kind === 'beat') {
      if (modifiers.ctrl) return deleteTool.onPointerDown(ctx);
      if (modifiers.alt) {
        return weaver.onPointerDown(ctx);
      }
      return dragBeatGesture(ctx);
    }
    if (hit.kind === 'arrow') {
      if (modifiers.ctrl) return deleteTool.onPointerDown(ctx);
      if (modifiers.shift) return boxSelect.onPointerDown(ctx);
      if (!modifiers.alt && !modifiers.meta) return quill.onPointerDown(ctx);
      return;
    }
    if (hit.kind === 'empty') {
      if (modifiers.shift) return boxSelect.onPointerDown(ctx);
      if (modifiers.ctrl) return deleteTool.onPointerDown(ctx);
      if (modifiers.alt || modifiers.meta) return;
      if (ctx.selection.ids.size > 0) {
        ctx.selection.clear();
        return;
      }
      return quill.onPointerDown(ctx);
    }
    if (ctx.selection.ids.size > 0) ctx.selection.clear();
    return;
  },
};