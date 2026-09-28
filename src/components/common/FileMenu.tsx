import { useEffect, useRef, useState } from "react";
import {
	RiFileAddFill,
	RiFolderOpenFill,
	RiMenuFill,
	RiSave2Fill,
	RiSettings2Fill,
} from "react-icons/ri";
import { useModalStore } from "../../store/useModalStore";
import { downloadProject, parseProjectFile } from "../../lib/persistence";
import { useStore } from "../../store/store";
import { useToastStore } from "../../store/useToastStore";

export function FileMenu() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const openModal = useModalStore((s) => s.open);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: PointerEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpen(false);
		};
		window.addEventListener("pointerdown", onDown);
		return () => window.removeEventListener("pointerdown", onDown);
	}, [open]);

	const handleNew = () => {
		openModal("new-project", {
			onConfirm: (meta) => {
				useStore.getState().createProject(meta);
			},
		});
	};

	const handleExport = () => {
		setOpen(false);
		const p = useStore.getState().project;
		downloadProject(p);
		useToastStore.getState().push({
			type: "success",
			message: `Exported "${p.name}". Check your downloads folder.`,
		});
	};

	return (
		<div ref={ref} className="relative">
			<button
				className={`btn flex flex-row items-center gap-1 ${open ? "btn-tab-selected" : ""}`}
				onClick={() => setOpen((v) => !v)}
				title="File"
			>
				<RiMenuFill />
			</button>

			{open && (
				<div className="file-menu panel">
					<h4 className="heading-4">Project Name</h4>
					<button className="btn btn-sm" onClick={handleNew}>
						<RiFileAddFill />
						New Project
					</button>
					<button
						className="btn btn-sm"
						onClick={() => inputRef.current?.click()}
					>
						<RiFolderOpenFill />
						Open Project
					</button>
					<button className="btn btn-sm" onClick={handleExport}>
						<RiSave2Fill />
						Export Project
					</button>

					<hr className="my-2"></hr>

					<button className="btn btn-sm">
						<RiSettings2Fill />
						Project settings
					</button>
				</div>
			)}

			<input
				ref={inputRef}
				type="file"
				accept=".json,application/json"
				style={{ display: "none" }}
				onChange={async (e) => {
					const file = e.target.files?.[0];
					if (!file) return;
					setOpen(false);
					try {
						const project = parseProjectFile(await file.text());
						useStore.getState().loadProject(project);
					} catch (err) {
						alert(
							"Failed to load project: " +
								(err instanceof Error
									? err.message
									: "unknown error"),
						);
					}
					e.target.value = "";
				}}
			/>
		</div>
	);
}
