// components/modals/WelcomeModal.tsx
import "./WelcomeModal.css";
import { useRef, useState } from "react";
import { ModalShell } from "./ModalShell";
import { RiFileAddLine, RiFolderOpenLine } from "react-icons/ri";
import { useStore } from "../../store/store";
import { useModalStore } from "../../store/useModalStore";
import { useToastStore } from "../../store/useToastStore";
import {
  listProjects,
  loadProject,
  deleteProject,
  getActiveId,
} from "../../lib/storage";
import { parseProjectFile } from "../../lib/persistence";
import { ProjectCard } from "../common/ProjectCard";
import type { ProjectMeta } from "../../lib/storage";
import logo from "../../assets/MateussLogo.svg";

interface Props {
  __modalId: string;
  __close: () => void;
}

export function WelcomeModal({ __close }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectMeta[]>(() => listProjects());
  const [activeId] = useState<string | null>(() => getActiveId());
  const inputRef = useRef<HTMLInputElement>(null);

  const openModal = useModalStore((s) => s.open);

  const refresh = () => setProjects(listProjects());

  const loadFile = async (file: File) => {
    try {
      const project = parseProjectFile(await file.text());
      useStore.getState().loadProject(project);
      // Saving happens on the next project change via the autosave subscription
      refresh();
      __close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load file");
    }
  };

  const openProject = (id: string) => {
    if (id === activeId) {
      __close();
      return;
    }
    const p = loadProject(id);
    if (!p) {
      setError("Could not open project");
      return;
    }
    useStore.getState().loadProject(p);
    __close();
  };

  const requestDelete = (id: string, name: string) => {
    openModal("confirm", {
      title: "Delete project",
      message: `Delete "${name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        deleteProject(id);
        refresh();
      },
    });
  };

  const newProject = () => {
    openModal("new-project", {
      onConfirm: (meta) => {
        useStore.getState().createProject(meta);
        __close();
      },
    });
  };

  return (
    <ModalShell title="Welcome" onClose={__close} width={900} dismissible={true}>
      <div className="welcome-content">
        <div>
          <h1 className="heading-giant m-0">StoryWeaver</h1>
          <p className="subheading">
            Silly tool for storywriters to write stories much more easily
          </p>
          <p className="subheading">
            Unlike many other tools, this one is{" "}
            <b>
              <i>Entirely Client-side</i>
            </b>
            . No servers are being used here :P
          </p>
          <p className="subheading">
            Projects are saved to your browser's LocalStorage, or downloaded as
            JSON files! Nothing leaves ur computer
          </p>
        </div>

        <hr />

        <div className="frame welcome-projects-frame">
          <h3 className="heading-3">Your Projects</h3>

          {projects.length === 0 ? (
            <p className="welcome-empty">
              No projects yet. Click <b>New Project</b> to begin, or drop a
              file below.
            </p>
          ) : (
            <div className="project-grid">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  meta={p}
                  isActive={p.id === activeId}
                  onOpen={() => openProject(p.id)}
                  onDelete={() => requestDelete(p.id, p.name)}
                />
              ))}
            </div>
          )}

          <div className="welcome-actions">
            <button
              className="btn flex flex-row items-center"
              onClick={newProject}
            >
              <RiFileAddLine className="m-1" />
              New Project
            </button>
            <button
              className="btn flex flex-row items-center"
              onClick={() => inputRef.current?.click()}
            >
              <RiFolderOpenLine className="m-1" />
              Import from file…
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
          Drop a <code>.storyweaver.json</code> file here to add it
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
            e.target.value = "";
          }}
        />

        <p className="subheading flex flex-row">
          Made with <img src={logo} width={18} className="mx-1" /> by MateussDev
        </p>
      </div>
    </ModalShell>
  );
}