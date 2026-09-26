import {
  BEAT_WIDTH,
  BEAT_HEIGHT,
  LANE_HEIGHT,
  LANE_PADDING_LEFT,
  PIXELS_PER_UNIT,
} from "../../constants";
import type { Lane as LaneType } from "../../types/types";
import { useStore } from "../../store/store";
import { BeatCard } from "../beat/BeatCard";
import { useToolStore } from "../../store/useToolStore";

interface Props {
  lane: LaneType;
  beatIssueIds: Set<string>;
}

export function Lane({ lane, beatIssueIds }: Props) {
  const appendBeat = useStore((s) => s.appendBeat);

  const sorted = [...lane.beats].sort((a, b) => a.time - b.time);
  const firstId = sorted.length > 1 ? sorted[0].id : undefined;
  const lastId = sorted.length > 1 ? sorted[sorted.length - 1].id : undefined;
  const lastBeat = sorted[sorted.length - 1];
  const plusTime = lastBeat ? lastBeat.time + 1 : 0;

  return (
    <div
      className="relative border-b border-neutral-800"
      style={{ height: LANE_HEIGHT }}
      data-lane-id={lane.id}
    >
      {lane.beats.map((beat) => (
        <BeatCard
          key={beat.id}
          beat={beat}
          accent={lane.color}
          hasIssue={beatIssueIds.has(beat.id)}
          role={
            beat.id === firstId
              ? "intro"
              : beat.id === lastId
                ? "outro"
                : undefined
          }
        />
      ))}

      <button
        className="btn beat-add absolute"
        style={{
          left: LANE_PADDING_LEFT + plusTime * PIXELS_PER_UNIT,
          top: (LANE_HEIGHT - BEAT_HEIGHT) / 2,
          width: BEAT_HEIGHT, //Square - easier on the eyes
          height: BEAT_HEIGHT,
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          const newId = appendBeat(lane.id, plusTime, lastBeat?.id);
          useToolStore.getState().setEditingBeatId(newId);
        }}
        title="Add story beat"
      >
        +
      </button>
    </div>
  );
}
