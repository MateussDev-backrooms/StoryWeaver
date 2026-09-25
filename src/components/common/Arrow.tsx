// components/common/Arrow.tsx
import {
  BEAT_WIDTH,
  LANE_HEIGHT,
  LANE_PADDING_LEFT,
  PIXELS_PER_UNIT,
} from "../../constants";
import type { Beat, Link as LinkType } from "../../types/types";

interface Props {
  link: LinkType
  color?: string;
  from?: Beat;
  to?: Beat;
}

export function Arrow({link, color, from, to}: Props) {

    let t1 = 0, t2 = 0
    if(from != undefined && to != undefined) {
        t1 = from?.time;
        t2 = to?.time;
    }
  const x1 = LANE_PADDING_LEFT + t1 * PIXELS_PER_UNIT + BEAT_WIDTH;
  const x2 = LANE_PADDING_LEFT + t2 * PIXELS_PER_UNIT;
  const y = LANE_HEIGHT / 2;
  const cx = (x1 + x2) / 2;
  const d = `M ${x1} ${y} C ${cx} ${y}, ${cx} ${y}, ${x2} ${y}`;

  return (
    <g>
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
        stroke={color}
        strokeWidth={1.5}
        markerEnd={`url(#${link.id})`}
        pointerEvents="none"
      />
    </g>
  );
}
