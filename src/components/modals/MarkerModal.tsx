import { useState } from "react";
import { ModalShell } from "./ModalShell";
import { useStore } from "../../store/store";
import type { EditMarkerProps } from "../../store/useModalStore";
import { RiDeleteBin2Line } from "react-icons/ri";
import { DARK_COLOR_PRESETS } from "../../constants";

interface Props extends EditMarkerProps {
	__modalId: string;
	__close: () => void;
}

const COLORS = DARK_COLOR_PRESETS;

export function MarkerModal({ markerId, initialTime, __close }: Props) {
	const existing = useStore((s) =>
		markerId ? s.project.markers.find((m) => m.id === markerId) : undefined,
	);

	const [name, setName] = useState(existing?.name ?? "");
	const [color, setColor] = useState(existing?.color ?? COLORS[0]);
	const [description, setDescription] = useState(existing?.description ?? "");
	const [time, setTime] = useState(existing?.time ?? initialTime ?? 0);

	const isEditing = !!existing;
	const valid = name.trim().length > 0;

	const submit = () => {
		if (!valid) return;
		const trimmed = name.trim();
		if (isEditing) {
			useStore.getState().updateMarker(existing!.id, {
				name: trimmed,
				color,
				description,
				time,
			});
		} else {
			useStore
				.getState()
				.addMarker({ name: trimmed, color, description, time });
		}
		__close();
	};

	const requestDelete = () => {
		if (!existing) return;
		useStore.getState().deleteMarker(existing.id);
		__close();
	};

	return (
		<ModalShell
			title={isEditing ? "Edit Marker" : "New Marker"}
			onClose={__close}
			width={480}
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
						placeholder="New Event"
					/>
				</label>

				<label className="field">
					<span>Time</span>
					<input
						type="number"
						step={0.25}
						min={0}
						className="input"
						value={time}
						onChange={(e) => setTime(Number(e.target.value))}
					/>
				</label>

				<label className="field">
					<span>Description</span>
					<textarea
						className="textarea"
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
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
