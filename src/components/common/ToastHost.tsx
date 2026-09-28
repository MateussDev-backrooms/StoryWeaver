import "./ToastHost.css";
import { createPortal } from "react-dom";
import {
	RiCheckboxCircleLine,
	RiErrorWarningLine,
	RiInformationLine,
} from "react-icons/ri";
import { useToastStore } from "../../store/useToastStore";

const ICONS = {
	info: RiInformationLine,
	success: RiCheckboxCircleLine,
	error: RiErrorWarningLine,
};

export function ToastHost() {
	const toasts = useToastStore((s) => s.toasts);
	const dismiss = useToastStore((s) => s.dismiss);

	if (toasts.length === 0) return null;

	return createPortal(
		<div className="toast-host">
			{toasts.map((t) => {
				const Icon = ICONS[t.type];
				return (
					<div
						key={t.id}
						className={`toast panel toast-${t.type}`}
						onPointerDown={() => dismiss(t.id)}
					>
						<Icon className="toast-icon" />
						<span>{t.message}</span>
					</div>
				);
			})}
		</div>,
		document.body,
	);
}
