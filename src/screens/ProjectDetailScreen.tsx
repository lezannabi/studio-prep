import { imageStatusLabels, imageTagLabels } from "../lib/labels";
import { ImageStatus, Project, ProjectImage } from "../types/domain";
import { ImageThumbnail } from "../components/ImageThumbnail";
import { Badge, GhostButton, Panel } from "../components/ui";

const statusOptions: ImageStatus[] = [
  "unreviewed",
  "candidate",
  "selected",
  "excluded",
  "exported"
];

const editTools = ["크롭", "회전", "밝기", "대비", "채도", "자동 보정"];

interface ProjectDetailScreenProps {
  project?: Project;
  images: ProjectImage[];
  selectedImage?: ProjectImage;
  selectedImageId: string;
  onSelectImage: (imageId: string) => void;
  onSetCover: (imageId: string) => void;
  onSetStatus: (imageId: string, status: ImageStatus) => void;
}

export function ProjectDetailScreen({
  project,
  images,
  selectedImage,
  selectedImageId,
  onSelectImage,
  onSetCover,
  onSetStatus
}: ProjectDetailScreenProps) {
  if (!project || !selectedImage) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Panel title="이미지 검토 및 기본 편집" subtitle="Project Detail">
          <div className="flex min-h-[430px] items-center justify-center rounded-[28px] border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
            <div>
              <p className="text-sm font-medium text-stone-800">이미지 없음</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                이 프로젝트에는 아직 연결된 더미 이미지가 없습니다. 다음 단계에서 로컬
                폴더 스캔과 썸네일 로더를 붙이면 이 영역에 실제 미리보기가 들어옵니다.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="이미지 목록" subtitle="Side Panel">
          <div className="rounded-[24px] bg-stone-100/80 p-4 text-sm text-stone-600">
            현재 표시할 이미지가 없습니다.
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
      <Panel
        title="이미지 검토 및 기본 편집"
        subtitle="Project Detail"
        action={<Badge tone="accent">{project.name}</Badge>}
      >
        <div
          className="flex min-h-[430px] flex-col justify-between rounded-[28px] p-6 text-white"
          style={{ background: selectedImage.background }}
        >
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                Large Preview
              </p>
              <h3 className="mt-2 text-3xl font-semibold">{selectedImage.shotLabel}</h3>
              <p className="mt-2 text-sm text-white/80">{selectedImage.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">{imageStatusLabels[selectedImage.status]}</Badge>
              {selectedImage.isCover ? <Badge tone="warning">대표컷</Badge> : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedImage.tags.map((tag) => (
                <Badge key={tag} tone={tag === "cover" ? "warning" : "muted"}>
                  {imageTagLabels[tag]}
                </Badge>
              ))}
            </div>
            <div className="rounded-[24px] bg-black/20 p-4 backdrop-blur-sm">
              <p className="text-sm leading-6 text-white/85">{selectedImage.note}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-stone-800">이미지 상태 표시</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <GhostButton
                  key={status}
                  active={selectedImage.status === status}
                  onClick={() => onSetStatus(selectedImage.id, status)}
                >
                  {imageStatusLabels[status]}
                </GhostButton>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-stone-800">대표컷 지정 UI</p>
            <div className="flex flex-wrap gap-2">
              <GhostButton
                active={selectedImage.isCover}
                onClick={() => onSetCover(selectedImage.id)}
              >
                대표컷으로 지정
              </GhostButton>
              <GhostButton>대표컷 비교 보기</GhostButton>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-stone-800">기본 편집 버튼 UI</p>
            <div className="grid gap-2 md:grid-cols-3">
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
      </Panel>

      <div className="space-y-6">
        <Panel title="이미지 목록" subtitle="Side Panel">
          <div className="space-y-3">
            {images.map((image) => (
              <ImageThumbnail
                key={image.id}
                image={image}
                active={image.id === selectedImageId}
                onClick={() => onSelectImage(image.id)}
              />
            ))}
          </div>
        </Panel>

        <Panel title="프로젝트 메모" subtitle="Context">
          <div className="rounded-[24px] bg-stone-100/80 p-4">
            <p className="text-sm text-stone-600">{project.notes}</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
