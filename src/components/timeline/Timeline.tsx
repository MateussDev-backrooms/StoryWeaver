import { useStore } from "../../store/store";
import {
	PIXELS_PER_UNIT,
	LANE_PADDING_LEFT,
	RULER_HEIGHT,
	HEADER_WIDTH,
	LANE_HEIGHT,
} from "../../constants";
import { Lane } from "./Lane";
import { LaneHeader } from "./LaneHeader";
import { Ruler } from "./Ruler";
import { useValidation } from "../../hooks/useValidation";
import { ToolHost } from "./ToolHost";
import { ToolPreview } from "./ToolPreview";
import { Arrows } from "./Arrows";
import { useToolStore } from "../../store/useToolStore";
import { useModalStore } from "../../store/useModalStore";
import { useVisibleLanes } from "../../hooks/useVisibleLanes";
import { useEffect, useRef } from "react";
import { MarkerLines } from "./MarkerLines";

export function Timeline() {
	const allLanes = useStore((s) => s.project.lanes);
	const lanes = useVisibleLanes();
	const { beatIssueIds } = useValidation();
	const frozen = useToolStore((s) => s.frozenCanvasWidth);
	const openModal = useModalStore((s) => s.open);

	const maxTime = lanes.reduce(
		(m, lane) => lane.beats.reduce((mm, b) => Math.max(mm, b.time), m),
		0,
	);
	const naturalWidth = LANE_PADDING_LEFT + (maxTime + 10) * PIXELS_PER_UNIT;
	const canvasWidth = frozen ? Math.max(naturalWidth, frozen) : naturalWidth;
	const canvasHeight = RULER_HEIGHT + lanes.length * LANE_HEIGHT;

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const scrollTargetTime = useToolStore((s) => s.scrollTargetTime);
	const requestScroll = useToolStore((s) => s.requestScrollTo);

	useEffect(() => {
		if (scrollTargetTime === null) return;
		const el = scrollContainerRef.current;
		if (!el) return;
		const target =
			LANE_PADDING_LEFT + scrollTargetTime - el.clientWidth / 2;
		el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
		requestScroll(null);
	}, [scrollTargetTime, requestScroll]);

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
					<button
						className="btn"
						onClick={() =>
							openModal("create-character", {
								onConfirm: (draft) => {
									useStore.getState().addLane({ ...draft });
								},
							})
						}
					>
						+ Add character
					</button>
				</div>

				<div
					ref={scrollContainerRef}
					className="flex-1 overflow-x-auto overflow-y-hidden noscroll"
				>
					<ToolHost>
						<div
							className="relative"
							style={{ width: canvasWidth, height: canvasHeight }}
						>
							<Ruler maxTime={maxTime} />
							<Arrows visLanes={lanes} allLanes={allLanes} />
							<MarkerLines laneCount={lanes.length} />
							{lanes.map((lane) => (
								<Lane
									key={lane.id}
									lane={lane}
									beatIssueIds={beatIssueIds}
								/>
							))}
							<ToolPreview />
						</div>
					</ToolHost>
				</div>
			</div>

			<div className="flex flex-row border-t border-neutral-800">
				<div
					className="shrink-0 border-r border-neutral-800 p-2"
					style={{ width: HEADER_WIDTH }}
				/>
			</div>
		</div>
	);
}
