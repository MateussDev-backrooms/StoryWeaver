import { useState } from 'react';
import { ModalShell } from './ModalShell';
import type { CreateCharacterProps, CharacterDraft } from '../../store/useModalStore';

interface Props extends CreateCharacterProps {
  __modalId: string;
  __close: () => void;
}

const PRESETS = ['#22d3ee', '#f87171', '#fbbf24', '#34d399', '#a78bfa', '#ec4899', '#94a3b8'];
const DEFAULT_DRAFT: CharacterDraft = { name: '', color: PRESETS[0], group: 'Neutral' };

export function CreateCharacterModal({ onConfirm, onCancel, __close }: Props) {
  const [draft, setDraft] = useState<CharacterDraft>(DEFAULT_DRAFT);
  const trimmed = draft.name.trim();
  const valid = trimmed.length > 0;

  const submit = () => {
    if (!valid) return;
    onConfirm({ ...draft, name: trimmed });
    __close();
  };

  const cancel = () => {
    onCancel?.();
    __close();
  };

  return (
    <ModalShell title="New character" onClose={cancel}>
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <label className="field">
          <span>Name</span>
          <input
            autoFocus
            className="input"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Aria"
          />
        </label>

        <label className="field">
          <span>Group</span>
          <input
            className="input"
            value={draft.group}
            onChange={(e) => setDraft({ ...draft, group: e.target.value })}
            placeholder="Protagonist / Antagonist / Neutral"
            list="character-groups"
          />
          <datalist id="character-groups">
            <option value="Protagonist" />
            <option value="Antagonist" />
            <option value="Neutral" />
          </datalist>
        </label>

        <label className="field">
          <span>Colour</span>
          <div className="flex flex-row gap-1 items-center">
            <input
              type="color"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
              className="colour-input"
            />
            <div className="flex flex-row gap-1">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch ${draft.color === c ? 'swatch-selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setDraft({ ...draft, color: c })}
                />
              ))}
            </div>
          </div>
        </label>

        <div className="flex flex-row justify-end gap-1 mt-2">
          <button type="button" className="btn" onClick={cancel}>Cancel</button>
          <button type="submit" className="btn" disabled={!valid}>Create</button>
        </div>
      </form>
    </ModalShell>
  );
}