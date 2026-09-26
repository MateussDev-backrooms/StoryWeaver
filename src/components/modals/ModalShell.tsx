import { useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export function ModalShell({ title, onClose, children, width = 360 }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onPointerDown={onClose}>
      <div
        className="modal-window panel"
        style={{ width }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="modal-titlebar shading-inverted">
          <span className="modal-title">{title}</span>
        </div>
        <div className="modal-body bg-slate-300 shading-inverted ">{children}</div>
      </div>
    </div>
  );
}