import { LANE_HEIGHT } from '../../constants';
import type { Lane } from '../../types/types';

export function LaneHeader({ lane }: { lane: Lane }) {
  return (
    <div
      className="flex items-center gap-2 px-3 shading"
      style={{ height: LANE_HEIGHT, backgroundColor: lane.color }}
    >
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: lane.color }}
      />
      <span className="truncate text-sm font-medium">{lane.name}</span>
      <span className="ml-auto font-mono text-[10px] text-neutral-600">
        {lane.beats.length}
      </span>
    </div>
  );
}