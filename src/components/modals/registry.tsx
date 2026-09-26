// components/modals/registry.tsx
import type { ModalType } from '../../store/useModalStore';
import { ConfirmModal } from './ConfirmModal';
import { CreateCharacterModal } from './CreateCharacterModal';
import { EditBeatModal } from './EditBeatModal';
import { MarkerModal } from './MarkerModal';
import { NewProjectModal } from './NewProjectModal';
import { SectionModal } from './SectionModal';
import { WelcomeModal } from './WelcomeModal';

export const MODAL_REGISTRY: Record<ModalType, React.ComponentType<any>> = {
  'create-character': CreateCharacterModal,
  'edit-beat': EditBeatModal,
  'confirm': ConfirmModal,
  'welcome': WelcomeModal,
  'new-project': NewProjectModal,
  'edit-marker': MarkerModal,
  'edit-section': SectionModal
};