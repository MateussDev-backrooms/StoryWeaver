import type { Beat, Project } from '../types/types';
import type { HitTarget } from './types';
import {
  LANE_PADDING_LEFT, PIXELS_PER_UNIT, LANE_HEIGHT, BEAT_WIDTH, RULER_HEIGHT,
} from '../constants';

const ARROW_HIT_THRESHOLD = 8; // px

export function hitTest(
  e: React.PointerEvent,
  root: HTMLElement,
  project: Project,
): HitTarget {
  const rect = root.getBoundingClientRect();
  return hitTestCanvas(
    e.clientX, e.clientY,
    e.clientX - rect.left,
    e.clientY - rect.top,
    project,
  );
}

export function hitTestCanvas(
  clientX: number,
  clientY: number,
  canvasX: number,
  canvasY: number,
  project: Project,
): HitTarget {
  const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;

  // 1. Beats — DOM-based, they render above everything
  if (el) {
    const beatEl = el.closest<HTMLElement>('[data-beat-id]');
    if (beatEl) {
      const beatId = beatEl.dataset.beatId!;
      const laneEl = beatEl.closest<HTMLElement>('[data-lane-id]');
      const beat = findBeatInProject(project, beatId);
      if (laneEl && beat) {
        return { kind: 'beat', laneId: laneEl.dataset.laneId!, beat };
      }
    }
  }

  // 2. Arrows — manual, because lane divs cover the arrow SVG in DOM order
  const arrowId = hitTestArrows(canvasX, canvasY, project);
  if (arrowId) return { kind: 'arrow', linkId: arrowId };

  // 3. Empty lane
  if (el) {
    const laneEl = el.closest<HTMLElement>('[data-lane-id]');
    if (laneEl) {
      const rect = laneEl.getBoundingClientRect();
      const time = Math.max(
        0,
        (clientX - rect.left - LANE_PADDING_LEFT) / PIXELS_PER_UNIT,
      );
      return { kind: 'empty', laneId: laneEl.dataset.laneId!, time };
    }
  }

  return { kind: 'canvas' };
}

function findBeatInProject(project: Project, id: string): Beat | undefined {
  for (const lane of project.lanes) {
    const b = lane.beats.find((x) => x.id === id);
    if (b) return b;
  }
  return undefined;
}

function hitTestArrows(cx: number, cy: number, project: Project): string | null {
  const beatPos = new Map<string, { time: number; laneIndex: number }>();
  project.lanes.forEach((lane, laneIndex) => {
    for (const beat of lane.beats) {
      beatPos.set(beat.id, { time: beat.time, laneIndex });
    }
  });

  for (const link of project.links) {
    const from = beatPos.get(link.from);
    const to = beatPos.get(link.to);
    if (!from || !to) continue;

    const x1 = LANE_PADDING_LEFT + from.time * PIXELS_PER_UNIT + BEAT_WIDTH;
    const x2 = LANE_PADDING_LEFT + to.time * PIXELS_PER_UNIT;
    const y1 = RULER_HEIGHT + from.laneIndex * LANE_HEIGHT + LANE_HEIGHT / 2;
    const y2 = RULER_HEIGHT + to.laneIndex * LANE_HEIGHT + LANE_HEIGHT / 2;
    const midX = (x1 + x2) / 2;

    if (
      distToSegment(cx, cy, x1, y1, midX, y1) < ARROW_HIT_THRESHOLD ||
      distToSegment(cx, cy, midX, y1, midX, y2) < ARROW_HIT_THRESHOLD ||
      distToSegment(cx, cy, midX, y2, x2, y2) < ARROW_HIT_THRESHOLD
    ) {
      return link.id;
    }
  }
  return null;
}

function distToSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export interface SameLaneEndpoints {
  laneId: string;
  from: Beat;
  to: Beat;
}

export function getSameLaneEndpoints(
  linkId: string,
  project: Project,
): SameLaneEndpoints | null {
  const link = project.links.find((l) => l.id === linkId);
  if (!link) return null;

  for (const lane of project.lanes) {
    const from = lane.beats.find((b) => b.id === link.from);
    const to = lane.beats.find((b) => b.id === link.to);
    if (from && to) return { laneId: lane.id, from, to };
  }
  return null;
}