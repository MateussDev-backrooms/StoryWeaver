import { useRef, useState } from "react";
import { ModalShell } from "./ModalShell";
import { useStore } from "../../store/store";
import { parseProjectFile } from "../../lib/persistence";
import { RiFileAddLine, RiFolderOpenLine } from "react-icons/ri";

interface Props {
  __modalId: string;
  __close: () => void;
}

export function WelcomeModal({ __close }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = async (file: File) => {
    try {
      const project = parseProjectFile(await file.text());
      useStore.getState().loadProject(project);
      __close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load file");
    }
  };

  const newProject = () => {
    useStore.getState().newProject();
    __close();
  };

  return (
    <ModalShell title="Welcome" onClose={__close} width={1300} dismissible={false}>
      <div className="welcome-content">
        <div>
          <h1 className="heading-giant m-0">StoryWeaver</h1>
          <p className="subheading">
            Silly tool for storywriters to write stories much more easily
          </p>
          <p className="subheading">
            Unlike many other tools, this one is <b><i>Entirely Client-side</i></b>. No servers are being used here :P
          </p>
          <p className="subheading">
            Projects are saved to your browser's LocalStorage, or downloaded as JSON files! Nothing leaves ur computer
          </p>
        </div>

        <hr></hr>


        <div className="frame">
            <h3 className="heading-3">Your last Projects:</h3>
            <div className="welcome-actions">
          <button className="btn flex flex-row items-center" onClick={newProject}>
            <RiFileAddLine className="m-1"/>
            New Project
          </button>
          <button className="btn flex flex-row items-center" onClick={() => inputRef.current?.click()}>
            <RiFolderOpenLine className="m-1"/>
            Open Project…
          </button>
        </div>
        </div>


        <div
          className={`welcome-dropzone ${dragging ? "welcome-dropzone-active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) loadFile(file);
          }}
          onClick={() => inputRef.current?.click()}
        >
          Drop a <code>.storyweaver.json</code> file here
        </div>

        {error && <div className="welcome-error">{error}</div>}

        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadFile(file);
          }}
        />
        <p className="welcome-sub">
            Made by MateussDev
          </p>
      </div>
    </ModalShell>
  );
}