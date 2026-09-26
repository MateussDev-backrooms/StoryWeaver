import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/store";
import { useToolStore } from "../../store/useToolStore";
import type {
  Modifiers,
  ToolContext,
  ToolGesture,
  HitTarget,
  ToolIntent,
} from "../../tools/types";
import { PIXELS_PER_UNIT, LANE_PADDING_LEFT } from "../../constants";
import { hitTest } from "../../tools/hitTest";
import { TOOLS, TOOL_ORDER } from "../../tools/registry";
import { useModalStore } from "../../store/useModalStore";

interface Props {
  children: React.ReactNode;
}

const NO_MODS: Modifiers = {
  shift: false,
  ctrl: false,
  alt: false,
  meta: false,
};

export function ToolHost({ children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<ToolGesture | null>(null);
  const startModsRef = useRef<Modifiers | null>(null);

  const activeTool = useToolStore((s) => s.activeTool);

  const [mods, setMods] = useState<Modifiers>(NO_MODS);
  const [gestureActive, setGestureActive] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  // ── keyboard ──────────────────────────────────────────────
  useEffect(() => {
    const isEditingField = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return (
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      );
    };

    const down = (e: KeyboardEvent) => {
      // Alt-alone hijacks focus in Firefox/Vivaldi on Linux.
      if (e.key === "Alt") {
        e.preventDefault();
        e.stopPropagation();
      }
      // Keep modifier state fresh even while typing
      if (
        e.key === "Shift" ||
        e.key === "Control" ||
        e.key === "Alt" ||
        e.key === "Meta"
      ) {
        setMods({
          shift: e.shiftKey,
          ctrl: e.ctrlKey,
          alt: e.altKey,
          meta: e.metaKey,
        });
      }
      if (isEditingField(e.target)) return;

      // Number keys 1..5 → tool switch
      const idx = parseInt(e.key, 10) - 1;
      if (
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        idx >= 0 &&
        idx < TOOL_ORDER.length
      ) {
        useToolStore.getState().setActiveTool(TOOL_ORDER[idx]);
        return;
      }

      const selection = useToolStore.getState().selection;
      if (selection.size === 0) return;

      // Backspace / Delete → delete all selected beats
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        const p = useStore.getState();
        for (const id of selection) {
          const laneId = p.project.lanes.find((l) =>
            l.beats.some((b) => b.id === id),
          )?.id;
          if (laneId) p.deleteBeat(laneId, id);
        }
        useToolStore.getState().clearSelection();
        return;
      }

      // Arrow keys → nudge selection
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const dir = e.key === "ArrowLeft" ? -1 : 1;
        const step = e.shiftKey ? 1 : 0.25;
        const p = useStore.getState();
        const updates: { laneId: string; beatId: string; time: number }[] = [];
        for (const id of selection) {
          const laneId = p.project.lanes.find((l) =>
            l.beats.some((b) => b.id === id),
          )?.id;
          if (!laneId) continue;
          const beat = p.project.lanes
            .find((l) => l.id === laneId)!
            .beats.find((b) => b.id === id)!;
          updates.push({
            laneId,
            beatId: id,
            time: Math.max(0, beat.time + dir * step),
          });
        }
        if (updates.length) p.moveBeats(updates);
      }
    };

    const up = (e: KeyboardEvent) => {
      setMods({
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey,
      });
    };

    window.addEventListener("keydown", down, { capture: true });
    window.addEventListener("keyup", up, { capture: true });
    return () => {
      window.removeEventListener("keydown", down, { capture: true });
      window.removeEventListener("keyup", up, { capture: true });
    };
  }, []);

  const findBeat = (id: string) => {
    for (const lane of useStore.getState().project.lanes) {
      const b = lane.beats.find((c) => c.id === id);
      if (b) return b;
    }
    return undefined;
  };

  const buildContext = (
    e: React.PointerEvent | PointerEvent,
    hit: HitTarget,
    frozen: boolean,
  ): ToolContext => {
    const rect = rootRef.current!.getBoundingClientRect();
    const clientX = (e as any).clientX;
    const clientY = (e as any).clientY;
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    const laneEl = document
      .elementFromPoint(clientX, clientY)
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

    const modifiers: Modifiers =
      frozen && startModsRef.current
        ? startModsRef.current
        : {
            shift: e.shiftKey,
            ctrl: e.ctrlKey,
            alt: e.altKey,
            meta: e.metaKey,
          };

    const p = useStore.getState();

    return {
      hit,
      pointer: {
        clientX,
        clientY,
        canvasX,
        canvasY,
        rootX: rect.left,
        rootY: rect.top,
        laneId,
        time,
      },
      modifiers,
      selection: {
        get ids() {
          return useToolStore.getState().selection;
        },
        set: (ids) => useToolStore.getState().setSelection([...ids]),
        add: (id) => useToolStore.getState().addToSelection(id),
        remove: (id) => useToolStore.getState().removeFromSelection(id),
        toggle: (id) => useToolStore.getState().toggleSelection(id),
        clear: () => useToolStore.getState().clearSelection(),
        has: (id) => useToolStore.getState().selection.has(id),
      },
      actions: {
        addBeat: p.addBeat,
        moveBeats: p.moveBeats,
        deleteBeat: p.deleteBeat,
        addLink: p.addLink,
        deleteLink: p.deleteLink,
        findBeat: (id) => {
          for (const lane of p.project.lanes) {
            const b = lane.beats.find((x) => x.id === id);
            if (b) return b;
          }
          return undefined;
        },
        findLaneOfBeat: (id) =>
          p.project.lanes.find((l) => l.beats.some((b) => b.id === id))?.id,
      },
      setPreview: (v) => useToolStore.getState().setPreview(v),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    // Skip if the user is typing in a beat title input.
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, [contenteditable]")) return;
    const hit = hitTest(e, rootRef.current!, useStore.getState().project);
    startModsRef.current = {
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
      meta: e.metaKey,
      alt: e.altKey,
    };
    setPointer({ x: e.clientX, y: e.clientY });

    const gesture = TOOLS[activeTool].onPointerDown(buildContext(e, hit, true));
    gestureRef.current = gesture ?? null;
    setGestureActive(!!gesture);

    if (gesture) {
      const canvasEl = rootRef.current?.firstElementChild as HTMLElement | null;
      if (canvasEl)
        useToolStore.getState().setFrozenCanvasWidth(canvasEl.offsetWidth);
    }

    rootRef.current!.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    setPointer({ x: e.clientX, y: e.clientY });
    const hit = hitTest(e, rootRef.current!, useStore.getState().project);

    if (gestureRef.current?.onPointerMove) {
      gestureRef.current.onPointerMove(buildContext(e, hit, true));
      return;
    }
    TOOLS[activeTool].onHover?.(buildContext(e, hit, false));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (gestureRef.current?.onPointerUp) {
      const hit = hitTest(e, rootRef.current!, useStore.getState().project);
      gestureRef.current.onPointerUp(buildContext(e, hit, true));
    }
    gestureRef.current = null;
    startModsRef.current = null;
    setGestureActive(false);
    useToolStore.getState().setFrozenCanvasWidth(null);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const hit = hitTest(
      e as any,
      rootRef.current!,
      useStore.getState().project,
    );
    if (hit.kind === "beat") {
      useModalStore.getState().open("edit-beat", {
        laneId: hit.laneId,
        beatId: hit.beat.id,
      });
    }
  };

  const onPointerLeave = () => setPointer(null);

  // ── intent & cursor ───────────────────────────────────────
  // During a gesture, freeze the modifiers used for styling so that
  // releasing Ctrl mid-drag doesn't flip the hover style back.
  const styleMods =
    gestureActive && startModsRef.current ? startModsRef.current : mods;
  const tool = TOOLS[activeTool];
  const intent: ToolIntent = tool.intent?.(styleMods) ?? "neutral";
  const CursorIcon = tool.getCursorIcon?.(styleMods) ?? null;

  return (
    <div
      ref={rootRef}
      data-intent={intent}
      style={{ cursor: tool.cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      onDoubleClick={onDoubleClick}
    >
      {children}

      {pointer && CursorIcon && (
        <div
          className="tool-cursor"
          style={{ left: pointer.x + 14, top: pointer.y + 14 }}
        >
          <CursorIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
