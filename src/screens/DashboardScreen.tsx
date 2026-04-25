import { ProjectEditorPanel } from "../components/ProjectEditorPanel";
import { Panel, StatCard } from "../components/ui";
import { ProjectCard } from "../components/ProjectCard";
import { Project, ProjectFormValues, StudioPrepData } from "../types/domain";

interface DashboardScreenProps {
  data: StudioPrepData;
  selectedProjectId: string;
  editorMode: "create" | "edit";
  projectForm: ProjectFormValues;
  onOpenProject: (projectId: string) => void;
  onSelectProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onProjectFormChange: (field: keyof ProjectFormValues, value: string) => void;
  onCreateProject: () => void;
  onUpdateProject: () => void;
  onDeleteProject: () => void;
  onStartCreateProject: () => void;
}

export function DashboardScreen({
  data,
  selectedProjectId,
  editorMode,
  projectForm,
  onOpenProject,
  onSelectProject,
  onEditProject,
  onProjectFormChange,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onStartCreateProject
}: DashboardScreenProps) {
  const imageCount = Object.keys(data.images).length;
  const reviewPendingCount = data.projects.filter(
    (project) => project.status === "review_pending"
  ).length;

  const selectedProject = data.projects.find(
    (project) => project.id === selectedProjectId
  ) as Project | undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 rounded-[32px] bg-[#1d2426] p-6 text-white xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-teal-300/80">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Studio Prep MVP Prototype</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300">
            실제 SQLite, 파일 시스템, AI API 연결 없이도 프로젝트 선정, 이미지 검토,
            텍스트 작성, 검수/내보내기 흐름을 자연스럽게 검증하는 더미 데이터 기반 UI입니다.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:w-[420px]">
          <StatCard label="Projects" value={data.projects.length} hint="작업 단위 목록" />
          <StatCard label="Images" value={imageCount} hint="미리보기 가능한 더미 컷" />
          <StatCard
            label="Review"
            value={reviewPendingCount}
            hint="검수 대기 프로젝트"
          />
          <StatCard label="Mode" value="MVP" hint="로컬 연동 없는 프로토타입" />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Panel title="프로젝트 목록" subtitle="Card Dashboard">
          <div className="grid gap-4 lg:grid-cols-2">
            {data.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                imageCount={project.imageIds.length}
                selected={project.id === selectedProjectId}
                onSelect={() => onSelectProject(project.id)}
                onEdit={() => onEditProject(project.id)}
                onOpen={() => onOpenProject(project.id)}
              />
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="선택된 프로젝트" subtitle="Side Panel">
            {selectedProject ? (
              <div className="space-y-4">
                <div className="rounded-[24px] bg-stone-100/90 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Selected
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-stone-900">
                    {selectedProject.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {selectedProject.notes}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                  <StatCard
                    label="Cover Candidate"
                    value={
                      data.projects
                        .find((project) => project.id === selectedProject.id)
                        ?.imageIds.filter((id) => data.images[id]?.isCover).length ?? 0
                    }
                    hint="대표컷 지정 UI와 연결"
                  />
                  <StatCard
                    label="Text Drafts"
                    value={selectedProject.drafts.length}
                    hint="초안 3개 비교 가능"
                  />
                </div>
              </div>
            ) : null}
          </Panel>

          <ProjectEditorPanel
            form={projectForm}
            mode={editorMode}
            canDelete={editorMode === "edit"}
            onChange={onProjectFormChange}
            onCreateMode={onStartCreateProject}
            onSubmit={editorMode === "create" ? onCreateProject : onUpdateProject}
            onDelete={onDeleteProject}
          />

          <Panel title="2차 확장 Placeholder" subtitle="Smart Store">
            <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-4">
              <p className="text-sm font-medium text-stone-800">
                스마트스토어 상세페이지 모드
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                세로형 섹션 구성, 상세페이지용 복사본, 제품 설명 조합, 섹션 템플릿 연결은
                2차 확장에서 구현합니다.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
