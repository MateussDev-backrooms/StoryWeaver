import "./BeatCard.css";
import {
  BEAT_HEIGHT, LANE_HEIGHT, LANE_PADDING_LEFT, PIXELS_PER_UNIT,
} from "../../constants";
import type { Beat as BeatType } from "../../types/types";
import { useToolStore } from "../../store/useToolStore";
import { useStore } from "../../store/store";
import { useEffect, useRef } from "react";

interface Props {
  beat: BeatType;
  accent: string;
  hasIssue?: boolean;
  role?: "intro" | "outro";
}

export function BeatCard({ beat, accent, hasIssue, role }: Props) {
  const selected = useToolStore((s) => s.selection.has(beat.id));
  const editing = useToolStore((s) => s.editingBeatId === beat.id);
  const setEditing = useToolStore((s) => s.setEditingBeatId);
  const updateBeatTitle = useStore((s) => s.updateBeatTitle);
  const deleteBeat = useStore((s) => s.deleteBeat);
  const inputRef = useRef<HTMLInputElement>(null);

  const linkingFrom = useToolStore((s) => s.linkingFromId);
  const isLinkSource = linkingFrom === beat.id;
  const isLinkTarget = useToolStore((s) => s.linkTargetId === beat.id);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) deleteBeat(laneIdOf(beat.id), beat.id);
    else if (trimmed !== beat.title) updateBeatTitle(beat.id, trimmed);
    setEditing(null);
  };

  const x = LANE_PADDING_LEFT + beat.time * PIXELS_PER_UNIT;
  const y = (LANE_HEIGHT - BEAT_HEIGHT) / 2;
  const width = Math.max(40, beat.duration * PIXELS_PER_UNIT);

  return (
    <div
      className={[
        "beat-card absolute select-none panel px-3 py-2 overflow-visible cursor-grab",
        selected ? "beat-selected" : "",
        hasIssue ? "beat-error" : "",
        role === "intro" ? "beat-intro" : "",
        role === "outro" ? "beat-outro" : "",
        isLinkSource ? "beat-link-source" : "",
        isLinkTarget ? "beat-link-target" : "",
      ].join(" ")}
      style={{ left: x, top: y, width, height: BEAT_HEIGHT }}
      data-beat-id={beat.id}
    >
      <span
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ backgroundColor: hasIssue ? "#c02020" : accent }}
      />
      <span
        className="absolute right-0 top-0 bottom-0 w-2"
        style={{ backgroundColor: hasIssue ? "#c02020" : accent }}
      />

      {/* Resize handles — data attribute is what hitTest looks for */}
      <div
        className="beat-resize beat-resize-left"
        data-resize-handle="left"
        data-beat-resize-id={beat.id}
      />
      <div
        className="beat-resize beat-resize-right"
        data-resize-handle="right"
        data-beat-resize-id={beat.id}
      />

      {editing ? (
        <input
          ref={inputRef}
          className="beat-title-input p-0"
          defaultValue={beat.title === "New beat" ? "" : beat.title}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
            else if (e.key === "Escape") setEditing(null);
          }}
          onBlur={(e) => commit(e.target.value)}
        />
      ) : (
        <div className="truncate text-sm font-medium">{beat.title}</div>
      )}
    </div>
  );
}

function laneIdOf(beatId: string): string {
  for (const lane of useStore.getState().project.lanes) {
    if (lane.beats.some((b) => b.id === beatId)) return lane.id;
  }
  return "";
}