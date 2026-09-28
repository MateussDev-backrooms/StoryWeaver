import "./ProjectCard.css";
import { RiDeleteBin2Line, RiTimeLine } from "react-icons/ri";
import type { ProjectMeta } from "../../lib/storage";
import { ProjectIcon } from "./ProjectIcons";

interface Props {
	meta: ProjectMeta;
	isActive: boolean;
	onOpen: () => void;
	onDelete: () => void;
}

function relativeTime(iso: string): string {
	const ms = Date.now() - new Date(iso).getTime();
	const s = Math.floor(ms / 1000);
	if (s < 60) return "just now";
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	if (d < 30) return `${d}d ago`;
	return new Date(iso).toLocaleDateString();
}

export function ProjectCard({ meta, isActive, onOpen, onDelete }: Props) {
	return (
		<div
			className={`project-card ${isActive ? "project-card-active" : ""}`}
			onClick={onOpen}
			style={{ ["--project-accent" as any]: meta.color }}
		>
			<div
				className="project-card-icon"
				style={{ backgroundColor: meta.color }}
			>
				<ProjectIcon name={meta.icon} className="w-6 h-6" />
			</div>

			<div className="project-card-body">
				<h4 className="project-card-name">{meta.name}</h4>
				<p className="project-card-stats">
					{meta.characterCount}{" "}
					{meta.characterCount === 1 ? "character" : "characters"} ·{" "}
					{meta.beatCount} {meta.beatCount === 1 ? "beat" : "beats"}
				</p>
				<p className="project-card-time">
					<RiTimeLine /> {relativeTime(meta.updatedAt)}
				</p>
			</div>

			<button
				className="project-card-delete"
				onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}
				title="Delete project"
			>
				<RiDeleteBin2Line />
			</button>
		</div>
	);
}
