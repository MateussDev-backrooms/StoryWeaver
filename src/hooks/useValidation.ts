// hooks/useValidation.ts
import { useMemo } from 'react';
import { useStore } from '../store';
import { validateProject, type Issue } from '../lib/validation';

export interface ValidationResult {
  issues: Issue[];
  beatIssueIds: Set<string>;   // for O(1) "does this beat have a problem?"
  laneIssueIds: Set<string>;
}

export function useValidation(): ValidationResult {
  const project = useStore((s) => s.project);

  return useMemo(() => {
    const issues = validateProject(project);
    const beatIssueIds = new Set<string>();
    const laneIssueIds = new Set<string>();

    for (const issue of issues) {
      issue.beatIds.forEach((id) => beatIssueIds.add(id));
      issue.laneIds.forEach((id) => laneIssueIds.add(id));
    }

    return { issues, beatIssueIds, laneIssueIds };
  }, [project]);
}