import {
	PIXELS_PER_UNIT,
	LANE_PADDING_LEFT,
	RULER_HEIGHT,
	RULER_SECTION_HEIGHT,
} from "../../constants";
import { useStore } from "../../store/store";
import { useModalStore } from "../../store/useModalStore";
import { getSectionRange } from "../../lib/sections";

const MINOR = 0.25;
const DRAG_THRESHOLD = 4;

export function Ruler({ maxTime }: { maxTime: number }) {
	const markers = useStore((s) => s.project.markers);
	const sections = useStore((s) => s.project.sections);
	const project = useStore((s) => s.project);
	const openModal = useModalStore((s) => s.open);
	const updateMarker = useStore((s) => s.updateMarker);

	const end = Math.ceil(maxTime) + 3;
	const ticks: React.ReactNode[] = [];

	for (let t = 0; t <= end; t += MINOR) {
		const x = LANE_PADDING_LEFT + t * PIXELS_PER_UNIT;
		const isMajor = Math.abs(t - Math.round(t)) < 1e-9;

		ticks.push(
			<line
				key={`tick-${t.toFixed(2)}`}
				x1={x}
				x2={x}
				y1={isMajor ? RULER_HEIGHT * 0.6 : RULER_HEIGHT * 0.8}
				y2={RULER_HEIGHT}
				stroke="currentColor"
				strokeWidth={isMajor ? 1 : 0.5}
				className={isMajor ? "text-neutral-500" : "text-neutral-700"}
			/>,
		);

		if (isMajor) {
			ticks.push(
				<text
					key={`label-${t}`}
					x={x + 4}
					y={RULER_HEIGHT * 0.75}
					className="fill-neutral-500 font-mono"
					style={{ fontSize: 10 }}
				>
					{t}
				</text>,
			);
		}
	}

	// ── Marker drag ──────────────────────────────────────────
	const onMarkerPointerDown = (
		e: React.PointerEvent<SVGGElement>,
		markerId: string,
	) => {
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();

		const marker = markers.find((m) => m.id === markerId);
		if (!marker) return;

		const startX = e.clientX;
		const startTime = marker.time;
		let moved = false;

		const onMove = (ev: PointerEvent) => {
			const dxPx = ev.clientX - startX;
			if (!moved && Math.abs(dxPx) < DRAG_THRESHOLD) return;
			moved = true;

			const dt = dxPx / PIXELS_PER_UNIT;
			const raw = Math.max(0, startTime + dt);
			const snapped = ev.shiftKey ? raw : Math.round(raw * 4) / 4;
			updateMarker(markerId, { time: snapped });
		};

		const onUp = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			if (!moved) {
				openModal("edit-marker", { markerId });
			}
		};

		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
	};

	// ── Empty-ruler click → create ───────────────────────────
	const onRulerPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();

		const rect = e.currentTarget.getBoundingClientRect();
		const time = Math.max(
			0,
			(e.clientX - rect.left - LANE_PADDING_LEFT) / PIXELS_PER_UNIT,
		);
		const snapped = Math.round(time * 4) / 4;
		openModal("edit-marker", { initialTime: snapped });
	};

	return (
		<div>
			<svg
				className="block border-b border-neutral-800 cursor-crosshair"
				style={{
					width: "100%",
					height: RULER_HEIGHT,
					overflow: "visible",
				}}
				onPointerDown={onRulerPointerDown}
			>
				{/* Section bands — pointer-events: none so they don't steal clicks */}
				<g style={{ pointerEvents: "none" }}>
					{sections.map((sec) => {
						const range = getSectionRange(sec, project);
						if (!range) return null;
						const x1 =
							LANE_PADDING_LEFT + range.start * PIXELS_PER_UNIT;
						const x2 =
							LANE_PADDING_LEFT + range.end * PIXELS_PER_UNIT;
						const w = Math.max(2, x2 - x1);

						return (
							<g key={sec.id}>
								<rect
									x={x1}
									y={0}
									width={w}
									height={RULER_SECTION_HEIGHT}
									fill={sec.color}
									opacity={0.65}
									rx={2}
								/>
								{w > 60 && (
									<text
										x={x1 + 6}
										y={RULER_SECTION_HEIGHT - 20}
										className="fill-white"
										style={{
											fontSize: 11,
											fontWeight: "bold",
										}}
									>
										{sec.name}
									</text>
								)}
							</g>
						);
					})}
				</g>

				{/* Time ticks */}
				{ticks}

				{/* Markers — draggable */}
				{markers.map((m) => {
					const x = LANE_PADDING_LEFT + m.time * PIXELS_PER_UNIT;
					const flagTop = RULER_SECTION_HEIGHT;

					return (
						<g
							key={m.id}
							data-marker-id={m.id}
							style={{ cursor: "grab" }}
							onPointerDown={(e) => onMarkerPointerDown(e, m.id)}
						>
							<line
								x1={x}
								x2={x}
								y1={flagTop}
								y2={RULER_HEIGHT}
								stroke={m.color}
								strokeWidth={2}
								strokeDasharray="3 2"
							/>
							<rect
								x={x - 4}
								y={0}
								width={8}
								height={RULER_HEIGHT / 2}
								fill={m.color}
							/>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
