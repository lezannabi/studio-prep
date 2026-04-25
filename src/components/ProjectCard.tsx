import { Project } from "../types/domain";
import { projectStatusLabels } from "../lib/labels";
import { Badge } from "./ui";

interface ProjectCardProps {
  project: Project;
  imageCount: number;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onEdit: () => void;
}

export function ProjectCard({
  project,
  imageCount,
  selected,
  onSelect,
  onOpen,
  onEdit
}: ProjectCardProps) {
  return (
    <article
      className={`rounded-[28px] border p-5 transition ${
        selected
          ? "border-teal-600 bg-teal-950/[0.03] shadow-[0_18px_50px_rgba(0,93,93,0.12)]"
          : "border-stone-200 bg-white/85"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone={project.status === "complete" ? "success" : "accent"}>
            {projectStatusLabels[project.status]}
          </Badge>
          <h3 className="mt-3 text-xl font-semibold text-stone-900">{project.name}</h3>
          <p className="mt-1 text-sm text-stone-500">
            {project.client} · {project.category}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-700"
          >
            선택
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-stone-200 px-3 py-2 text-sm text-stone-700"
          >
            편집
          </button>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">{project.notes}</p>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-stone-100/80 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Date</p>
          <p className="mt-2 font-medium text-stone-800">{project.shootDate}</p>
        </div>
        <div className="rounded-2xl bg-stone-100/80 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Images</p>
          <p className="mt-2 font-medium text-stone-800">{imageCount}</p>
        </div>
        <div className="rounded-2xl bg-stone-100/80 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Drafts</p>
          <p className="mt-2 font-medium text-stone-800">{project.drafts.length}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-5 w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white"
      >
        프로젝트 상세 열기
      </button>
    </article>
  );
}
