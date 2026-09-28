import "./App.css";
import { Timeline } from "./components/timeline/Timeline";
import { useValidation } from "./hooks/useValidation";
import { ErrorPanel } from "./components/error/ErrorPanel";
import {
	RiArrowGoBackFill,
	RiArrowGoForwardFill,
	RiArrowLeftRightLine,
	RiPencilLine,
	RiPieChart2Line,
	RiTimelineView,
} from "react-icons/ri";
import { Toolbar } from "./components/timeline/ToolBar";
import { ModalHost } from "./components/modals/ModalHost";
import { CharacterMenu } from "./components/timeline/menu/CharacterMenu";

import { useStore as useZustandStore } from "zustand";
import { useStore } from "./store/store";
import { useEffect, useRef } from "react";
import { useModalStore } from "./store/useModalStore";
import { downloadProject, parseProjectFile } from "./lib/persistence";
import { throttle } from "./lib/throttle";
import type { Project } from "./types/types";
import { FileMenu } from "./components/common/FileMenu";
import { saveProject } from "./lib/storage";
import { useToastStore } from "./store/useToastStore";
import { ToastHost } from "./components/common/ToastHost";
import { useToolStore } from "./store/useToolStore";
import { SectionBar } from "./components/timeline/menu/SectionBar";

function App() {
	const { issues } = useValidation();

	const canUndo = useZustandStore(
		useStore.temporal,
		(s) => s.pastStates.length > 0,
	);
	const canRedo = useZustandStore(
		useStore.temporal,
		(s) => s.futureStates.length > 0,
	);
	const undo = useZustandStore(useStore.temporal, (s) => s.undo);
	const redo = useZustandStore(useStore.temporal, (s) => s.redo);

	const rippleEdit = useToolStore((s) => s.rippleEdit);
	const setRippleEdit = useToolStore((s) => s.setRippleEdit);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;

            //Ctrl-z in text handled automatically here
			if (target?.closest("input, textarea, [contenteditable]")) return;

			const mod = e.ctrlKey || e.metaKey;
			if (!mod) return;

			if (e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				useStore.temporal.getState().undo();
			} else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
				e.preventDefault();
				useStore.temporal.getState().redo();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	//Saving thingamajigs

	//Autosave
	useEffect(() => {
		const save = throttle((p: Project) => {
			try {
				saveProject(p);
			} catch (e) {
				useToastStore.getState().push({
					type: "error",
					message: e instanceof Error ? e.message : "Save failed",
				});
			}
		}, 800);

		const unsub = useStore.subscribe((state, prev) => {
			if (state.project !== prev.project) save(state.project);
		});
		return unsub;
	}, []);

	//Ctrl+S
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				try {
					saveProject(useStore.getState().project);
					useToastStore.getState().push({
						type: "success",
						message: "Saved to LocalStorage",
					});
				} catch (e) {
					useToastStore.getState().push({
						type: "error",
						message: e instanceof Error ? e.message : "Save failed",
					});
				}
				downloadProject(useStore.getState().project);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	//Global drag-drop of project
	useEffect(() => {
		const onDragOver = (e: DragEvent) => {
			if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
		};
		const onDrop = async (e: DragEvent) => {
			e.preventDefault();
			const file = e.dataTransfer?.files[0];
			if (!file) return;
			try {
				const project = parseProjectFile(await file.text());
				useStore.getState().loadProject(project);
			} catch (err) {
				alert(
					"Failed to load project: " +
						(err instanceof Error ? err.message : "unknown error"),
				);
			}
		};
		window.addEventListener("dragover", onDragOver);
		window.addEventListener("drop", onDrop);
		return () => {
			window.removeEventListener("dragover", onDragOver);
			window.removeEventListener("drop", onDrop);
		};
	}, []);

	const openedWelcome = useRef(false);
	useEffect(() => {
		if (openedWelcome.current) return;
		openedWelcome.current = true;
		useModalStore.getState().open("welcome", {});
	}, []);

	return (
		<>
			<nav className="panel m-1 flex flex-row h-fit p-2 bg-amber-300">
				<h1 className="heading-nav p-0 my-auto">StoryWeaver</h1>

				<div className="mx-auto">
					<div className="flex flex-row">
						<button
							className="btn btn-tab-selected flex flex-row items-center"
							tabIndex={-1}
						>
							{" "}
							<RiTimelineView className="m-1"></RiTimelineView>{" "}
							Timeline
						</button>
						<button
							className="btn flex flex-row items-center"
							tabIndex={-1}
						>
							{" "}
							<RiPencilLine className="m-1"></RiPencilLine>{" "}
							Narrative
						</button>
						<button
							className="btn flex flex-row items-center"
							tabIndex={-1}
						>
							{" "}
							<RiPieChart2Line className="m-1"></RiPieChart2Line>{" "}
							Statistics
						</button>
					</div>
				</div>

				<FileMenu />
			</nav>

			<ToastHost />
			<ModalHost />

			<div className="panel panel-sm flex flex-row m-1">
				{/* Menu bar Right below navbar (TODO: Move to timeline) */}

				{/* Undo-Redo */}
				<div className="shading-inverted bg-slate-400 p-[0.2rem] flex flex-row text-xl">
					<button
						className="btn btn-sm flex flex-row items-center gap-1"
						title="Undo (Ctrl+Z)"
						onClick={() => undo()}
						disabled={!canUndo}
						tabIndex={-1}
					>
						<RiArrowGoBackFill />
					</button>
					<button
						className="btn btn-sm flex flex-row items-center gap-1"
						title="Redo (Ctrl+Shift+Z)"
						onClick={() => redo()}
						disabled={!canRedo}
						tabIndex={-1}
					>
						<RiArrowGoForwardFill />
					</button>
				</div>

				{/* Toolbar */}
				<div className="shading-inverted bg-slate-500 p-[0.2rem] flex flex-row text-xl">
					<Toolbar></Toolbar>
				</div>

				<div className="shading-inverted bg-slate-500 p-[0.2rem] flex flex-row text-xl">
					<button
						className={`btn btn-sm ${rippleEdit ? "btn-tab-selected" : ""}`}
						title="Ripple edit — moves also shift subsequent beats"
						onClick={() => setRippleEdit(!rippleEdit)}
						tabIndex={-1}
					>
						<RiArrowLeftRightLine />
					</button>
				</div>

				<div className="shading-inverted bg-slate-400 p-[0.2rem] flex flex-row text-xl max-w-[75%]">
					<SectionBar />
				</div>

				<div className="ml-auto">
					<CharacterMenu />
				</div>
			</div>
			<div className="timeline h-[80vh] shading-inverted p-0 m-1 bg-[#bbbbbb] overflow-y-auto">
				<Timeline />
			</div>
			<div className="panel flex flex-row m-1">{/* Footer */}</div>

			<ErrorPanel issues={issues} />
		</>
	);
}

export default App;
