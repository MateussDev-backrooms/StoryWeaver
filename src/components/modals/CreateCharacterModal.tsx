import { useState } from "react";
import { ModalShell } from "./ModalShell";
import {
  type CreateCharacterProps,
  type CharacterDraft,
  useModalStore,
} from "../../store/useModalStore";
import { RiDeleteBin2Line } from "react-icons/ri";
import { useStore } from "../../store/store";

interface Props extends CreateCharacterProps {
  __modalId: string;
  __close: () => void;
}

const PRESETS = [
  "#22d3ee",
  "#f87171",
  "#fbbf24",
  "#34d399",
  "#a78bfa",
  "#ec4899",
  "#94a3b8",
];
const DEFAULT_DRAFT: CharacterDraft = {
  name: "",
  color: PRESETS[0],
  group: "Neutral",
};

export function CreateCharacterModal({
  onConfirm,
  onCancel,
  __close,
  laneEdit,
}: Props) {
  const isEditing = laneEdit != undefined;

  const [draft, setDraft] = useState<CharacterDraft>(
    laneEdit
      ? { name: laneEdit.name, color: laneEdit.color, group: laneEdit.group }
      : DEFAULT_DRAFT,
  );
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

  const openModal = useModalStore((s) => s.open);

  const requestDelete = () => {
    if (!laneEdit) return;
    openModal("confirm", {
      title: "Delete character",
      message:
        `Delete "${laneEdit.name}"? This removes the lane and all ${laneEdit.beats.length} ` +
        `of its beats.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        useStore.getState().removeLane(laneEdit.id);
        __close(); // close the create-character modal too
      },
    });
  };

  return (
    <ModalShell
      title={isEditing ? "Edit Character" : "New Character"}
      onClose={cancel}
      width={700}
    >
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="field">
          <span>Name</span>
          <input
            autoFocus
            className="input input-big"
            style={{ backgroundColor: draft.color }}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="John Doe"
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
                  className={`swatch ${draft.color === c ? "swatch-selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setDraft({ ...draft, color: c })}
                />
              ))}
            </div>
          </div>
        </label>

        <div className="flex flex-row justify-end gap-1 mt-2">
          {isEditing && (
            <button
              type="button"
              className="btn mr-auto"
              onClick={requestDelete}
              title="Delete character"
            >
              <RiDeleteBin2Line />
            </button>
          )}
          <button type="button" className="btn" onClick={cancel}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={!valid}>
            {isEditing ? "Confirm" : "Create"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
