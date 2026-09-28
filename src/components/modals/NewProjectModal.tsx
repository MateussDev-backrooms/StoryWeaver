import "./CommonModal.css";
import { useState } from "react";
import { ModalShell } from "./ModalShell";
import type { NewProjectProps } from "../../store/useModalStore";
import { PROJECT_ICON_KEYS, ProjectIcon } from "../common/ProjectIcons";
import { PASTEL_COLOR_PRESETS } from "../../constants";

interface Props extends NewProjectProps {
	__modalId: string;
	__close: () => void;
}

const COLORS = PASTEL_COLOR_PRESETS;

export function NewProjectModal({ onConfirm, onCancel, __close }: Props) {
	const [name, setName] = useState("");
	const [color, setColor] = useState(COLORS[0]);
	const [icon, setIcon] = useState(PROJECT_ICON_KEYS[0]);
	const trimmed = name.trim();
	const valid = trimmed.length > 0;

	const submit = () => {
		if (!valid) return;
		onConfirm({ name: trimmed, color, icon });
		__close();
	};

	const cancel = () => {
		onCancel?.();
		__close();
	};

	return (
		<ModalShell title="New Project" onClose={cancel} width={560}>
			<form
				className="flex flex-col gap-3"
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
						placeholder="Greatest story ever"
					/>
				</label>

				<label className="field">
					<span>Colour</span>
					<div className="flex flex-row gap-1 items-center flex-wrap">
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

				<label className="field">
					<span>Icon</span>
					<div className="icon-grid">
						{PROJECT_ICON_KEYS.map((key) => (
							<button
								key={key}
								type="button"
								className={`icon-option ${icon === key ? "icon-option-selected" : ""}`}
								onClick={() => setIcon(key)}
								title={key}
							>
								<ProjectIcon name={key} className="w-6 h-6" />
							</button>
						))}
					</div>
				</label>

				<div className="flex flex-row justify-end gap-1 mt-2">
					<button type="button" className="btn" onClick={cancel}>
						Cancel
					</button>
					<button type="submit" className="btn" disabled={!valid}>
						Create
					</button>
				</div>
			</form>
		</ModalShell>
	);
}
