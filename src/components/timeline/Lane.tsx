// components/timeline/Lane.tsx
import { useEffect, useState } from 'react';
import {
  BEAT_WIDTH, BEAT_HEIGHT, LANE_HEIGHT, LANE_PADDING_LEFT, PIXELS_PER_UNIT,
} from '../../constants';
import type { Lane as LaneType } from '../../types/types';
import { useStore } from '../../store/store';
import { BeatCard } from '../beat/BeatCard';
import { Arrow } from '../common/Arrow';

interface Props {
  lane: LaneType;
  beatIssueIds: Set<string>;
}

export function Lane({ lane, beatIssueIds }: Props) {
  const moveBeat = useStore((s) => s.moveBeat);
  const addBeat  = useStore((s) => s.addBeat);
  const addLink = useStore((s) => s.addLink)
  const allLinks = useStore((s) => s.project.links);

  const [shiftHeld, setShiftHeld] = useState(false);
  const [mouseX, setMouseX] = useState<number | null>(null);

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
  let plusTime = maxTime + 1;
  if(beatMap.size == 0) plusTime = 0;

  return (
    <div
      className={[
        'relative border-b border-neutral-800',
        shiftHeld ? 'lane-placing' : '',
      ].join(' ')}
      style={{ height: LANE_HEIGHT }}
      data-lane-id={lane.id}
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
          <Arrow link={link} from={from} to={to}
                 color={lane.color} />
        ))}
      </svg>

      {lane.beats.map((beat) => (
        <BeatCard
          key={beat.id}
          beat={beat}
          accent={lane.color}
          hasIssue={beatIssueIds.has(beat.id)}
        />
      ))}

      {/* "+ at end of lane" */}
      <button
        className="btn beat-add absolute"
        style={{
          left: LANE_PADDING_LEFT + plusTime * PIXELS_PER_UNIT,
          top: (LANE_HEIGHT - BEAT_HEIGHT) / 2,
          width: BEAT_HEIGHT,
          height: BEAT_HEIGHT,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => addBeat(lane.id, plusTime)}
        title="Add beat at end of lane"
      >
        +
      </button>
    </div>
  );
}