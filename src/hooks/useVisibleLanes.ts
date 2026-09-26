import { useStore } from '../store/store';
import { useToolStore } from '../store/useToolStore';

export function useVisibleLanes() {
  const lanes = useStore((s) => s.project.lanes);
  const hidden = useToolStore((s) => s.hiddenLaneIds);
  return hidden.size === 0 ? lanes : lanes.filter((l) => !hidden.has(l.id));
}