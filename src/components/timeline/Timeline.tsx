// components/timeline/Timeline.tsx
import { useStore } from "../../store/store";
import {
  PIXELS_PER_UNIT,
  LANE_PADDING_LEFT,
  RULER_HEIGHT,
  HEADER_WIDTH,
} from "../../constants";
import { Lane } from "./Lane";
import { LaneHeader } from "./LaneHeader";
import { Ruler } from "./Ruler";
import { useValidation } from "../../hooks/useValidation";
import { ToolHost } from "./ToolHost";
import { ToolPreview } from "./ToolPreview";

export function Timeline() {
  const lanes = useStore((s) => s.project.lanes);
  const addLane = useStore((s) => s.addLane);
  const { beatIssueIds } = useValidation();

  const maxTime = lanes.reduce(
    (m, lane) => lane.beats.reduce((mm, b) => Math.max(mm, b.time), m),
    0,
  );
  const canvasWidth = LANE_PADDING_LEFT + (maxTime + 3) * PIXELS_PER_UNIT;

  return (
    <div className="flex flex-col h-full w-full m-0">
      <div className="flex flex-row">
        <div
          className="shrink-0 border-r border-neutral-800"
          style={{ width: HEADER_WIDTH }}
        >
          <div
            className="border-b border-neutral-800"
            style={{ height: RULER_HEIGHT }}
          />
          {lanes.map((lane) => (
            <LaneHeader key={lane.id} lane={lane} />
          ))}
          <button className="btn" onClick={addLane}>
            + Add lane
          </button>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden noscroll">
          <ToolHost>
            <div className="relative" style={{ width: canvasWidth }}>
              <Ruler maxTime={maxTime} />
              {lanes.map((lane) => (
                <Lane key={lane.id} lane={lane} beatIssueIds={beatIssueIds} />
              ))}
              <ToolPreview/>
            </div>
          </ToolHost>
        </div>
      </div>

      <div className="flex flex-row border-t border-neutral-800">
        <div
          className="shrink-0 border-r border-neutral-800 p-2"
          style={{ width: HEADER_WIDTH }}
        ></div>
      </div>
    </div>
  );
}
