import {
	LANE_HEIGHT,
	LANE_PADDING_LEFT,
	PIXELS_PER_UNIT,
	RULER_HEIGHT,
	BEAT_ARROW_MARGIN,
} from "../../constants";
import type { Lane, Beat } from "../../types/types";
import { useStore } from "../../store/store";

interface Props {
	lanes: Lane[];
	allLanes: Lane[];
}

export function Arrows({ lanes, allLanes }: Props) {
	const links = useStore((s) => s.project.links);

	const colorByLane = new Map(allLanes.map((l) => [l.id, l.color]));

	const lookup = new Map<
		string,
		{ beat: Beat; laneIndex: number; laneId: string }
	>();
	lanes.forEach((lane, i) => {
		lane.beats.forEach((beat) => {
			lookup.set(beat.id, { beat, laneIndex: i, laneId: lane.id });
		});
	});

	const height = RULER_HEIGHT + lanes.length * LANE_HEIGHT;

	const shadow = 50;
	const shadowOff = -2;

	return (
		<svg
			className="absolute pointer-events-none overflow-visible"
			style={{ left: 0, top: 0, width: "100%", height }}
		>
			<defs>
				{lanes.map((lane) => {
					const colDark = rgbToHex(
						hexToRgb(lane.color)?.r - shadow,
						hexToRgb(lane.color)?.g - shadow,
						hexToRgb(lane.color)?.b - shadow,
					);
					return (
						<marker
							key={lane.id}
							id={`arrow-${lane.id}`}
							viewBox="0 0 10 10"
							refX="9"
							refY="5"
							markerWidth="7"
							markerHeight="7"
							orient="auto-start-reverse"
						>
							<path d="M0,0 L10,5 L0,10 z" fill={lane.color} stroke={colDark} />
						</marker>
					);
				})}
			</defs>

			{links.map((link) => {
				const from = lookup.get(link.from);
				const to = lookup.get(link.to);
				// Either endpoint in a hidden lane → skip entirely.
				if (!from || !to) return null;

				const x1 =
					LANE_PADDING_LEFT +
					(from.beat.time + from.beat.duration) * PIXELS_PER_UNIT;
				const x2 =
					LANE_PADDING_LEFT +
					to.beat.time * PIXELS_PER_UNIT -
					BEAT_ARROW_MARGIN;
				const y1 =
					RULER_HEIGHT +
					from.laneIndex * LANE_HEIGHT +
					LANE_HEIGHT / 2;
				const y2 =
					RULER_HEIGHT + to.laneIndex * LANE_HEIGHT + LANE_HEIGHT / 2;

				const midX = (x1 + x2) / 2;
				const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
				const markerId = `arrow-${from.laneId}`;
				const color = colorByLane.get(from.laneId) ?? "#525252";

				const colDark = rgbToHex(
					hexToRgb(color)?.r - shadow,
					hexToRgb(color)?.g - shadow,
					hexToRgb(color)?.b - shadow,
				);
				const dShad = `M ${x1} ${y1 - shadowOff} L ${midX} ${y1 - shadowOff} L ${midX} ${y2 - shadowOff} L ${x2} ${y2 - shadowOff}`;

				return (
					<g key={link.id}>
						<path
							d={d}
							fill="none"
							stroke="transparent"
							strokeWidth={14}
							pointerEvents="stroke"
							data-link-id={link.id}
							style={{ cursor: "pointer" }}
						/>
						<path
							d={dShad}
							fill="none"
							stroke={colDark}
							strokeWidth={3}
							markerEnd={`url(#${markerId})`}
							strokeLinejoin="miter"
							pointerEvents="none"
						/>
						<path
							d={d}
							fill="none"
							stroke={color}
							strokeWidth={2}
							markerEnd={`url(#${markerId})`}
							strokeLinejoin="miter"
							pointerEvents="none"
						/>
					</g>
				);
			})}
		</svg>
	);
}

function componentToHex(c: any) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex: string) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (result == null) throw Error("Invalid Hex: " + hex);
	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16),
	};
}
