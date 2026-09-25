// components/timeline/Toolbar.tsx
import { TOOLS, TOOL_ORDER } from '../../tools/registry';
import { useToolStore } from '../../store/useToolStore';

export function Toolbar() {
  const active = useToolStore((s) => s.activeTool);
  const setActive = useToolStore((s) => s.setActiveTool);

  return (
    <div className="flex flex-row items-center">
      {TOOL_ORDER.map((id) => {
        const tool = TOOLS[id];
        const Icon = tool.icon;
        return (
          <button
            key={id}
            className={`btn btn-sm flex flex-row items-center gap-1 ${active === id ? 'btn-tab-selected' : ''}`}
            onClick={() => setActive(id)}
            title={tool.label}
          >
            <Icon className="text-base" />
          </button>
        );
      })}
    </div>
  );
}