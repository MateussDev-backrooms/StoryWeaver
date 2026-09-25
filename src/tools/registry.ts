// tools/registry.ts
import { boxSelect } from './boxSelect';
import { deleteTool } from './delete';
import { quill } from './quill';
import { scribe } from './scribe';
import { weaver } from './weaver';
import type { Tool, ToolId } from './types';

export const TOOLS: Record<ToolId, Tool> = {
  'scribing':    scribe,
  'quill':       quill,
  'box-select':  boxSelect,
  'delete':      deleteTool,
  'weaver':      weaver,
};

export const TOOL_ORDER: ToolId[] = ['scribing', 'quill', 'box-select', 'delete', 'weaver'];