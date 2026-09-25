// components/timeline/ToolHost.tsx
import { useRef } from "react";
import { useStore } from "../../store/store";
import { useToolStore } from "../../store/useToolStore";
import type {
  Modifiers,
  PointerInfo,
  ToolContext,
  ToolGesture,
  HitTarget,
} from "../../tools/types";
import { PIXELS_PER_UNIT, LANE_PADDING_LEFT } from "../../constants";
import { hitTest } from "../../tools/hitTest";
import { TOOLS } from "../../tools/registry";

interface Props {
  children: React.ReactNode;
}

export function ToolHost({ children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<ToolGesture | null>(null);
  const startHitRef = useRef<HitTarget | null>(null);
  const startModsRef = useRef<Modifiers | null>(null);
  const selectionController = {
    get ids() {
      return useToolStore.getState().selection;
    },
    set: (ids: Iterable<string>) =>
      useToolStore.getState().setSelection([...ids]),
    add: (id: string) => useToolStore.getState().addToSelection(id),
    remove: (id: string) => useToolStore.getState().removeFromSelection(id),
    toggle: (id: string) => useToolStore.getState().toggleSelection(id),
    clear: () => useToolStore.getState().clearSelection(),
    has: (id: string) => useToolStore.getState().selection.has(id),
  };
  const project = useStore.getState;
  const activeTool = useToolStore((s) => s.activeTool);

  const findBeat = (id: string) => {
    const project = useStore.getState().project;

    for (const lane of project.lanes) {
      const beat = lane.beats.find((candidate) => candidate.id === id);
      if (beat) return beat;
    }

    return undefined;
  };

  const buildContext = (
    e: React.PointerEvent | PointerEvent,
    hit: HitTarget,
  ): ToolContext => {
    const rect = rootRef.current!.getBoundingClientRect();
    const canvasX = (e as any).clientX - rect.left;
    const canvasY = (e as any).clientY - rect.top;

    // Lane + time under cursor (may differ from hit.laneId when moving)
    const laneEl = document
      .elementFromPoint((e as any).clientX, (e as any).clientY)
      ?.closest("[data-lane-id]") as HTMLElement | null;
    const laneId = laneEl?.dataset.laneId ?? null;
    const time = laneEl
      ? Math.max(
          0,
          (canvasX -
            (laneEl.getBoundingClientRect().left - rect.left) -
            LANE_PADDING_LEFT) /
            PIXELS_PER_UNIT,
        )
      : null;

    const p = project();

    return {
      hit,
      pointer: {
        clientX: (e as any).clientX,
        clientY: (e as any).clientY,
        canvasX,
        canvasY,
        laneId,
        time,
      },
      modifiers: startModsRef.current!,
      selection: selectionController,
      actions: {
        addBeat: p.addBeat,
        moveBeats: p.moveBeats,
        deleteBeat: p.deleteBeat,
        addLink: p.addLink,
        deleteLink: p.deleteLink,

        findBeat: (id) => {
          for (const lane of p.project.lanes) {
            const beat = lane.beats.find((b) => b.id === id);
            if (beat) return beat;
          }
          return undefined;
        },

        findLaneOfBeat: (id) => {
          return p.project.lanes.find((lane) =>
            lane.beats.some((beat) => beat.id === id),
          )?.id;
        },
      },
      setPreview: (preview) => useToolStore.getState().setPreview(preview),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    const hit = hitTest(e, rootRef.current!, findBeat);

    const modifiers: Modifiers = {
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
      meta: e.metaKey,
      alt: e.altKey,
    };
    startHitRef.current = hit;
    startModsRef.current = modifiers;

    const tool = TOOLS[activeTool];
    const gesture = tool.onPointerDown(buildContext(e, hit));
    gestureRef.current = gesture ?? null;

    rootRef.current!.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!gestureRef.current?.onPointerMove) return;
    const hit = hitTest(e, rootRef.current!, findBeat);
    gestureRef.current.onPointerMove(buildContext(e, hit));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (gestureRef.current?.onPointerUp) {
      const hit = hitTest(e, rootRef.current!, findBeat);
      gestureRef.current.onPointerUp(buildContext(e, hit));
    }
    gestureRef.current = null;
    startHitRef.current = null;
    startModsRef.current = null;
  };

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </div>
  );
}
