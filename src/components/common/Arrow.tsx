// components/common/Arrow.tsx
import { BEAT_WIDTH, LANE_HEIGHT, LANE_PADDING_LEFT, PIXELS_PER_UNIT } from '../../constants';
import type { Beat } from '../../types/types';

interface Props {
  from: Beat;
  to: Beat;
  markerId: string;
  color?: string;
}

export function Arrow({ from, to, markerId, color = '#525252' }: Props) {
  const x1 = LANE_PADDING_LEFT + from.time * PIXELS_PER_UNIT + BEAT_WIDTH;
  const x2 = LANE_PADDING_LEFT + to.time * PIXELS_PER_UNIT;
  const y = LANE_HEIGHT / 2;
  const cx = (x1 + x2) / 2;

  return (
    <path
      d={`M ${x1} ${y} C ${cx} ${y}, ${cx} ${y}, ${x2} ${y}`}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      markerEnd={`url(#${markerId})`}
    />
  );
}