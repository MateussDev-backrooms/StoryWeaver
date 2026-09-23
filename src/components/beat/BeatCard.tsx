// components/timeline/Beat.tsx
import { useState } from 'react';
import {
  BEAT_WIDTH, BEAT_HEIGHT, LANE_HEIGHT, LANE_PADDING_LEFT, PIXELS_PER_UNIT,
} from '../../constants';
import type {Beat as BeatType} from '../../types/types'

interface Props {
  beat: BeatType;
  accent: string;
  hasIssue?: boolean;
  onMove: (id: string, time: number) => void;
}

export function BeatCard({ beat, accent, hasIssue, onMove }: Props) {
  const [dragging, setDragging] = useState(false);

  const x = LANE_PADDING_LEFT + beat.time * PIXELS_PER_UNIT;
  const y = (LANE_HEIGHT - BEAT_HEIGHT) / 2;

  const onPointerDown = (e: React.PointerEvent) => {
    // Ignore right-click etc.
    if (e.button !== 0) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const startClientX = e.clientX;
    const startTime = beat.time;
    setDragging(true);

    const handleMove = (ev: PointerEvent) => {
      const dxPx = ev.clientX - startClientX;
      const dt = dxPx / PIXELS_PER_UNIT;

      // Optional snap: hold Shift for free, otherwise 0.25-unit grid
      const raw = Math.max(0, startTime + dt);
      const snapped = ev.shiftKey ? raw : Math.round(raw * 4) / 4;

      onMove(beat.id, snapped);
    };

    const handleUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <div
      onPointerDown={onPointerDown}
      className={[
        'absolute select-none panel px-3 py-2 overflow-hidden',
        dragging
          ? 'shadow-lg z-10 translate-y-[-0.5rem] cursor-grabbing'
          : 'cursor-grab',
        hasIssue ? 'beat-error' : '',
      ].join(' ')}
      style={{ left: x, top: y, width: BEAT_WIDTH, height: BEAT_HEIGHT }}
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: hasIssue ? '#c02020' : accent }}
      />
      <div className="truncate text-sm font-medium">{beat.title}</div>
      <div className="mt-1 font-mono text-[10px] text-neutral-500">
        t={beat.time.toFixed(2)}
      </div>
    </div>
  );
}