// tools/hitTest.ts
import type { Beat } from '../types/types';
import type { HitTarget } from './types';
import { LANE_PADDING_LEFT, PIXELS_PER_UNIT } from '../constants';

export function hitTest(
  e: React.PointerEvent,
  _root: HTMLElement,
  findBeat: (id: string) => Beat | undefined,
): HitTarget {
  const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
  if (!target) return { kind: 'canvas' };

  const beatEl = target.closest<HTMLElement>('[data-beat-id]');
  if (beatEl) {
    const beatId = beatEl.dataset.beatId!;
    const laneEl = beatEl.closest<HTMLElement>('[data-lane-id]');
    const beat = findBeat(beatId);
    if (laneEl && beat) {
      return { kind: 'beat', laneId: laneEl.dataset.laneId!, beat };
    }
  }

  const arrowEl = target.closest<SVGElement>('[data-link-id]');
  if (arrowEl) {
    return { kind: 'arrow', linkId: (arrowEl as any).dataset.linkId! };
  }

  const laneEl = target.closest<HTMLElement>('[data-lane-id]');
  if (laneEl) {
    const rect = laneEl.getBoundingClientRect();
    const time = Math.max(
      0,
      (e.clientX - rect.left - LANE_PADDING_LEFT) / PIXELS_PER_UNIT,
    );
    return { kind: 'empty', laneId: laneEl.dataset.laneId!, time };
  }

  return { kind: 'canvas' };
}