import { useState } from "react";
import { ImageThumbnail } from "../components/ImageThumbnail";
import { ProjectListItem } from "../components/ProjectListItem";
import { ProjectManagerSheet } from "../components/ProjectManagerSheet";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import {
  channelLabels,
  imageStatusLabels,
  imageTagLabels,
  lengthLabels,
  toneLabels
} from "../lib/labels";
import {
  AppView,
  ExportPreset,
  ImageStatus,
  Project,
  ProjectFormValues,
  ProjectImage,
  StudioPrepData
} from "../types/domain";
import { Badge, GhostButton, Panel } from "../components/ui";

const stageOrder: AppView[] = ["project", "text", "review", "dashboard"];
const stageLabels: Record<AppView, string> = {
  project: "이미지 정리",
  text: "텍스트 작성",
  review: "검수",
  dashboard: "내보내기",
  smartstore: "스마트스토어"
};

const imageStatusOptions: ImageStatus[] = [
  "unreviewed",
  "candidate",
  "selected",
  "excluded",
  "exported"
];

const editTools = ["크롭", "회전", "밝기", "대비", "채도", "자동 보정"];

interface WorkspaceScreenProps {
  activeView: AppView;
  data: StudioPrepData;
  project?: Project;
  projectImages: ProjectImage[];
  selectedImage?: ProjectImage;
  selectedImageId: string;
  projectForm: ProjectFormValues;
  projectEditorMode: "create" | "edit";
  presets: ExportPreset[];
  onChangeView: (view: AppView) => void;
  onSelectProject: (projectId: string) => void;
  onSelectImage: (imageId: string) => void;
  onSetImageStatus: (imageId: string, status: ImageStatus) => void;
  onSetCover: (imageId: string) => void;
  onSelectDraft: (draftId: string) => void;
  onUpdateTextEnum: (field: "channel" | "tone" | "length", value: string) => void;
  onUpdateTextField: (
    field: "mustInclude" | "preferred" | "forbidden" | "reference",
    value: string
  ) => void;
  onUpdateFinalText: (value: string) => void;
  onApplyRewritePreset: (
    mode: "shorter" | "calmer" | "descriptive" | "preserve"
  ) => void;
  onToggleChecklist: (itemId: string) => void;
  onTogglePreset: (presetId: ExportPreset["id"]) => void;
  onResetSession: () => void;
  onProjectFormChange: (field: keyof ProjectFormValues, value: string) => void;
  onCreateProject: () => void;
  onUpdateProject: () => void;
  onDeleteProject: () => void;
  onStartCreateProject: () => void;
  onEditProject: (projectId: string) => void;
}

export function WorkspaceScreen({
  activeView,
  data,
  project,
  projectImages,
  selectedImage,
  selectedImageId,
  projectForm,
  projectEditorMode,
  presets,
  onChangeView,
  onSelectProject,
  onSelectImage,
  onSetImageStatus,
  onSetCover,
  onSelectDraft,
  onUpdateTextEnum,
  onUpdateTextField,
  onUpdateFinalText,
  onApplyRewritePreset,
  onToggleChecklist,
  onTogglePreset,
  onResetSession,
  onProjectFormChange,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onStartCreateProject,
  onEditProject
}: WorkspaceScreenProps) {
  const [projectSheetOpen, setProjectSheetOpen] = useState(false);
  const nextTasks = buildNextTasks(project, projectImages, presets);

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <WorkspaceHeader
        project={project}
        nextTasks={nextTasks}
        onResetSession={onResetSession}
      />

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_380px]">
        <aside className="space-y-4">
          <Panel title="프로젝트" subtitle="탐색" className="p-0">
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={onStartCreateProject}
                className="mb-3 w-full rounded-2xl border border-stone-200/80 bg-stone-50 px-4 py-3 text-sm text-stone-600"
              >
                새 프로젝트
              </button>
              <div className="space-y-1.5">
                {data.projects.map((item) => (
                  <ProjectListItem
                    key={item.id}
                    project={item}
                    active={item.id === project?.id}
                    onSelect={() => {
                      onSelectProject(item.id);
                      onEditProject(item.id);
                    }}
                  />
                ))}
              </div>
            </div>
          </Panel>

          <ProjectManagerSheet
            open={projectSheetOpen}
            mode={projectEditorMode}
            form={projectForm}
            canDelete={projectEditorMode === "edit"}
            onToggle={() => setProjectSheetOpen((current) => !current)}
            onChange={onProjectFormChange}
            onSubmit={projectEditorMode === "create" ? onCreateProject : onUpdateProject}
            onDelete={onDeleteProject}
            onCreateMode={onStartCreateProject}
          />

          <Panel title="이미지 목록" subtitle="썸네일" className="p-0">
            <div className="max-h-[56vh] space-y-2 overflow-auto px-4 pb-4">
              {projectImages.length > 0 ? (
                projectImages.map((image) => (
                  <ImageThumbnail
                    key={image.id}
                    image={image}
                    active={image.id === selectedImageId}
                    onClick={() => onSelectImage(image.id)}
                  />
                ))
              ) : (
                <div className="rounded-2xl bg-stone-100/80 px-4 py-4 text-sm text-stone-600">
                  아직 연결된 이미지가 없습니다.
                </div>
              )}
            </div>
          </Panel>
        </aside>

        <section className="space-y-4">
          <div className="rounded-[30px] border border-stone-200/70 bg-white/70 p-4 xl:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                  Current Focus
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-stone-950 xl:text-3xl">
                  {selectedImage ? selectedImage.name : "현재 선택 이미지"}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {project ? <Badge tone="default">{project.name}</Badge> : null}
                {selectedImage ? (
                  <Badge tone="success">{imageStatusLabels[selectedImage.status]}</Badge>
                ) : null}
              </div>
            </div>
            {selectedImage ? (
              <>
                <div
                  className="relative min-h-[680px] rounded-[32px] border border-stone-200/50 p-7 text-white shadow-inner"
                  style={{ background: selectedImage.background }}
                >
                  <div className="absolute inset-x-0 top-0 h-36 rounded-t-[32px] bg-gradient-to-b from-black/18 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/70">
                          Large Preview
                        </p>
                        <h2 className="mt-2 text-4xl font-semibold tracking-[-0.03em] xl:text-5xl">
                          {selectedImage.shotLabel}
                        </h2>
                        <p className="mt-2 text-sm text-white/80">{selectedImage.name}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="success">
                          {imageStatusLabels[selectedImage.status]}
                        </Badge>
                        {selectedImage.isCover ? (
                          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-amber-700">
                            ★ 대표컷
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {selectedImage.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/16 px-2.5 py-1 text-xs text-white/82 backdrop-blur-sm"
                          >
                            {imageTagLabels[tag]}
                          </span>
                        ))}
                      </div>
                      <div className="max-w-xl rounded-[24px] bg-black/18 p-4 backdrop-blur-sm">
                        <p className="text-sm leading-6 text-white/88">
                          {selectedImage.note}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-[24px] border border-stone-200/70 bg-stone-50/80 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                      Selection Info
                    </p>
                    <p className="mt-2 text-sm text-stone-700">
                      {project?.name} 안에서 현재 컷을 중심으로 이미지 정리, 텍스트,
                      검수, 내보내기를 이어서 진행합니다.
                    </p>
                  </div>
                  <div className="text-xs text-stone-500">
                    {projectImages.length} images · {project?.drafts.length ?? 0} drafts
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[620px] items-center justify-center rounded-[30px] border border-dashed border-stone-300 bg-stone-50 text-center">
                <div>
                  <p className="text-base font-medium text-stone-900">
                    이미지를 선택하세요
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    왼쪽 썸네일 목록에서 컷을 선택하면 이 영역이 작업 중심 화면으로
                    바뀝니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside>
          <div className="rounded-[30px] border border-stone-200/70 bg-white/82 p-4 xl:p-5">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Current Step</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {stageOrder.map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => onChangeView(view)}
                    className={`rounded-2xl px-4 py-3 text-sm transition ${
                      activeView === view
                        ? "bg-stone-950 text-white shadow-[0_18px_40px_rgba(28,25,23,0.18)]"
                        : "border border-stone-200 bg-white text-stone-500"
                    }`}
                  >
                    {stageLabels[view]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              {activeView === "project" ? (
                <ImageOrganizeStage
                  image={selectedImage}
                  onSetImageStatus={onSetImageStatus}
                  onSetCover={onSetCover}
                />
              ) : null}

              {activeView === "text" && project ? (
                <TextStage
                  project={project}
                  onSelectDraft={onSelectDraft}
                  onUpdateTextEnum={onUpdateTextEnum}
                  onUpdateTextField={onUpdateTextField}
                  onUpdateFinalText={onUpdateFinalText}
                  onApplyRewritePreset={onApplyRewritePreset}
                />
              ) : null}

              {activeView === "review" && project ? (
                <ReviewStage
                  project={project}
                  images={projectImages}
                  onToggleChecklist={onToggleChecklist}
                />
              ) : null}

              {activeView === "dashboard" && project ? (
                <ExportStage
                  project={project}
                  presets={presets}
                  onTogglePreset={onTogglePreset}
                />
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ImageOrganizeStage({
  image,
  onSetImageStatus,
  onSetCover
}: {
  image?: ProjectImage;
  onSetImageStatus: (imageId: string, status: ImageStatus) => void;
  onSetCover: (imageId: string) => void;
}) {
  return (
    <Panel title="이미지 정리" subtitle="Step 1" className="border-0 bg-transparent p-0 shadow-none">
      {image ? (
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-stone-800">상태</p>
            <div className="flex flex-wrap gap-2">
              {imageStatusOptions.map((status) => (
                <GhostButton
                  key={status}
                  active={image.status === status}
                  onClick={() => onSetImageStatus(image.id, status)}
                >
                  {imageStatusLabels[status]}
                </GhostButton>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-stone-800">대표컷</p>
            <button
              type="button"
              onClick={() => onSetCover(image.id)}
              className={`rounded-2xl px-4 py-3 text-sm ${
                image.isCover
                  ? "bg-amber-50 text-amber-700"
                  : "border border-stone-200 bg-white text-stone-700"
              }`}
            >
              {image.isCover ? "★ 대표컷으로 지정됨" : "대표컷으로 지정"}
            </button>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-stone-800">기본 보정</p>
            <div className="grid grid-cols-2 gap-2">
              {editTools.map((tool) => (
                <button
                  key={tool}
                  type="button"
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700"
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyStageBody label="선택된 이미지가 없습니다." />
      )}
    </Panel>
  );
}

function TextStage({
  project,
  onSelectDraft,
  onUpdateTextEnum,
  onUpdateTextField,
  onUpdateFinalText,
  onApplyRewritePreset
}: {
  project: Project;
  onSelectDraft: (draftId: string) => void;
  onUpdateTextEnum: (field: "channel" | "tone" | "length", value: string) => void;
  onUpdateTextField: (
    field: "mustInclude" | "preferred" | "forbidden" | "reference",
    value: string
  ) => void;
  onUpdateFinalText: (value: string) => void;
  onApplyRewritePreset: (
    mode: "shorter" | "calmer" | "descriptive" | "preserve"
  ) => void;
}) {
  const { textConfig } = project;

  return (
    <Panel title="텍스트 작성" subtitle="Step 2" className="border-0 bg-transparent p-0 shadow-none">
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
          <SelectField
            label="채널"
            value={textConfig.channel}
            options={channelLabels}
            onChange={(value) => onUpdateTextEnum("channel", value)}
          />
          <SelectField
            label="톤"
            value={textConfig.tone}
            options={toneLabels}
            onChange={(value) => onUpdateTextEnum("tone", value)}
          />
          <SelectField
            label="길이"
            value={textConfig.length}
            options={lengthLabels}
            onChange={(value) => onUpdateTextEnum("length", value)}
          />
        </div>

        <div className="space-y-3 rounded-[24px] bg-stone-50/90 p-4">
          <TextFieldGroup
            title="필수 포함"
            value={textConfig.mustInclude}
            onChange={(value) => onUpdateTextField("mustInclude", value)}
          />
          <TextFieldGroup
            title="우선 반영"
            value={textConfig.preferred}
            onChange={(value) => onUpdateTextField("preferred", value)}
          />
          <TextFieldGroup
            title="사용 금지"
            value={textConfig.forbidden}
            onChange={(value) => onUpdateTextField("forbidden", value)}
          />
          <TextFieldGroup
            title="참고 문장"
            value={textConfig.reference}
            onChange={(value) => onUpdateTextField("reference", value)}
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-stone-800">초안 선택</p>
          <div className="space-y-2">
            {project.drafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() => onSelectDraft(draft.id)}
                className={`w-full rounded-2xl border p-3 text-left ${
                  draft.selected
                    ? "border-teal-600 bg-teal-50/80"
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-stone-900">
                    {draft.title}
                  </span>
                  {draft.selected ? <Badge tone="accent">선택</Badge> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">{draft.body}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-stone-800">최종 결과물</p>
          <textarea
            value={project.finalText}
            onChange={(event) => onUpdateFinalText(event.target.value)}
            className="min-h-[220px] w-full rounded-[24px] border border-stone-200 bg-white px-4 py-4 text-sm leading-7 text-stone-700"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <GhostButton onClick={() => onApplyRewritePreset("shorter")}>
              더 짧게
            </GhostButton>
            <GhostButton onClick={() => onApplyRewritePreset("calmer")}>
              더 담백하게
            </GhostButton>
            <GhostButton onClick={() => onApplyRewritePreset("descriptive")}>
              더 설명형으로
            </GhostButton>
            <GhostButton onClick={() => onApplyRewritePreset("preserve")}>
              포함 단어 유지
            </GhostButton>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ReviewStage({
  project,
  images,
  onToggleChecklist
}: {
  project: Project;
  images: ProjectImage[];
  onToggleChecklist: (itemId: string) => void;
}) {
  const selectedCount = images.filter((image) => image.status === "selected").length;

  return (
    <Panel title="검수" subtitle="Step 3" className="border-0 bg-transparent p-0 shadow-none">
      <div className="space-y-4">
        <div className="rounded-[24px] bg-stone-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            Review Snapshot
          </p>
          <p className="mt-2 text-sm text-stone-700">
            선택 컷 {selectedCount}장, 전체 {images.length}장. 체크리스트만 빠르게
            점검하면 다음 단계로 넘어갈 수 있습니다.
          </p>
        </div>
        <div className="space-y-2">
          {project.checklist.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggleChecklist(item.id)}
                className="h-4 w-4"
              />
              <span className="text-sm text-stone-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ExportStage({
  project,
  presets,
  onTogglePreset
}: {
  project: Project;
  presets: ExportPreset[];
  onTogglePreset: (presetId: ExportPreset["id"]) => void;
}) {
  return (
    <Panel title="내보내기" subtitle="Step 4" className="border-0 bg-transparent p-0 shadow-none">
      <div className="space-y-5">
        <div className="rounded-[24px] bg-stone-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            저장 경로
          </p>
          <p className="mt-2 text-sm text-stone-700">
            `exports/{project.name.toLowerCase().replace(/\s+/g, "-")}/`
          </p>
        </div>
        <div className="rounded-[24px] bg-stone-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            파일명 규칙
          </p>
          <p className="mt-2 text-sm text-stone-700">
            `project-channel-seq.jpg` 형식으로 정리 예정
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium text-stone-800">내보내기 프리셋</p>
          <div className="space-y-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onTogglePreset(preset.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-stone-900">{preset.name}</p>
                  <p className="mt-1 text-xs text-stone-500">{preset.description}</p>
                </div>
                <Badge tone={preset.ready ? "success" : "muted"}>
                  {preset.ready ? "준비됨" : "대기"}
                </Badge>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white"
        >
          내보내기 실행
        </button>
      </div>
    </Panel>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
      >
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextFieldGroup({
  title,
  value,
  onChange
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm text-stone-700">
      <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
        {title}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-[78px] w-full rounded-2xl border border-stone-200 bg-white px-3 py-3"
      />
    </label>
  );
}

function EmptyStageBody({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-stone-50/90 px-4 py-4 text-sm text-stone-600">
      {label}
    </div>
  );
}

function buildNextTasks(
  project: Project | undefined,
  images: ProjectImage[],
  presets: ExportPreset[]
) {
  if (!project) {
    return [
      "프로젝트를 선택하세요.",
      "왼쪽에서 작업할 컷을 고르세요.",
      "오른쪽 단계에서 현재 작업을 이어가세요."
    ];
  }

  const tasks: string[] = [];
  const coverImage = images.find((image) => image.isCover);
  const unreviewedImage = images.find((image) => image.status === "unreviewed");
  const unchecked = project.checklist.find((item) => !item.checked);
  const waitingPreset = presets.find((preset) => !preset.ready);

  if (!coverImage) {
    tasks.push("대표컷을 먼저 확정하세요.");
  }
  if (unreviewedImage) {
    tasks.push(`"${unreviewedImage.name}" 상태를 정리하세요.`);
  }
  if (unchecked) {
    tasks.push(`검수 항목 "${unchecked.label}"를 확인하세요.`);
  }
  if (waitingPreset) {
    tasks.push(`${waitingPreset.name} 내보내기 준비를 마무리하세요.`);
  }
  if (tasks.length === 0) {
    tasks.push("이미지 정리 단계를 마지막으로 한 번 더 점검하세요.");
    tasks.push("텍스트 최종 문안을 검토하세요.");
    tasks.push("내보내기 실행 전 프리셋 상태를 확인하세요.");
  }

  return tasks.slice(0, 3);
}
