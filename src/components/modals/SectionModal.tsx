import { useMemo, useState } from "react";
import { ModalShell } from "./ModalShell";
import { useStore } from "../../store/store";
import { useToastStore } from "../../store/useToastStore";
import type { EditSectionProps } from "../../store/useModalStore";
import { RiDeleteBin2Line } from "react-icons/ri";
import { START_SENTINEL, END_SENTINEL } from "../../lib/sections";
import { PASTEL_COLOR_PRESETS } from "../../constants";

interface Props extends EditSectionProps {
	__modalId: string;
	__close: () => void;
}

const COLORS = PASTEL_COLOR_PRESETS;

export function SectionModal({ sectionId, __close }: Props) {
	const markers = useStore((s) => s.project.markers);
	const existing = useStore((s) =>
		sectionId
			? s.project.sections.find((x) => x.id === sectionId)
			: undefined,
	);

	const sortedMarkers = useMemo(
		() => [...markers].sort((a, b) => a.time - b.time),
		[markers],
	);

	const [name, setName] = useState(existing?.name ?? "");
	const [color, setColor] = useState(existing?.color ?? COLORS[0]);
	const [startId, setStartId] = useState(
		existing?.startMarkerId ?? START_SENTINEL,
	);
	const [endId, setEndId] = useState(existing?.endMarkerId ?? END_SENTINEL);

	const isEditing = !!existing;
	const valid = name.trim().length > 0 && startId !== endId;

	const submit = () => {
		if (!valid) return;
		const trimmed = name.trim();
		const s = useStore.getState();

		if (isEditing) {
			// Delete + re-add so the overlap check re-runs against siblings.
			s.deleteSection(existing!.id);
			const res = s.addSection({
				name: trimmed,
				color,
				startMarkerId: startId,
				endMarkerId: endId,
			});
			if (!res.ok) {
				useToastStore
					.getState()
					.push({ type: "error", message: res.reason });
				// Roll back to the original
				s.addSection({
					name: existing!.name,
					color: existing!.color,
					startMarkerId: existing!.startMarkerId,
					endMarkerId: existing!.endMarkerId,
				});
				return;
			}
		} else {
			const res = s.addSection({
				name: trimmed,
				color,
				startMarkerId: startId,
				endMarkerId: endId,
			});
			if (!res.ok) {
				useToastStore
					.getState()
					.push({ type: "error", message: res.reason });
				return;
			}
		}
		__close();
	};

	const requestDelete = () => {
		if (!existing) return;
		useStore.getState().deleteSection(existing.id);
		__close();
	};

	return (
		<ModalShell
			title={isEditing ? "Edit Section" : "New Section"}
			onClose={__close}
			width={520}
		>
			<form
				className="flex flex-col gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					submit();
				}}
			>
				<label className="field">
					<span>Name</span>
					<input
						autoFocus
						className="input input-big"
						style={{ backgroundColor: color }}
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="New arc/section"
					/>
				</label>

				<label className="field">
					<span>From</span>
					<select
						className="input"
						value={startId}
						onChange={(e) => setStartId(e.target.value)}
					>
						<option value={START_SENTINEL}>— Story Start —</option>
						{sortedMarkers.map((m) => (
							<option key={m.id} value={m.id}>
								{m.name} (t={m.time})
							</option>
						))}
						<option value={END_SENTINEL}>— Story End —</option>
					</select>
				</label>

				<label className="field">
					<span>To</span>
					<select
						className="input"
						value={endId}
						onChange={(e) => setEndId(e.target.value)}
					>
						<option value={START_SENTINEL}>— Story Start —</option>
						{sortedMarkers.map((m) => (
							<option key={m.id} value={m.id}>
								{m.name} (t={m.time})
							</option>
						))}
						<option value={END_SENTINEL}>— Story End —</option>
					</select>
				</label>

				<label className="field">
					<span>Colour</span>
					<div className="flex flex-row gap-1">
						<input
							type="color"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="colour-input"
						/>
						{COLORS.map((c) => (
							<button
								key={c}
								type="button"
								className={`swatch ${color === c ? "swatch-selected" : ""}`}
								style={{ background: c }}
								onClick={() => setColor(c)}
							/>
						))}
					</div>
				</label>

				<div className="flex flex-row justify-end gap-1 mt-2">
					{isEditing && (
						<button
							type="button"
							className="btn mr-auto"
							onClick={requestDelete}
						>
							<RiDeleteBin2Line />
						</button>
					)}
					<button type="button" className="btn" onClick={__close}>
						Cancel
					</button>
					<button type="submit" className="btn" disabled={!valid}>
						{isEditing ? "Save" : "Create"}
					</button>
				</div>
			</form>
		</ModalShell>
	);
}
