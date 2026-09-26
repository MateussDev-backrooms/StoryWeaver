// components/menu/CharacterMenu.tsx
import { useEffect, useRef, useState } from "react";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";
import { useToolStore } from "../../../store/useToolStore";
import { useStore } from "../../../store/store";

export function CharacterMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const lanes = useStore((s) => s.project.lanes);
  const reorderLane = useStore((s) => s.reorderLane);
  const hidden = useToolStore((s) => s.hiddenLaneIds);
  const toggle = useToolStore((s) => s.toggleLaneVisibility);
  const showAll = useToolStore((s) => s.showAllLanes);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  const visibleCount = lanes.filter((l) => !hidden.has(l.id)).length;

  return (
    <div ref={ref} className="relative">
      <button
        className={`btn flex flex-row items-center gap-1 ${open ? "btn-tab-selected" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Characters"
      >
        <RiEyeLine />
        <span className="text-xs">Characters</span>
        <span className="text-[10px] opacity-70">
          {visibleCount}/{lanes.length}
        </span>
      </button>

      {open && (
        <div className="character-menu panel">
          <div className="frame">
            <div className="flex flex-row items-center justify-between p-[0.2rem]">
              <span>Characters</span>
              <button
                className="btn btn-sm"
                onClick={showAll}
                disabled={hidden.size === 0}
              >
                Show all
              </button>
            </div>

            <div className="character-menu-list">
              {lanes.map((lane, i) => {
                const isHidden = hidden.has(lane.id);
                return (
                  <div
                    key={lane.id}
                    className={`character-menu-row ${isHidden ? "character-menu-row-hidden" : ""}`}
                  >
                    <button
                      className="character-menu-visibility"
                      onClick={() => toggle(lane.id)}
                      title={isHidden ? "Show" : "Hide"}
                    >
                      {isHidden ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>

                    <span
                      className="character-menu-dot"
                      style={{ backgroundColor: lane.color }}
                    />
                    <span className="character-menu-name">{lane.name}</span>
                    <span className="character-menu-group">{lane.group}</span>

                    <div className="character-menu-reorder">
                      <button
                        className="character-menu-arrow"
                        onClick={() => {
                          if (i === 0) return;
                          reorderLane(lane.id, lanes[i - 1].id);
                        }}
                        disabled={i === 0}
                        title="Move up"
                      >
                        <RiArrowUpSLine />
                      </button>
                      <button
                        className="character-menu-arrow"
                        onClick={() => {
                          if (i === lanes.length - 1) return;
                          const after = lanes[i + 2];
                          reorderLane(lane.id, after?.id ?? null);
                        }}
                        disabled={i === lanes.length - 1}
                        title="Move down"
                      >
                        <RiArrowDownSLine />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {lanes.length === 0 && (
              <div className="character-menu-empty">No characters yet</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
