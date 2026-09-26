import type { Project } from "../types/types";

export const FILE_FORMAT = "storyweaver";
export const FILE_VERSION = 1;
export const STORAGE_KEY = "storyweaver:project";

export interface ProjectFile {
  format: typeof FILE_FORMAT;
  version: number;
  project: Project;
}

export function serialize(project: Project): string {
  const file: ProjectFile = {
    format: FILE_FORMAT,
    version: FILE_VERSION,
    project,
  };
  return JSON.stringify(file, null, 2);
}

export function parseProjectFile(text: string): Project {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON");
  }

  if (!data || typeof data !== "object") {
    throw new Error("File is not a project");
  }

  const file = data as Partial<ProjectFile>;

  if (file.format !== FILE_FORMAT) {
    throw new Error("Not a Story Weaver project file");
  }
  if (typeof file.version !== "number" || file.version > FILE_VERSION) {
    throw new Error(`Unsupported file version: ${file.version}`);
  }

  const p = file.project;
  if (!p || !Array.isArray(p.lanes) || !Array.isArray(p.links)) {
    throw new Error("Project data is malformed");
  }

  return p;
}

export function loadFromLocalStorage(): Project | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseProjectFile(raw);
  } catch (e) {
    console.warn("Failed to restore stored project:", e);
    return null;
  }
}

export function saveToLocalStorage(project: Project): void {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(project));
  } catch (e) {
    // QuotaExceededError → the project is too big for localStorage.
    // Could fall back to IndexedDB here later; for now just log.
    console.warn("Autosave failed:", e);
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function downloadProject(project: Project): void {
  const blob = new Blob([serialize(project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(project.title)}.storyweaver.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(s: string): string {
  return (
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "untitled"
  );
}