import { createPortal } from 'react-dom';
import { useModalStore } from '../../store/useModalStore';
import { MODAL_REGISTRY } from './registry';

export function ModalHost() {
  const modals = useModalStore((s) => s.modals);
  const close = useModalStore((s) => s.close);

  if (modals.length === 0) return null;

  return createPortal(
    <>
      {modals.map((m) => {
        const Component = MODAL_REGISTRY[m.type] as React.ComponentType<any>;
        return (
          <Component
            key={m.id}
            {...m.props}
            __modalId={m.id}
            __close={() => close(m.id)}
          />
        );
      })}
    </>,
    document.body,
  );
}