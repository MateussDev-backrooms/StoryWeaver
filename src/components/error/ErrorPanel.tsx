// components/errors/ErrorPanel.tsx
import { useEffect, useState } from 'react';
import type { Issue } from '../../lib/validation';

interface Props {
  issues: Issue[];
}

export function ErrorPanel({ issues }: Props) {
  const [index, setIndex] = useState(0);

  // If issues shrink (you fixed something), clamp the index.
  useEffect(() => {
    if (index >= issues.length) setIndex(Math.max(0, issues.length - 1));
  }, [issues.length, index]);

  if (issues.length === 0) return null;

  const issue = issues[index];
  const isError = issue.severity === 'error';

  const prev = () => setIndex((i) => (i - 1 + issues.length) % issues.length);
  const next = () => setIndex((i) => (i + 1) % issues.length);

  return (
    <div className="error-panel panel fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex flex-row items-center gap-3">
      <span className={`error-dot ${isError ? 'error-dot-error' : 'error-dot-warn'}`} />

      <span className="text-sm">{issue.message}</span>

      {issues.length > 1 && (
        <div className="flex flex-row items-center gap-1 ml-2">
          <button className="btn btn-sm" onClick={prev} aria-label="Previous issue">‹</button>
          <span className="font-mono text-xs opacity-70">
            {index + 1}/{issues.length}
          </span>
          <button className="btn btn-sm" onClick={next} aria-label="Next issue">›</button>
        </div>
      )}
    </div>
  );
}