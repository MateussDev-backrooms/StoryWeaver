// tools/scribing.ts
import { deleteTool } from './delete';
import type { Tool, ToolContext, ToolGesture } from './types';
import { RiCursorFill, RiQuillPenFill } from 'react-icons/ri';
import { weaver } from './weaver';
import { boxSelect } from './boxSelect';
import { quill } from './quill';
import { dragBeatGesture } from './common';

export const scribe: Tool = {
  id: 'scribing',
  label: 'Scribe',
  icon: RiCursorFill,
  cursor: 'default',

  onPointerDown: (ctx): ToolGesture | void => {
    const { hit, modifiers } = ctx;

    // Beat interactions
    if (hit.kind === 'beat') {
      if (modifiers.ctrl) return deleteTool.onPointerDown(ctx);       // Ctrl-click = delete
      if (modifiers.alt)  return weaver.onPointerDown(ctx);           // Alt-drag = link
      return dragBeatGesture(ctx);                                    // default: select + drag
    }

    // Arrow interactions
    if (hit.kind === 'arrow') {
      if (modifiers.ctrl) return deleteTool.onPointerDown(ctx);
      return;
    }

    // Empty lane
    if (hit.kind === 'empty') {
      if (modifiers.shift) return boxSelect.onPointerDown(ctx);
      if(modifiers.alt || modifiers.ctrl || modifiers.meta) return;
      return quill.onPointerDown(ctx);                                // click/drag = create
    }

    // Clicking chrome / outside: clear selection if any
    if (ctx.selection.ids.size > 0) ctx.selection.clear();
    return;
  },
};