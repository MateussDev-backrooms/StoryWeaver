import {
  LANE_HEIGHT,
  LANE_PADDING_LEFT,
  PIXELS_PER_UNIT,
  BEAT_WIDTH,
  RULER_HEIGHT,
} from "../../constants";
import type { Lane, Beat } from "../../types/types";
import { useStore } from "../../store/store";

interface Props {
  lanes: Lane[];
}

export function Arrows({ lanes }: Props) {
  const links = useStore((s) => s.project.links);

  const lookup = new Map<
    string,
    { beat: Beat; laneIndex: number; color: string }
  >();
  lanes.forEach((lane, i) => {
    lane.beats.forEach((beat) => {
      lookup.set(beat.id, { beat, laneIndex: i, color: lane.color });
    });
  });

  const height = RULER_HEIGHT + lanes.length * LANE_HEIGHT;

  return (
    <svg
      className="absolute pointer-events-none overflow-visible"
      style={{ left: 0, top: 0, width: "100%", height }}
    >
      <defs>
        {lanes.map((lane) => (
          <marker
            key={lane.id}
            id={`arrow-${lane.id}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={lane.color} />
          </marker>
        ))}
      </defs>

      {links.map((link) => {
        const from = lookup.get(link.from);
        const to = lookup.get(link.to);
        if (!from || !to) return null;

        const x1 =
          LANE_PADDING_LEFT + from.beat.time * PIXELS_PER_UNIT + BEAT_WIDTH;
        const x2 = LANE_PADDING_LEFT + to.beat.time * PIXELS_PER_UNIT;
        const y1 =
          RULER_HEIGHT + from.laneIndex * LANE_HEIGHT + LANE_HEIGHT / 2;
        const y2 = RULER_HEIGHT + to.laneIndex * LANE_HEIGHT + LANE_HEIGHT / 2;

        const midX = (x1 + x2) / 2;
        const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        const markerId = `arrow-${lanes[from.laneIndex].id}`;

        return (
          <g key={link.id}>
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
              pointerEvents="stroke"
              data-link-id={link.id}
              style={{ cursor: "pointer" }}
            />
            <path
              d={d}
              fill="none"
              stroke={from.color}
              strokeWidth={1.5}
              markerEnd={`url(#${markerId})`}
              strokeLinejoin="miter"
              pointerEvents="none"
            />
          </g>
        );
      })}
    </svg>
  );
}
