// components/timeline/Ruler.tsx
import { PIXELS_PER_UNIT, LANE_PADDING_LEFT, RULER_HEIGHT } from '../../constants';

const MINOR = 0.25;
const MAJOR = 1;

export function Ruler({ maxTime }: { maxTime: number }) {
  const end = Math.ceil(maxTime) + 3;
  const ticks: React.ReactNode[] = [];

  for (let t = 0; t <= end; t += MINOR) {
    const x = LANE_PADDING_LEFT + t * PIXELS_PER_UNIT;
    // Floating-point safe: check distance to nearest integer
    const isMajor = Math.abs(t - Math.round(t)) < 1e-9;

    ticks.push(
      <line
        key={`tick-${t.toFixed(2)}`}
        x1={x} x2={x}
        y1={isMajor ? RULER_HEIGHT * 0.5 : RULER_HEIGHT * 0.75}
        y2={RULER_HEIGHT}
        stroke="currentColor"
        strokeWidth={isMajor ? 1 : 0.5}
        className={isMajor ? 'text-neutral-500' : 'text-neutral-700'}
      />
    );

    if (isMajor) {
      ticks.push(
        <text
          key={`label-${t}`}
          x={x + 4}
          y={RULER_HEIGHT * 0.55}
          className="fill-neutral-500 font-mono"
          style={{ fontSize: 10 }}
        >
          {t}
        </text>
      );
    }
  }

  return (
    <svg
      className="block border-b border-neutral-800"
      style={{ width: '100%', height: RULER_HEIGHT, overflow: 'visible' }}
    >
      {ticks}
    </svg>
  );
}