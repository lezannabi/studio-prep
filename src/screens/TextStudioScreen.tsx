import { channelLabels, lengthLabels, toneLabels } from "../lib/labels";
import { Project } from "../types/domain";
import { Badge, GhostButton, Panel } from "../components/ui";

interface TextStudioScreenProps {
  project?: Project;
  onSelectDraft: (draftId: string) => void;
  onUpdateEnum: (
    field: "channel" | "tone" | "length",
    value: string
  ) => void;
  onUpdateField: (
    field: "mustInclude" | "preferred" | "forbidden" | "reference",
    value: string
  ) => void;
  onUpdateFinalText: (value: string) => void;
  onApplyRewritePreset: (
    mode: "shorter" | "calmer" | "descriptive" | "preserve"
  ) => void;
}

export function TextStudioScreen({
  project,
  onSelectDraft,
  onUpdateEnum,
  onUpdateField,
  onUpdateFinalText,
  onApplyRewritePreset
}: TextStudioScreenProps) {
  if (!project) {
    return null;
  }

  const { textConfig } = project;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr]">
      <Panel title="AI 텍스트 생성 조건 UI" subtitle="Text Inputs">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-stone-700">
            <span>채널 선택</span>
            <select
              value={textConfig.channel}
              onChange={(event) => onUpdateEnum("channel", event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            >
              {Object.entries(channelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-stone-700">
            <span>톤 선택</span>
            <select
              value={textConfig.tone}
              onChange={(event) => onUpdateEnum("tone", event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            >
              {Object.entries(toneLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-stone-700">
            <span>길이 선택</span>
            <select
              value={textConfig.length}
              onChange={(event) => onUpdateEnum("length", event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3"
            >
              {Object.entries(lengthLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4">
          <TextAreaField
            label="반드시 포함할 단어/문구"
            value={textConfig.mustInclude}
            onChange={(value) => onUpdateField("mustInclude", value)}
          />
          <TextAreaField
            label="가능하면 반영할 단어/문구"
            value={textConfig.preferred}
            onChange={(value) => onUpdateField("preferred", value)}
          />
          <TextAreaField
            label="사용 금지 단어/문구"
            value={textConfig.forbidden}
            onChange={(value) => onUpdateField("forbidden", value)}
          />
          <TextAreaField
            label="참고 문장 입력"
            value={textConfig.reference}
            onChange={(value) => onUpdateField("reference", value)}
          />
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-800">초안 3개 표시</h3>
            <Badge tone="accent">Dummy Generation</Badge>
          </div>
          <div className="grid gap-3">
            {project.drafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() => onSelectDraft(draft.id)}
                className={`rounded-[24px] border p-4 text-left ${
                  draft.selected
                    ? "border-teal-600 bg-teal-50/70"
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-sm font-semibold text-stone-900">{draft.title}</h4>
                  {draft.selected ? <Badge tone="accent">선택됨</Badge> : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">{draft.body}</p>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="최종 편집" subtitle="Editing">
        <label className="block text-sm font-medium text-stone-800">
          최종 편집 textarea
          <textarea
            value={project.finalText}
            onChange={(event) => onUpdateFinalText(event.target.value)}
            className="mt-3 min-h-[320px] w-full rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700"
          />
        </label>

        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-stone-800">부분 재작성용 버튼 UI</p>
          <div className="flex flex-wrap gap-2">
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
              포함 단어 유지한 채 다시 쓰기
            </GhostButton>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] bg-stone-100/80 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
            Current Output Profile
          </p>
          <p className="mt-2 text-sm text-stone-700">
            {channelLabels[textConfig.channel]} · {toneLabels[textConfig.tone]} ·{" "}
            {lengthLabels[textConfig.length]}
          </p>
        </div>
      </Panel>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm text-stone-700">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-[96px] w-full rounded-[24px] border border-stone-200 bg-white px-4 py-3 leading-6"
      />
    </label>
  );
}
