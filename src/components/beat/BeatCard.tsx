// components/beat/BeatCard.tsx
import {
  BEAT_WIDTH, BEAT_HEIGHT, LANE_HEIGHT, LANE_PADDING_LEFT, PIXELS_PER_UNIT,
} from '../../constants';
import type { Beat as BeatType } from '../../types/types';
import { useToolStore } from '../../store/useToolStore';

interface Props {
  beat: BeatType;
  accent: string;
  hasIssue?: boolean;
  role?: 'intro' | 'outro';
}

export function BeatCard({ beat, accent, hasIssue, role }: Props) {
  const selected = useToolStore((s) => s.selection.has(beat.id));
  const x = LANE_PADDING_LEFT + beat.time * PIXELS_PER_UNIT;
  const y = (LANE_HEIGHT - BEAT_HEIGHT) / 2;

  return (
    <div
      className={[
        'beat-card absolute select-none panel px-3 py-2 overflow-hidden cursor-grab',
        selected ? 'beat-selected' : '',
        hasIssue ? 'beat-error' : '',
        role === 'intro' ? 'beat-intro' : '',
        role === 'outro' ? 'beat-outro' : '',
      ].join(' ')}
      style={{ left: x, top: y, width: BEAT_WIDTH, height: BEAT_HEIGHT }}
      data-beat-id={beat.id}
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ backgroundColor: hasIssue ? '#c02020' : accent }}
      />
      <span className="beat-pivot beat-pivot-left" />
      <span className="beat-pivot beat-pivot-right" />
      <div className="truncate text-sm font-medium">{beat.title}</div>
    </div>
  );
}