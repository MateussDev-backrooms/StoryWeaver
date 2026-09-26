import type { Project, Section } from "../types/types";

export const START_SENTINEL = "__START__";
export const END_SENTINEL = "__END__";

export interface BoundaryInfo {
  id: string;
  name: string;
  color: string;
  time: number;
  isSentinel: boolean;
}

export function getProjectEndTime(project: Project): number {
  let max = 0;
  for (const lane of project.lanes) {
    for (const beat of lane.beats) {
      const end = beat.time + (beat.duration ?? 1);
      if (end > max) max = end;
    }
  }
  for (const m of project.markers) {
    if (m.time > max) max = m.time;
  }
  return max;
}

export function resolveBoundary(
  id: string,
  project: Project,
): BoundaryInfo | null {
  if (id === START_SENTINEL) {
    return {
      id,
      name: "Story Start",
      color: "#22c55e",
      time: 0,
      isSentinel: true,
    };
  }
  if (id === END_SENTINEL) {
    return {
      id,
      name: "Story End",
      color: "#ef4444",
      time: getProjectEndTime(project),
      isSentinel: true,
    };
  }
  const marker = project.markers.find((m) => m.id === id);
  if (!marker) return null;
  return {
    id,
    name: marker.name,
    color: marker.color,
    time: marker.time,
    isSentinel: false,
  };
}

export interface SectionRange {
  start: number;
  end: number;
  startInfo: BoundaryInfo;
  endInfo: BoundaryInfo;
}

export function getSectionRange(
  section: Pick<Section, "startMarkerId" | "endMarkerId">,
  project: Project,
): SectionRange | null {
  const a = resolveBoundary(section.startMarkerId, project);
  const b = resolveBoundary(section.endMarkerId, project);
  if (!a || !b) return null;
  return {
    start: Math.min(a.time, b.time),
    end: Math.max(a.time, b.time),
    startInfo: a,
    endInfo: b,
  };
}