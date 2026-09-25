// components/modals/registry.tsx
import type { ModalType } from '../../store/useModalStore';
import { ConfirmModal } from './ConfirmModal';
import { CreateCharacterModal } from './CreateCharacterModal';
import { EditBeatModal } from './EditBeatModal';

export const MODAL_REGISTRY: Record<ModalType, React.ComponentType<any>> = {
  'create-character': CreateCharacterModal,
  'edit-beat': EditBeatModal,
  'confirm': ConfirmModal,
};