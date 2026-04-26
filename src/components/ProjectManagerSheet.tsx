import { projectStatusLabels } from "../lib/labels";
import { ProjectFormValues, ProjectImage, ProjectStatus } from "../types/domain";

const statusOptions: ProjectStatus[] = ["in_progress", "review_pending", "complete"];

export function ProjectManagerSheet({
  open,
  mode,
  form,
  uploadFiles,
  projectImages,
  folderSyncError,
  isTauriRuntime,
  canDelete,
  onToggle,
  onChange,
  onUploadFilesChange,
  onRemoveImage,
  onSyncFolder,
  onSubmit,
  onDelete,
  onCreateMode
}: {
  open: boolean;
  mode: "create" | "edit";
  form: ProjectFormValues;
  uploadFiles: File[];
  projectImages: ProjectImage[];
  folderSyncError: string;
  isTauriRuntime: boolean;
  canDelete: boolean;
  onToggle: () => void;
  onChange: (field: keyof ProjectFormValues, value: string) => void;
  onUploadFilesChange: (files: File[]) => void;
  onRemoveImage: (imageId: string) => void;
  onSyncFolder: () => void;
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
          <Field
            label="Source Folder"
            value={form.sourceFolderPath}
            onChange={(value) => onChange("sourceFolderPath", value)}
          />
          <p className="-mt-1 text-xs text-stone-500">
            {isTauriRuntime
              ? "Tauri 앱에서는 실제 로컬 폴더 경로를 저장하고 동기화할 수 있습니다."
              : "브라우저 모드에서는 이 경로를 저장만 하고 실제 폴더 동기화는 하지 않습니다."}
          </p>
          {mode === "create" || mode === "edit" ? (
            <label className="block text-sm text-stone-700">
              <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                {mode === "create" ? "Images" : "이미지 추가"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  onUploadFilesChange(Array.from(event.target.files ?? []))
                }
                className="mt-2 block w-full rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-3 py-3 text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-3 file:py-2 file:text-sm file:text-white"
              />
              <p className="mt-2 text-xs text-stone-500">
                {mode === "create"
                  ? "프로젝트 생성 시 선택한 이미지가 바로 연결됩니다."
                  : "파일을 선택한 뒤 저장하면 현재 프로젝트에 이미지가 추가됩니다."}
              </p>
              {uploadFiles.length > 0 ? (
                <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                    Selected
                  </p>
                  <p className="mt-1 text-sm text-stone-700">
                    {uploadFiles.length}개 파일 선택됨
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    {uploadFiles.slice(0, 3).map((file) => file.name).join(", ")}
                    {uploadFiles.length > 3 ? " ..." : ""}
                  </p>
                </div>
              ) : null}
            </label>
          ) : null}
          {mode === "edit" && isTauriRuntime ? (
            <button
              type="button"
              onClick={onSyncFolder}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-700"
            >
              폴더 동기화
            </button>
          ) : null}
          {folderSyncError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
              {folderSyncError}
            </div>
          ) : null}
          {mode === "edit" ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                현재 이미지
              </p>
              {projectImages.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {projectImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {image.name}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {image.isCover ? "대표컷" : image.shotLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveImage(image.id)}
                        className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-stone-600">연결된 이미지가 없습니다.</p>
              )}
            </div>
          ) : null}
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
