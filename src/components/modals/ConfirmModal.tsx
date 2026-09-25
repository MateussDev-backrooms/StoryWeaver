import { ModalShell } from './ModalShell';
import type { ConfirmProps } from '../../store/useModalStore';

interface Props extends ConfirmProps {
  __modalId: string;
  __close: () => void;
}

export function ConfirmModal({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, __close }: Props) {
  return (
    <ModalShell title={title} onClose={() => { onCancel?.(); __close(); }}>
      <p className="mb-3">{message}</p>
      <div className="flex flex-row justify-end gap-1">
        <button className="btn" onClick={() => { onCancel?.(); __close(); }}>Cancel</button>
        <button className="btn" onClick={() => { onConfirm(); __close(); }}>{confirmLabel}</button>
      </div>
    </ModalShell>
  );
}