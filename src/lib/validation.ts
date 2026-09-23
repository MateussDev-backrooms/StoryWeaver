// lib/validation.ts
import type { Project, Beat, Lane } from '../types/types';

export type IssueRule = 'time-paradox' | 'orphan';
export type Severity = 'error' | 'warn';

export interface Issue {
  id: string;
  rule: IssueRule;
  severity: Severity;
  message: string;
  beatIds: string[];
  laneIds: string[];
}

interface Located { beat: Beat; lane: Lane }

function locateBeat(project: Project, id: string): Located | null {
  for (const lane of project.lanes) {
    const beat = lane.beats.find((b) => b.id === id);
    if (beat) return { beat, lane };
  }
  return null;
}

export function validateProject(project: Project): Issue[] {
  const issues: Issue[] = [];

  // ── Rule: time paradox ────────────────────────────────────
  // A link says "this causes that", so the cause must not be
  // positioned after the effect on the time axis.
  for (const link of project.links) {
    const from = locateBeat(project, link.from);
    const to   = locateBeat(project, link.to);
    if (!from || !to) continue;   // dangling link — handle later if you care

    if (from.beat.time > to.beat.time) {
      issues.push({
        id: `paradox:${link.id}`,
        rule: 'time-paradox',
        severity: 'error',
        message:
          `Beat "${to.beat.title}" of "${to.lane.name}" cannot happen before ` +
          `Beat "${from.beat.title}" of "${from.lane.name}"`,
        beatIds: [link.from, link.to],
        laneIds: [from.lane.id, to.lane.id],
      });
    }
  }

  // ── Rule: orphan beats ────────────────────────────────────
  const connected = new Set<string>();
  for (const link of project.links) {
    connected.add(link.from);
    connected.add(link.to);
  }

  for (const lane of project.lanes) {
    for (const beat of lane.beats) {
      if (!connected.has(beat.id)) {
        issues.push({
          id: `orphan:${beat.id}`,
          rule: 'orphan',
          severity: 'warn',
          message: `Beat "${beat.title}" of "${lane.name}" has no connections`,
          beatIds: [beat.id],
          laneIds: [lane.id],
        });
      }
    }
  }

  // Errors first, then warnings — stable order matters for the panel
  issues.sort((a, b) =>
    a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1
  );

  return issues;
}