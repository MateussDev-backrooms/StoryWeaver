// components/timeline/Lane.tsx
import { useEffect, useState } from 'react';
import {
  BEAT_WIDTH, BEAT_HEIGHT, LANE_HEIGHT, LANE_PADDING_LEFT, PIXELS_PER_UNIT,
} from '../../constants';
import type { Lane as LaneType } from '../../types/types';
import { useStore } from '../../store';
import { BeatCard } from '../beat/BeatCard';
import { Arrow } from '../common/Arrow';

interface Props {
  lane: LaneType;
  beatIssueIds: Set<string>;
}

export function Lane({ lane, beatIssueIds }: Props) {
  const moveBeat = useStore((s) => s.moveBeat);
  const addBeat  = useStore((s) => s.addBeat);
  const allLinks = useStore((s) => s.project.links);

  const [shiftHeld, setShiftHeld] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Shift') setShiftHeld(true); };
    const up   = (e: KeyboardEvent) => {
      if (e.key === 'Shift') { setShiftHeld(false); setMouseX(null); }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Derived ghost time — null means "don't render preview"
  const ghostTime =
    shiftHeld && mouseX !== null
      ? Math.max(0, Math.round(((mouseX - LANE_PADDING_LEFT) / PIXELS_PER_UNIT) * 4) / 4)
      : null;

  const onMouseMove = (e: React.MouseEvent) => {
    if (!shiftHeld) return;                     // skip state updates when not placing
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  };
  const onMouseLeave = () => setMouseX(null);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!shiftHeld || ghostTime === null) return;
    e.preventDefault();
    addBeat(lane.id, ghostTime);
  };

  const markerId = `arrowhead-${lane.id}`;
  const beatMap = new Map(lane.beats.map((b) => [b.id, b]));
  const laneLinks = allLinks
    .map((l) => {
      const from = beatMap.get(l.from);
      const to   = beatMap.get(l.to);
      return from && to ? { link: l, from, to } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const maxTime  = lane.beats.reduce((m, b) => Math.max(m, b.time), 0);
  const plusTime = maxTime + 1;

  return (
    <div
      className={[
        'relative border-b border-neutral-800',
        shiftHeld ? 'lane-placing' : '',
      ].join(' ')}
      style={{ height: LANE_HEIGHT }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
    >
      <svg className="absolute inset-0 pointer-events-none overflow-visible"
           style={{ width: '100%', height: LANE_HEIGHT }}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={lane.color} />
          </marker>
        </defs>
        {laneLinks.map(({ link, from, to }) => (
          <Arrow key={link.id} from={from} to={to}
                 markerId={markerId} color={lane.color} />
        ))}
      </svg>

      {lane.beats.map((beat) => (
        <BeatCard
          key={beat.id}
          beat={beat}
          accent={lane.color}
          hasIssue={beatIssueIds.has(beat.id)}
          onMove={(id, time) => moveBeat(lane.id, id, time)}
        />
      ))}

      {/* "+ at end of lane" */}
      <button
        className="btn beat-add absolute"
        style={{
          left: LANE_PADDING_LEFT + plusTime * PIXELS_PER_UNIT,
          top: (LANE_HEIGHT - BEAT_HEIGHT) / 2,
          width: BEAT_WIDTH,
          height: BEAT_HEIGHT,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => addBeat(lane.id, plusTime)}
        title="Add beat at end of lane"
      >
        +
      </button>

      {/* Shift-preview ghost */}
      {ghostTime !== null && (
        <div
          className="beat-ghost panel absolute"
          style={{
            left: LANE_PADDING_LEFT + ghostTime * PIXELS_PER_UNIT,
            top: (LANE_HEIGHT - BEAT_HEIGHT) / 2,
            width: BEAT_WIDTH,
            height: BEAT_HEIGHT,
          }}
        />
      )}
    </div>
  );
}