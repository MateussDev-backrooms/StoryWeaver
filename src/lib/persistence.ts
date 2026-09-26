import { BEAT_DEFAULT_DURATION, STORYWEAVER_VERSION } from "../constants";
import type { Beat, Lane, Marker, Project, Section } from "../types/types";
import { END_SENTINEL, START_SENTINEL } from "./sections";

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

  return hydrateProject(file.project);
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
    // TODO: Do Base64 encoding to save on space in localStorage
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
  a.download = `${slugify(project.name)}.storyweaver.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "untitled"
  );
}

export const CURRENT_SCHEMA = STORYWEAVER_VERSION;

const BEAT_DEFAULTS: Beat = {
  id: "",
  title: "Untitled",
  content: "",
  time: 0,
  duration: BEAT_DEFAULT_DURATION,
};

const LANE_DEFAULTS: Omit<Lane, "beats"> = {
  id: "",
  name: "Unnamed",
  color: "#94a3b8",
  group: "Neutral",
};

const PROJECT_DEFAULTS: Omit<
  Project,
  "lanes" | "links" | "id" | "markers" | "sections"
> = {
  schemaVersion: CURRENT_SCHEMA,
  name: "Untitled",
  color: "#22d3ee",
  icon: "book",
  createdAt: new Date().toISOString(),
};

export function emptyProject(overrides: Partial<Project> = {}): Project {
  return {
    ...PROJECT_DEFAULTS,
    ...overrides,
    id: overrides.id ?? uid(),
    lanes: [],
    links: [],
    markers: [],
    sections: [],
  };
}

const MARKER_DEFAULTS: Omit<Marker, "id" | "time"> = {
  name: "Marker",
  color: "#f97316",
  description: "",
};

const SECTION_DEFAULTS: Omit<Section, "id" | "startMarkerId" | "endMarkerId"> =
  {
    name: "New Section",
    color: "#7c3aed",
  };

export function hydrateProject(raw: unknown): Project {
  const r = (raw ?? {}) as Partial<Project>;
  const project: Project = {
    ...PROJECT_DEFAULTS,
    ...r,
    id: r.id ?? uid(),
    lanes: [],
    links: Array.isArray(r.links) ? r.links : [],
    markers: Array.isArray(r.markers) ? r.markers.map(hydrateMarker) : [],
    sections: Array.isArray(r.sections) ? r.sections.map(hydrateSection) : [],
  };

  if (Array.isArray(r.lanes)) {
    project.lanes = r.lanes.map(hydrateLane);
  }

  const markerIds = new Set(project.markers.map((m) => m.id));
  const isValidBoundary = (id: string) =>
    id === START_SENTINEL || id === END_SENTINEL || markerIds.has(id);

  project.sections = project.sections.filter(
    (s) => isValidBoundary(s.startMarkerId) && isValidBoundary(s.endMarkerId),
  );

  //! FOR MIGRATIONS - check the version and just change the major changes here

  project.schemaVersion = CURRENT_SCHEMA;
  return project;
}

function hydrateLane(raw: unknown): Lane {
  const r = (raw ?? {}) as Partial<Lane>;
  return {
    ...LANE_DEFAULTS,
    ...r,
    id: r.id ?? uid(),
    beats: Array.isArray(r.beats) ? r.beats.map(hydrateBeat) : [],
  };
}

function hydrateBeat(raw: unknown): Beat {
  const r = (raw ?? {}) as Partial<Beat>;
  return {
    ...BEAT_DEFAULTS,
    ...r,
    id: r.id ?? uid(),
  };
}

function hydrateMarker(raw: unknown): Marker {
  const r = (raw ?? {}) as Partial<Marker>;
  return {
    ...MARKER_DEFAULTS,
    ...r,
    id: r.id ?? uid(),
    time: typeof r.time === "number" ? r.time : 0,
  };
}

function hydrateSection(raw: unknown): Section {
  const r = (raw ?? {}) as Partial<Section>;
  return {
    ...SECTION_DEFAULTS,
    ...r,
    id: r.id ?? uid(),
    startMarkerId: r.startMarkerId ?? "",
    endMarkerId: r.endMarkerId ?? "",
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
