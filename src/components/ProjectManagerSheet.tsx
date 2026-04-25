import { projectStatusLabels } from "../lib/labels";
import { ProjectFormValues, ProjectStatus } from "../types/domain";

const statusOptions: ProjectStatus[] = ["in_progress", "review_pending", "complete"];

export function ProjectManagerSheet({
  open,
  mode,
  form,
  canDelete,
  onToggle,
  onChange,
  onSubmit,
  onDelete,
  onCreateMode
}: {
  open: boolean;
  mode: "create" | "edit";
  form: ProjectFormValues;
  canDelete: boolean;
  onToggle: () => void;
  onChange: (field: keyof ProjectFormValues, value: string) => void;
  onSubmit: () => void;
  onDelete: () => void;
  onCreateMode: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-stone-200/80 bg-white/80">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Project</p>
          <p className="mt-1 text-sm font-medium text-stone-900">
            {mode === "create" ? "새 프로젝트 만들기" : "선택 프로젝트 편집"}
          </p>
        </div>
        <span className="text-sm text-stone-500">{open ? "닫기" : "열기"}</span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-stone-200/80 px-4 py-4">
          <Field label="이름" value={form.name} onChange={(value) => onChange("name", value)} />
          <Field label="클라이언트" value={form.client} onChange={(value) => onChange("client", value)} />
          <Field label="카테고리" value={form.category} onChange={(value) => onChange("category", value)} />
          <Field
            label="촬영일"
            type="date"
            value={form.shootDate}
            onChange={(value) => onChange("shootDate", value)}
          />
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stone-500">Status</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onChange("status", status)}
                  className={`rounded-full border px-3 py-2 text-xs ${
                    form.status === status
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  {projectStatusLabels[status]}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm text-stone-700">
            <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => onChange("notes", event.target.value)}
              className="mt-2 min-h-[96px] w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-2xl bg-stone-900 px-4 py-2.5 text-sm text-white"
            >
              {mode === "create" ? "생성" : "저장"}
            </button>
            <button
              type="button"
              onClick={onCreateMode}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700"
            >
              새 프로젝트 모드
            </button>
            {canDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700"
              >
                삭제
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm"
      />
    </label>
  );
}
