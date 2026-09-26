import { useMemo } from "react";
import { RiAddLine } from "react-icons/ri";
import { useStore } from "../../../store/store";
import { useModalStore } from "../../../store/useModalStore";
import { useToolStore } from "../../../store/useToolStore";
import { PIXELS_PER_UNIT } from "../../../constants";
import { getSectionRange } from "../../../lib/sections";
import type { Section } from "../../../types/types";

export function SectionBar() {
  const project = useStore((s) => s.project);
  const openModal = useModalStore((s) => s.open);
  const requestScroll = useToolStore((s) => s.requestScrollTo);

  // Sort chronologically by the section's start time.
  const ordered = useMemo(() => {
    return project.sections
      .map((sec) => ({ sec, range: getSectionRange(sec, project) }))
      .filter(
        (x): x is { sec: Section; range: NonNullable<ReturnType<typeof getSectionRange>> } =>
          x.range !== null,
      )
      .sort((a, b) => a.range.start - b.range.start);
  }, [project]);

  const scrollTo = (sec: Section) => {
    const range = getSectionRange(sec, project);
    if (!range) return;
    const center = (range.start + range.end) / 2;
    requestScroll(center * PIXELS_PER_UNIT);
  };

  return (
    <div className="section-bar w-full">
      <div className="section-bar-list">
        {ordered.length === 0 && (
          <span className="section-bar-empty">
            No sections yet. Press + to add
          </span>
        )}
        {ordered.map(({ sec }) => (
          <button
            key={sec.id}
            className="section-chip shading"
            style={{ backgroundColor: sec.color }}
            onClick={() => scrollTo(sec)}
            onDoubleClick={() => openModal("edit-section", { sectionId: sec.id })}
            title="Click to jump · Double-click to edit"
          >
            {sec.name}
          </button>
        ))}
      </div>
      <button
        className="btn btn-sm"
        onClick={() => openModal("edit-section", {})}
        title="Add section"
      >
        <RiAddLine />
      </button>
    </div>
  );
}