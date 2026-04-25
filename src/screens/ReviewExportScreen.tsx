import { Project, ProjectImage, ExportPreset } from "../types/domain";
import { Badge, Panel } from "../components/ui";

interface ReviewExportScreenProps {
  project?: Project;
  images: ProjectImage[];
  presets: ExportPreset[];
  onToggleChecklist: (itemId: string) => void;
  onTogglePreset: (presetId: ExportPreset["id"]) => void;
}

export function ReviewExportScreen({
  project,
  images,
  presets,
  onToggleChecklist,
  onTogglePreset
}: ReviewExportScreenProps) {
  if (!project) {
    return null;
  }

  const selectedCount = images.filter((image) => image.status === "selected").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
      <Panel title="채널별 내보내기 프리셋 UI" subtitle="Export Presets">
        <div className="grid gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onTogglePreset(preset.id)}
              className="flex items-start justify-between rounded-[24px] border border-stone-200 bg-white p-4 text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-stone-900">{preset.name}</h3>
                <p className="mt-2 text-sm text-stone-600">{preset.description}</p>
              </div>
              <div className="ml-4 text-right">
                <Badge tone={preset.ready ? "success" : "warning"}>
                  {preset.ready ? "준비됨" : "대기"}
                </Badge>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">
                  {preset.aspectRatio}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel title="검수 체크리스트 UI" subtitle="Review">
          <div className="space-y-3">
            {project.checklist.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 rounded-[20px] border border-stone-200 bg-white px-4 py-3"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onToggleChecklist(item.id)}
                  className="h-4 w-4 rounded border-stone-300"
                />
                <span className="text-sm text-stone-700">{item.label}</span>
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="최종 점검 요약" subtitle="Summary">
          <div className="space-y-4">
            <div className="rounded-[24px] bg-stone-100/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                Export Summary
              </p>
              <p className="mt-2 text-sm text-stone-700">
                선택 이미지 {selectedCount}장, 전체 {images.length}장 기준으로 채널별 내보내기
                프리셋을 점검합니다.
              </p>
            </div>
            <div className="rounded-[24px] bg-[#1d2426] p-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-300/80">
                Final Copy
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-200">{project.finalText}</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
