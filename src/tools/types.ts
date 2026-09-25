import type { ComponentType } from 'react';
import type { Beat } from '../types/types';

export type ToolId = 'scribing' | 'quill' | 'box-select' | 'delete' | 'weaver';
export type ToolIntent = 'neutral' | 'draw' | 'select' | 'delete' | 'link';

export type HitTarget =
  | { kind: 'empty'; laneId: string; time: number }
  | { kind: 'beat'; laneId: string; beat: Beat }
  | { kind: 'arrow'; linkId: string }
  | { kind: 'canvas' }
  | { kind: 'cut'; x1: number; y1: number; x2: number; y2: number };

export interface Modifiers {
  shift: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
}

export interface PointerInfo {
  clientX: number;
  clientY: number;
  /** Canvas position */
  canvasX: number;
  canvasY: number;
  /** Root position */
  rootX: number;
  rootY: number;
  /** Current lane under the pointer, or null if outside any lane. */
  laneId: string | null;
  /** Current time under the pointer, or null if outside any lane. */
  time: number | null;
}

export interface SelectionController {
  readonly ids: ReadonlySet<string>;
  set(ids: Iterable<string>): void;
  add(id: string): void;
  remove(id: string): void;
  toggle(id: string): void;
  clear(): void;
  has(id: string): boolean;
}

export interface ToolContext {
  hit: HitTarget;
  pointer: PointerInfo;
  modifiers: Modifiers;
  selection: SelectionController;

  actions: {
    addBeat: (laneId: string, time: number) => string;
    moveBeats: (
      updates: { laneId: string; beatId: string; time: number }[],
    ) => void;
    deleteBeat: (laneId: string, beatId: string) => void;
    addLink: (from: string, to: string) => void;
    deleteLink: (linkId: string) => void;

    findBeat: (id: string) => Beat | undefined;
    findLaneOfBeat: (id: string) => string | undefined;
  };

  setPreview: (p: Preview | null) => void;
}

export type Preview =
  | { kind: 'box'; x: number; y: number; w: number; h: number }
  | { kind: 'link'; fromBeatId: string; toX: number; toY: number }
  | { kind: 'ghost'; laneId: string; time: number };

export interface ToolGesture {
  onPointerMove?: (ctx: ToolContext) => void;
  onPointerUp?: (ctx: ToolContext) => void;
}

export interface Tool {
  id: ToolId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  cursor?: string;

  /** Which hover style this tool wants given current modifiers. */
  intent?: (mods: Modifiers) => ToolIntent;

  /** Icon to render next to the cursor. Null = no icon. */
  getCursorIcon?: (mods: Modifiers) => ComponentType<{ className?: string }> | null;


  onPointerDown: (ctx: ToolContext) => ToolGesture | void;
  onHover?: (ctx: ToolContext) => void;
}