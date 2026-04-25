import { projectStatusLabels } from "../lib/labels";
import { Project } from "../types/domain";

export function ProjectListItem({
  project,
  active,
  onSelect
}: {
  project: Project;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
        active
          ? "border-teal-500/70 bg-white text-stone-900 shadow-sm"
          : "border-transparent bg-transparent text-stone-400 hover:border-stone-200/70 hover:bg-white/70"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`truncate text-sm font-medium ${active ? "text-stone-900" : "text-stone-600"}`}>
            {project.name}
          </p>
          <p className="mt-1 truncate text-xs text-stone-400">
            {project.client || "Client 미정"} · {project.category || "Category 미정"}
          </p>
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] ${active ? "bg-teal-50 text-teal-700" : "bg-white/80 text-stone-400"}`}>
          {projectStatusLabels[project.status]}
        </span>
      </div>
    </button>
  );
}
