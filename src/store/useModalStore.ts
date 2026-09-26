import { create } from 'zustand';
import type { Lane } from '../types/types';

const uid = () => Math.random().toString(36).slice(2, 10);

// ===== Modal data ===== //


// Character modal
export interface CharacterDraft {
    name: string;
    color: string;
    group: string;
}

export interface CreateCharacterProps {
    laneEdit?: Lane;
    onConfirm: (draft: CharacterDraft) => void;
    onCancel?: () => void;
}

// Edit beat
export interface EditBeatProps {
    laneId: string;
    beatId: string;
}

// Generic confirm
export interface ConfirmProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface ModalPropsMap {
  'create-character': CreateCharacterProps;
  'edit-beat': EditBeatProps;
  'confirm': ConfirmProps;
}

export type ModalType = keyof ModalPropsMap;

interface ModalInstance<K extends ModalType = ModalType> {
  id: string;
  type: K;
  props: ModalPropsMap[K];
}

interface ModalStore {
  modals: ModalInstance[];

  open: <K extends ModalType>(type: K, props: ModalPropsMap[K]) => string;
  close: (id: string) => void;
  closeTop: () => void;
  closeAll: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modals: [],

  open: (type, props) => {
    const id = uid();
    set((s) => ({
      modals: [...s.modals, { id, type, props } as ModalInstance],
    }));
    return id;
  },

  close: (id) =>
    set((s) => ({ modals: s.modals.filter((m) => m.id !== id) })),

  closeTop: () =>
    set((s) => ({ modals: s.modals.slice(0, -1) })),

  closeAll: () => set({ modals: [] }),
}));