// components/timeline/ToolPreview.tsx
import { useToolStore } from '../../store/useToolStore';
import {
  LANE_HEIGHT, LANE_PADDING_LEFT, PIXELS_PER_UNIT,
  BEAT_HEIGHT, BEAT_WIDTH,
  RULER_HEIGHT,
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
          top: (laneIndex) * LANE_HEIGHT + LANE_HEIGHT/2 + (LANE_HEIGHT - BEAT_HEIGHT)/2,
          width: BEAT_WIDTH, height: BEAT_HEIGHT,
        }}
      />
    );
  }

  if (preview.kind === 'cut') {
  return (
    <svg
      className="absolute pointer-events-none overflow-visible z-50"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      <line
        x1={preview.x1} y1={preview.y1}
        x2={preview.x2} y2={preview.y2}
        stroke="#c02020"
        strokeWidth={2}
        strokeDasharray="8 4"
      />
    </svg>
  );
}

  if (preview.kind === 'link') {
    let laneIndex = -1;
    let beat = null;
    for (let i = 0; i < lanes.length; i++) {
      const found = lanes[i].beats.find((b) => b.id === preview.fromBeatId);
      if (found) { laneIndex = i; beat = found; break; }
    }
    if (!beat || laneIndex < 0) return null;

    // Anchor at the center of the beat
    const x1 = LANE_PADDING_LEFT + beat.time * PIXELS_PER_UNIT + BEAT_WIDTH/2;
    const y1 = RULER_HEIGHT + laneIndex * LANE_HEIGHT + LANE_HEIGHT / 2;
    const x2 = preview.toX;
    const y2 = preview.toY;

    return (
      <svg
        className="absolute pointer-events-none overflow-visible z-50"
        style={{ left: 0, top: 0, width: '100%', height: '100%' }}
      >
          <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#0066ff"
            strokeWidth={4}
            strokeDasharray="8 4"
          />
        <circle
        cx={x1} cy={y1} r={5} stroke="#0066ff" fill="#fff" strokeWidth={4}
        />
        <circle
        cx={x2} cy={y2} r={5} stroke="#0066ff" fill="#fff" strokeWidth={4}
        />
      </svg>
    );
  }

  return null;
}