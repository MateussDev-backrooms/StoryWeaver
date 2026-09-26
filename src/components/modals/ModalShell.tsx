import { useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  dismissible?: boolean;
}

export function ModalShell({ title, onClose, children, width = 360, dismissible = true }: Props) {
  useEffect(() => {
    if (!dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, dismissible]);

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div
        className="modal-window panel"
        style={{ width }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="modal-titlebar shading">
          <span className="modal-title">{title}</span>
        </div>
        <div className="modal-body bg-slate-300 shading-inverted ">{children}</div>
      </div>
    </div>
  );
}