// components/timeline/menu/FileMenu.tsx
import { useEffect, useRef, useState } from "react";
import { RiFileLine } from "react-icons/ri";
import { useModalStore } from "../../store/useModalStore";
import { downloadProject, parseProjectFile } from "../../lib/persistence";
import { useStore } from "../../store/store";

export function FileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  const handleNew = () => {
    setOpen(false);
    useModalStore.getState().open("confirm", {
      title: "New project",
      message:
        "Start a new project? Your current work is autosaved, but this action cannot be undone.",
      confirmLabel: "New project",
      onConfirm: () => useStore.getState().newProject(),
    });
  };

  const handleSave = () => {
    setOpen(false);
    downloadProject(useStore.getState().project);
  };

  return (
    <div ref={ref} className="relative">
      <button
        className={`btn btn-sm flex flex-row items-center gap-1 ${open ? "btn-tab-selected" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="File"
      >
        <RiFileLine />
        <span className="text-xs">File</span>
      </button>

      {open && (
        <div className="file-menu panel">
          <button className="btn btn-sm" onClick={handleNew}>
            New Project
          </button>
          <button className="btn btn-sm" onClick={() => inputRef.current?.click()}>
            Open Project…
          </button>
          <button className="btn btn-sm" onClick={handleSave}>
            Save Project (Ctrl+S)
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setOpen(false);
          try {
            const project = parseProjectFile(await file.text());
            useStore.getState().loadProject(project);
          } catch (err) {
            alert(
              "Failed to load project: " +
                (err instanceof Error ? err.message : "unknown error"),
            );
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}