import { RiScissorsFill } from "react-icons/ri";
import type { Tool, ToolContext } from "./types";
import { hitTestCanvas } from "./hitTest";
import { useStore } from "../store/store";

function deleteAt(ctx: ToolContext) {
	if (ctx.hit.kind === "beat") {
		ctx.actions.deleteBeat(ctx.hit.laneId, ctx.hit.beat.id);
		ctx.selection.remove(ctx.hit.beat.id);
	} else if (ctx.hit.kind === "arrow") {
		ctx.actions.deleteLink(ctx.hit.linkId);
	}
}

export const deleteTool: Tool = {
	id: "delete",
	label: "Scissors",
	icon: RiScissorsFill,
	cursor: "crosshair",
	intent: () => "delete",
	getCursorIcon: () => RiScissorsFill,

	onPointerDown: (ctx) => {
		//Delete instantly
		if (ctx.hit.kind === "beat" || ctx.hit.kind === "arrow") {
			deleteAt(ctx);
			return {
				onPointerMove: (c) => deleteAt(c),
			};
		}

		//Cut line
		const startX = ctx.pointer.canvasX;
		const startY = ctx.pointer.canvasY;

		return {
			onPointerMove: (c) => {
				ctx.setPreview({
					kind: "cut",
					x1: startX,
					y1: startY,
					x2: c.pointer.canvasX,
					y2: c.pointer.canvasY,
				});
			},
			onPointerUp: (c) => {
				const endX = c.pointer.canvasX;
				const endY = c.pointer.canvasY;
				ctx.setPreview(null);

				const dx = endX - startX;
				const dy = endY - startY;
				const length = Math.hypot(dx, dy);
				if (length < 6) return;

                //Line Sampling
				const STEP = 4;
				const samples = Math.max(2, Math.ceil(length / STEP));
				const rootX = c.pointer.rootX;
				const rootY = c.pointer.rootY;

				const beatHits = new Set<string>();
				const linkHits = new Set<string>();

				for (let i = 0; i <= samples; i++) {
					const t = i / samples;
					const px = startX + dx * t;
					const py = startY + dy * t;

					const hit = hitTestCanvas(
						px + rootX,
						py + rootY,
						px,
						py,
						useStore.getState().project,
					);
					if (hit.kind === "beat") beatHits.add(hit.beat.id);
					else if (hit.kind === "arrow") linkHits.add(hit.linkId);
				}

				for (const id of linkHits) ctx.actions.deleteLink(id);
				for (const id of beatHits) {
					const laneId = ctx.actions.findLaneOfBeat(id);
					if (laneId) ctx.actions.deleteBeat(laneId, id);
				}

				for (const id of beatHits) ctx.selection.remove(id);
			},
		};
	},
};
