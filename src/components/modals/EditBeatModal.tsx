import { useEffect, useState } from "react";
import { ModalShell } from "./ModalShell";
import { useStore } from "../../store/store";
import type { EditBeatProps } from "../../store/useModalStore";

interface Props extends EditBeatProps {
  __modalId: string;
  __close: () => void;
}

export function EditBeatModal({ beatId, __close }: Props) {
  const beat = useStore((s) => {
    for (const lane of s.project.lanes) {
      const b = lane.beats.find((x) => x.id === beatId);
      if (b) return b;
    }
    return undefined;
  });
  const updateBeat = useStore((s) => s.updateBeat);

  // Local draft so Escape can discard without touching the store.
  const [title, setTitle] = useState(beat?.title ?? "");
  const [content, setContent] = useState(beat?.content ?? "");

  if (!beat) return null; // beat was deleted while modal was open

  const commit = () => {
    updateBeat(beatId, { title: title.trim() || beat.title, content });
    __close();
  };

  return (
    <ModalShell title={`Edit — ${beat.title}`} onClose={__close} width={900}>
      <div className="flex flex-col gap-2">
        <label className="field">
          <span>Heading</span>
          <input
            autoFocus
            className="input input-big"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
          />
        </label>

        <label className="field">
          <span>Content</span>
          <textarea
            className="textarea"
            rows={30}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happens here?"
          />
        </label>

        <div className="flex flex-row justify-end gap-1 mt-2">
          <button className="btn" onClick={__close}>
            Cancel
          </button>
          <button className="btn" onClick={commit}>
            Save
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
