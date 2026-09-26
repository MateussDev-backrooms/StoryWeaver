import {
  LANE_HEIGHT,
  LANE_PADDING_LEFT,
  PIXELS_PER_UNIT,
  RULER_HEIGHT,
} from "../../constants";
import { useStore } from "../../store/store";

export function MarkerLines({ laneCount }: { laneCount: number }) {
  const markers = useStore((s) => s.project.markers);
  const height = RULER_HEIGHT + laneCount * LANE_HEIGHT;

  return (
    <svg
      className="absolute pointer-events-none overflow-visible"
      style={{ left: 0, top: 0, width: "100%", height }}
    >
      {markers.map((m) => {
        const x = LANE_PADDING_LEFT + m.time * PIXELS_PER_UNIT;
        return (
          <g>
            <line
              key={m.id}
              x1={x}
              x2={x}
              y1={RULER_HEIGHT}
              y2={height}
              stroke={m.color}
              strokeWidth={3}
              strokeDasharray="8 2"
              opacity={0.5}
            />
            
          </g>
        );
      })}
    </svg>
  );
}
