import { projectStatusLabels } from "../lib/labels";
import { ProjectFormValues, ProjectStatus } from "../types/domain";
import { Badge, GhostButton, Panel } from "./ui";

interface ProjectEditorPanelProps {
  form: ProjectFormValues;
  mode: "create" | "edit";
  canDelete: boolean;
  onChange: (field: keyof ProjectFormValues, value: string) => void;
  onCreateMode: () => void;
  onSubmit: () => void;
  onDelete: () => void;
}

const statusOptions: ProjectStatus[] = [
  "in_progress",
  "review_pending",
  "complete"
];

export function ProjectEditorPanel({
  form,
  mode,
  canDelete,
  onChange,
  onCreateMode,
  onSubmit,
  onDelete
}: ProjectEditorPanelProps) {
  return (
    <Panel
      title={mode === "create" ? "새 프로젝트" : "프로젝트 편집"}
      subtitle="Project CRUD"
      action={<Badge tone={mode === "create" ? "accent" : "muted"}>{mode}</Badge>}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <Field
            label="프로젝트 이름"
            value={form.name}
            onChange={(value) => onChange("name", value)}
          />
          <Field
            label="클라이언트"
            value={form.client}
            onChange={(value) => onChange("client", value)}
          />
          <Field
            label="카테고리"
            value={form.category}
            onChange={(value) => onChange("category", value)}
          />
          <Field
            label="촬영일"
            type="date"
            value={form.shootDate}
            onChange={(value) => onChange("shootDate", value)}
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-stone-800">상태</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <GhostButton
                key={status}
                active={form.status === status}
                onClick={() => onChange("status", status)}
              >
                {projectStatusLabels[status]}
              </GhostButton>
            ))}
          </div>
        </div>

        <label className="block text-sm text-stone-700">
          <span>메모</span>
          <textarea
            value={form.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            className="mt-2 min-h-[120px] w-full rounded-[24px] border border-stone-200 bg-white px-4 py-3 leading-6"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white"
          >
            {mode === "create" ? "프로젝트 생성" : "변경 저장"}
          </button>
          <button
            type="button"
            onClick={onCreateMode}
            className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
          >
            새 프로젝트 모드
          </button>
          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              프로젝트 삭제
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm text-stone-700">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-[24px] border border-stone-200 bg-white px-4 py-3"
      />
    </label>
  );
}
