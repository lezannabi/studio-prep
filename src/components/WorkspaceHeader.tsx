import { projectStatusLabels } from "../lib/labels";
import { Project } from "../types/domain";
import { Badge } from "./ui";

export function WorkspaceHeader({
  project,
  nextTasks,
  onResetSession
}: {
  project?: Project;
  nextTasks: string[];
  onResetSession: () => void;
}) {
  return (
    <header className="mb-4 grid gap-4 rounded-[30px] border border-stone-200/70 bg-white/85 p-5 xl:grid-cols-[minmax(0,1fr)_290px] xl:p-6">
      <div className="rounded-[24px] bg-stone-50/80 p-4 xl:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Current Project</p>
          <Badge tone="muted">저장됨</Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-stone-950 xl:text-4xl">
            {project?.name ?? "프로젝트를 선택하세요"}
          </h1>
          {project ? <Badge tone="accent">{projectStatusLabels[project.status]}</Badge> : null}
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
          {project?.notes ??
            "왼쪽에서 프로젝트를 선택하면 중앙 이미지와 오른쪽 작업 단계가 연결됩니다."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-stone-500">
          <span>현재 프로젝트</span>
          <span>·</span>
          <span>{project?.client ?? "Client 미정"}</span>
          <span>·</span>
          <span>{project?.shootDate ?? "Date 미정"}</span>
        </div>
      </div>

      <div className="rounded-[24px] border border-stone-200/70 bg-stone-100/90 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">다음 단계</p>
            <h2 className="mt-1 text-base font-semibold text-stone-900">오늘 할 일</h2>
          </div>
          <button
            type="button"
            onClick={onResetSession}
            className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700"
          >
            세션 초기화
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {nextTasks.map((task) => (
            <div
              key={task}
              className="rounded-2xl border border-white/70 bg-white/85 px-3 py-2.5 text-sm text-stone-700"
            >
              {task}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
