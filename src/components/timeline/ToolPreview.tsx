// components/timeline/ToolPreview.tsx
import { useToolStore } from '../../store/useToolStore';
import {
  LANE_HEIGHT, LANE_PADDING_LEFT, PIXELS_PER_UNIT,
  BEAT_HEIGHT, BEAT_WIDTH,
} from '../../constants';
import { useStore } from '../../store/store';

export function ToolPreview() {
  const preview = useToolStore((s) => s.preview);
  const lanes = useStore((s) => s.project.lanes);
  if (!preview) return null;

  if (preview.kind === 'box') {
    return (
      <div
        className="absolute pointer-events-none border-2 border-dashed border-cyan-400/70 bg-cyan-400/10"
        style={{ left: preview.x, top: preview.y, width: preview.w, height: preview.h }}
      />
    );
  }

  if (preview.kind === 'ghost') {
    const laneIndex = lanes.findIndex((l) => l.id === preview.laneId);
    if (laneIndex < 0) return null;
    return (
      <div
        className="beat-ghost panel absolute pointer-events-none"
        style={{
          left: LANE_PADDING_LEFT + preview.time * PIXELS_PER_UNIT,
          top: laneIndex * LANE_HEIGHT + (LANE_HEIGHT - BEAT_HEIGHT) / 2,
          width: BEAT_WIDTH, height: BEAT_HEIGHT,
        }}
      />
    );
  }

  if (preview.kind === 'link') {
    // Locate the source beat
    let laneIndex = -1;
    let beat = null;
    for (let i = 0; i < lanes.length; i++) {
      const found = lanes[i].beats.find((b) => b.id === preview.fromBeatId);
      if (found) { laneIndex = i; beat = found; break; }
    }
    if (!beat || laneIndex < 0) return null;

    const x1 = LANE_PADDING_LEFT + beat.time * PIXELS_PER_UNIT + BEAT_WIDTH;
    const y1 = laneIndex * LANE_HEIGHT + LANE_HEIGHT / 2;
    const x2 = preview.toX;
    const y2 = preview.toY;
    const cx = (x1 + x2) / 2;

    return (
      <svg
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{ width: '100%', height: '100%' }}
      >
        <path
          d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
          fill="none"
          stroke="#0066ff"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />
      </svg>
    );
  }

  return null;
}