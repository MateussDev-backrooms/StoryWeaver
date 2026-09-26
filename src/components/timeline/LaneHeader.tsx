// components/timeline/LaneHeader.tsx
import { useState } from 'react';
import { RiDraggable } from 'react-icons/ri';
import { LANE_HEIGHT } from '../../constants';
import { useStore } from '../../store/store';
import { useModalStore } from '../../store/useModalStore';
import { useVisibleLanes } from '../../hooks/useVisibleLanes';
import type { Lane } from '../../types/types';

export function LaneHeader({ lane }: { lane: Lane }) {
  const openModal = useModalStore((s) => s.open);
  const reorderLane = useStore((s) => s.reorderLane);
  const visible = useVisibleLanes();
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      // Find the lane header under the cursor.
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const headerEl = el?.closest<HTMLElement>('[data-lane-header-id]');
      const targetId = headerEl?.dataset.laneHeaderId ?? null;

      if (!targetId || targetId === lane.id) return;

      // Determine top-half vs bottom-half to decide before/after.
      const rect = headerEl!.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dropAfter = ev.clientY > midY;

      const targetIdx = visible.findIndex((l) => l.id === targetId);
      if (targetIdx < 0) return;

      const insertBeforeId = dropAfter
        ? visible[targetIdx + 1]?.id ?? null
        : targetId;

      // No-op if we'd insert right where we already are.
      if (insertBeforeId === lane.id) return;

      reorderLane(lane.id, insertBeforeId);
    };

    const onUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      className={[
        'flex items-center gap-2 px-3 shading',
        dragging ? 'lane-dragging' : '',
      ].join(' ')}
      style={{ height: LANE_HEIGHT, backgroundColor: lane.color }}
      data-lane-header-id={lane.id}
      onDoubleClick={() =>
        openModal('create-character', {
          laneEdit: lane,
          onConfirm: (draft) => {
            useStore.getState().updateLane(lane.id, {
              name: draft.name,
              color: draft.color,
              group: draft.group,
            });
          },
        })
      }
    >
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: lane.color }}
      />
      <span className="truncate text-sm font-medium">{lane.name}</span>
      <span className="ml-auto font-mono text-[10px] text-neutral-600">
        {lane.beats.length}
      </span>
      <button
        className="lane-drag-handle"
        onPointerDown={onPointerDown}
        onDoubleClick={(e) => e.stopPropagation()}
        title="Reorder lane"
      >
        <RiDraggable />
      </button>
    </div>
  );
}