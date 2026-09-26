import LZString from "lz-string";
import { hydrateProject, parseProjectFile, serialize } from "./persistence";
import type { Project } from "../types/types";

const INDEX_KEY = "storyweaver:index";
const PROJECT_KEY = (id: string) => `storyweaver:p:${id}`;

export interface ProjectMeta {
  id: string;
  name: string;
  color: string;
  icon: string;
  characterCount: number;
  beatCount: number;
  updatedAt: string;
}

interface Index {
  projects: ProjectMeta[];
  activeId: string | null;
}

function readIndex(): Index {
  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) return { projects: [], activeId: null };
  try {
    const idx = JSON.parse(raw) as Index;
    return {
      projects: Array.isArray(idx.projects) ? idx.projects : [],
      activeId: typeof idx.activeId === "string" ? idx.activeId : null,
    };
  } catch {
    return { projects: [], activeId: null };
  }
}

function writeIndex(idx: Index): void {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch (e) {
    console.error("Failed to write project index:", e);
  }
}

export function listProjects(): ProjectMeta[] {
  return readIndex().projects.sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getActiveId(): string | null {
  return readIndex().activeId;
}

export function setActiveId(id: string): void {
  const idx = readIndex();
  idx.activeId = id;
  writeIndex(idx);
}

export function saveProject(project: Project): void {
  const payload = serialize(project);
  const compressed = LZString.compressToUTF16(payload);

  try {
    localStorage.setItem(PROJECT_KEY(project.id), compressed);
  } catch (e) {
    console.error("Failed to save project — quota exceeded?", e);
    throw new Error(
      "Storage is full. Export a project to a file and delete it from the browser to free space.",
    );
  }

  const idx = readIndex();
  const meta: ProjectMeta = {
    id: project.id,
    name: project.name,
    color: project.color,
    icon: project.icon,
    characterCount: project.lanes.length,
    beatCount: project.lanes.reduce((n, l) => n + l.beats.length, 0),
    updatedAt: new Date().toISOString(),
  };

  const i = idx.projects.findIndex((p) => p.id === project.id);
  if (i >= 0) idx.projects[i] = meta;
  else idx.projects.push(meta);

  idx.activeId = project.id;
  writeIndex(idx);
}

export function loadProject(id: string): Project | null {
  const raw = localStorage.getItem(PROJECT_KEY(id));
  if (!raw) return null;

  const json = LZString.decompressFromUTF16(raw);
  if (!json) return null;

  try {
    const envelope = JSON.parse(json);
    // parseProjectFile validates + hydrates
    return parseProjectFile(
      typeof envelope === "string" ? envelope : JSON.stringify(envelope),
    );
  } catch (e) {
    console.warn("Failed to load project", id, e);
    return null;
  }
}

export function deleteProject(id: string): void {
  localStorage.removeItem(PROJECT_KEY(id));
  const idx = readIndex();
  idx.projects = idx.projects.filter((p) => p.id !== id);
  if (idx.activeId === id) {
    idx.activeId = idx.projects[0]?.id ?? null;
  }
  writeIndex(idx);
}

export function bootProject(): Project {
  const activeId = getActiveId();
  if (activeId) {
    const p = loadProject(activeId);
    if (p) return p;
  }
  const projects = listProjects();
  for (const meta of projects) {
    const p = loadProject(meta.id);
    if (p) return p;
  }
  return hydrateProject({});
}